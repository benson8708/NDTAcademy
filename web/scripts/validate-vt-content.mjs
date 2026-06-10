// Validates authored VT content against the spec + curriculum:
// counts, schema shape, figure files, SVG well-formedness, narration length.
// Run: node scripts/validate-vt-content.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const contentDir = join(webRoot, "src", "data", "content", "vt");
const figuresDir = join(webRoot, "public", "content", "vt", "figures");
const curriculum = JSON.parse(readFileSync(join(webRoot, "src", "data", "curriculum", "vt.json"), "utf8"));

const problems = [];
const warn = [];
let lessonsOk = 0, questionsTotal = 0, figuresTotal = 0, words = 0;

const validQuestion = (q, where) => {
  if (!q.question || typeof q.question !== "string") problems.push(`${where}: question text missing`);
  if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => !o)) problems.push(`${where}: needs exactly 4 non-empty options`);
  if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3) problems.push(`${where}: correct must be 0–3`);
  if (!q.explanation) problems.push(`${where}: explanation missing`);
};

for (const level of curriculum.levels) {
  for (const mod of level.modules) {
    // module quiz
    const quizPath = join(contentDir, `quiz-${mod.id}.json`);
    if (!existsSync(quizPath)) {
      problems.push(`MISSING module quiz: quiz-${mod.id}.json`);
    } else {
      try {
        const quiz = JSON.parse(readFileSync(quizPath, "utf8"));
        if (quiz.moduleId !== mod.id) problems.push(`quiz-${mod.id}: moduleId mismatch`);
        if (!Array.isArray(quiz.questions) || quiz.questions.length !== 10)
          problems.push(`quiz-${mod.id}: expected 10 questions, got ${quiz.questions?.length}`);
        (quiz.questions ?? []).forEach((q, i) => validQuestion(q, `quiz-${mod.id} q${i + 1}`));
        questionsTotal += quiz.questions?.length ?? 0;
      } catch (e) {
        problems.push(`quiz-${mod.id}: JSON parse error — ${e.message}`);
      }
    }

    for (const lesson of mod.lessons) {
      const p = join(contentDir, `${lesson.id}.json`);
      if (!existsSync(p)) {
        problems.push(`MISSING lesson: ${lesson.id}.json`);
        continue;
      }
      let c;
      try {
        c = JSON.parse(readFileSync(p, "utf8"));
      } catch (e) {
        problems.push(`${lesson.id}: JSON parse error — ${e.message}`);
        continue;
      }
      if (c.lessonId !== lesson.id) problems.push(`${lesson.id}: lessonId mismatch`);
      if (!Array.isArray(c.sections) || c.sections.length < 4) problems.push(`${lesson.id}: too few sections (${c.sections?.length})`);
      if (!Array.isArray(c.checkQuestions) || c.checkQuestions.length !== 5)
        problems.push(`${lesson.id}: expected 5 checkQuestions, got ${c.checkQuestions?.length}`);
      (c.checkQuestions ?? []).forEach((q, i) => validQuestion(q, `${lesson.id} check q${i + 1}`));
      questionsTotal += c.checkQuestions?.length ?? 0;

      const script = c.narrationScript ?? "";
      const w = script.split(/\s+/).filter(Boolean).length;
      words += w;
      if (w < 350) problems.push(`${lesson.id}: narrationScript too short (${w} words)`);
      else if (w < 500) warn.push(`${lesson.id}: narration on the short side (${w} words)`);
      if (/[#*`_]|\bFigure [A-Z]/.test(script)) warn.push(`${lesson.id}: narration may contain markdown/figure refs`);

      const needsInteractive = lesson.media.some((m) => m.type === "interactive");
      if (needsInteractive && !c.interactive) problems.push(`${lesson.id}: interactive required but null`);
      if (c.interactive) {
        const t = c.interactive.type;
        if (!["scenario", "hotspot", "sort", "calculator"].includes(t)) problems.push(`${lesson.id}: bad interactive type ${t}`);
        if (t === "hotspot") {
          const fig = (c.figures ?? []).find((f) => f.id === c.interactive.figureId);
          if (!fig) problems.push(`${lesson.id}: hotspot figureId not in figures`);
          if (!(c.interactive.regions ?? []).some((r) => r.isTarget)) problems.push(`${lesson.id}: hotspot has no target region`);
        }
        if (t === "sort") {
          (c.interactive.items ?? []).forEach((it, i) => {
            if (it.bucket >= (c.interactive.buckets?.length ?? 0)) problems.push(`${lesson.id}: sort item ${i} bucket out of range`);
          });
        }
        if (t === "scenario") {
          (c.interactive.steps ?? []).forEach((s, i) => {
            if (typeof s.correct !== "number" || s.correct >= (s.options?.length ?? 0)) problems.push(`${lesson.id}: scenario step ${i} correct out of range`);
          });
        }
      }

      // figures: declared ↔ files ↔ references
      const declared = new Set((c.figures ?? []).map((f) => f.id));
      const referenced = new Set(c.sections.filter((s) => s.type === "figure").map((s) => s.figureId));
      if (c.interactive?.type === "hotspot") referenced.add(c.interactive.figureId);
      for (const f of c.figures ?? []) {
        figuresTotal++;
        const fp = join(figuresDir, f.file);
        if (!existsSync(fp)) {
          problems.push(`${lesson.id}: figure file missing ${f.file}`);
          continue;
        }
        const svg = readFileSync(fp, "utf8");
        if (!svg.includes("<svg")) problems.push(`${lesson.id}: ${f.file} is not an SVG`);
        if (!/viewBox="0 0 800 450"/.test(svg)) warn.push(`${lesson.id}: ${f.file} non-standard viewBox`);
        if (/<image|<script|href=/.test(svg)) problems.push(`${lesson.id}: ${f.file} contains forbidden elements`);
        const opens = (svg.match(/<([a-zA-Z][\w-]*)/g) ?? []).length;
        const closes = (svg.match(/<\/([a-zA-Z][\w-]*)>/g) ?? []).length + (svg.match(/\/>/g) ?? []).length;
        if (Math.abs(opens - closes) > 2) warn.push(`${lesson.id}: ${f.file} may be malformed (tags ${opens}/${closes})`);
        if (!referenced.has(f.id)) warn.push(`${lesson.id}: figure ${f.id} declared but never referenced`);
      }
      for (const r of referenced) {
        if (r && !declared.has(r)) problems.push(`${lesson.id}: section references undeclared figure ${r}`);
      }
      lessonsOk++;
    }
  }
}

const orphans = readdirSync(contentDir).filter((f) => f.endsWith(".json"))
  .filter((f) => {
    const id = f.replace(".json", "");
    if (id.startsWith("quiz-")) return !curriculum.levels.some((L) => L.modules.some((m) => `quiz-${m.id}.json` === f));
    return !curriculum.levels.some((L) => L.modules.some((m) => m.lessons.some((l) => l.id === id)));
  });
orphans.forEach((f) => warn.push(`orphan content file: ${f}`));

console.log(`lessons present: ${lessonsOk}/30 · questions: ${questionsTotal} · figures: ${figuresTotal} · narration words: ${words.toLocaleString()}`);
if (warn.length) console.log(`\nWARNINGS (${warn.length}):\n` + warn.map((w) => `  - ${w}`).join("\n"));
if (problems.length) {
  console.log(`\nPROBLEMS (${problems.length}):\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log("\nALL CONTENT VALID");
