#!/usr/bin/env node
// Pre-renders Titan (ElevenLabs v3) voiceover for every reading slide and the
// quiz question/intro slides, content-addressed so the lesson player can look
// each up by the same key (src/lib/slideNarration.mjs). Uploads to Supabase
// vt-media/slide-audio/<key>.mp3 and writes src/data/content/<course>/slide-audio.json.
//
//   node scripts/explainer-slide-narrate.mjs [--course vt] [--only vt1-1-1 ...] [--dry]
//
// Idempotent: a key already in the manifest is skipped (audio reused across
// lessons/courses when identical text appears).
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { narrationText, djb2 } from "../src/lib/slideNarration.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const COURSE = arg("--course", "vt");
const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv.slice(onlyIdx + 1).filter((a) => !a.startsWith("--")) : null;

const env = (n) => {
  if (process.env[n]) return process.env[n];
  const line = readFileSync(join(webRoot, ".env.local"), "utf8").split("\n").find((l) => l.startsWith(`${n}=`));
  return line ? line.slice(n.length + 1).trim() : undefined;
};
const EL_KEY = env("ELEVENLABS_API_KEY");
const VOICE = env("ELEVENLABS_VOICE_ID") || "dtSEyYGNJqjrtBArPCVZ";
const SB_URL = env("NEXT_PUBLIC_SUPABASE_URL");
const SB_SVC = env("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "vt-media";
if (!EL_KEY || !SB_URL || !SB_SVC) { console.error("missing env (ELEVENLABS_API_KEY / SUPABASE_*)"); process.exit(2); }

const contentDir = join(webRoot, "src", "data", "content", COURSE);
const manifestPath = join(contentDir, "slide-audio.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};

const curriculum = JSON.parse(readFileSync(join(webRoot, "src", "data", "curriculum", `${COURSE}.json`), "utf8"));
const objectivesById = new Map();
for (const L of curriculum.levels) for (const m of L.modules) for (const l of m.lessons) objectivesById.set(l.id, l.objectives || []);

// Mirror buildSteps' text-slide construction so narrationText() yields identical
// strings (and therefore keys) to what the player computes from the steps.
function textStepsForLesson(content) {
  const steps = [];
  steps.push({ kind: "intro", title: content.title, objectives: objectivesById.get(content.lessonId) || [] });
  const secs = content.sections;
  const used = new Set();
  const figById = new Map((content.figures || []).map((f) => [f.id, f]));
  for (let i = 0; i < secs.length; i++) {
    if (used.has(i)) continue;
    const s = secs[i];
    if (s.type === "text") {
      const nxt = secs[i + 1];
      let callout = null;
      if (nxt?.type === "figure" && nxt.figureId && figById.has(nxt.figureId)) used.add(i + 1);
      else if (nxt?.type === "callout") { callout = { variant: nxt.variant ?? "standard", title: nxt.title ?? "", body: nxt.body ?? "" }; used.add(i + 1); }
      steps.push({ kind: "concept", heading: s.heading ?? "", body: s.body ?? "", callout });
    } else if (s.type === "figure" && s.figureId && figById.has(s.figureId)) {
      steps.push({ kind: "concept", heading: figById.get(s.figureId).title, body: s.caption ?? "", callout: null });
    } else if (s.type === "callout") {
      steps.push({ kind: "concept", heading: s.title ?? "Key point", body: s.body ?? "", callout: { variant: s.variant ?? "standard", title: s.title ?? "", body: s.body ?? "" } });
    } else if (s.type === "table") {
      steps.push({ kind: "table", caption: s.caption ?? "", headers: s.headers ?? [] });
    }
  }
  const cq = content.checkQuestions || [];
  steps.push({ kind: "quizIntro", questionCount: cq.length, passPct: 80 });
  cq.forEach((q, i) => steps.push({ kind: "question", question: q, index: i, total: cq.length }));
  return steps;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

// gather unique (key,text) across selected lessons
const lessonIdSet = new Set([...objectivesById.keys()]);
const lessonFiles = readdirSync(contentDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((id) => lessonIdSet.has(id))
  .filter((id) => !ONLY || ONLY.includes(id))
  .sort();

const wanted = new Map(); // key -> text
let totalChars = 0;
for (const id of lessonFiles) {
  const content = JSON.parse(readFileSync(join(contentDir, `${id}.json`), "utf8"));
  for (const step of textStepsForLesson(content)) {
    const text = narrationText(step);
    if (!text) continue;
    const key = djb2(text);
    if (!wanted.has(key)) { wanted.set(key, text); }
  }
}
const todo = [...wanted.entries()].filter(([k]) => !manifest[k]);
for (const [, t] of todo) totalChars += t.length;
console.log(`${COURSE}: ${lessonFiles.length} lessons, ${wanted.size} unique slides, ${todo.length} to generate (~${totalChars.toLocaleString()} chars)${DRY ? " [dry]" : ""}`);
if (DRY) process.exit(0);

const tmp = join(webRoot, "media-build", "slide-audio-tmp");
execFileSync("mkdir", ["-p", tmp]);
let made = 0, failed = 0;
for (const [key, text] of todo) {
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": EL_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ text, model_id: "eleven_v3", voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true } }),
      });
      if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 140)}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 6000) throw new Error(`tiny audio ${buf.length}B`);
      const f = join(tmp, `${key}.mp3`);
      writeFileSync(f, buf);
      const up = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/slide-audio/${key}.mp3`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SB_SVC}`, apikey: SB_SVC, "Content-Type": "audio/mpeg", "x-upsert": "true" },
        body: buf,
      });
      if (!up.ok) throw new Error(`upload ${up.status}: ${(await up.text()).slice(0, 120)}`);
      manifest[key] = `${SB_URL}/storage/v1/object/public/${BUCKET}/slide-audio/${key}.mp3`;
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
      made++; ok = true;
      if (made % 20 === 0) console.log(`  ${made}/${todo.length} (${probe(f).toFixed(1)}s last)`);
    } catch (e) {
      if (attempt === 3) console.log(`! ${key}: ${e.message}`);
      await sleep(1500 * attempt);
    }
  }
  if (!ok) failed++;
  await sleep(200);
}
console.log(`done: ${made} generated, ${failed} failed · manifest has ${Object.keys(manifest).length} clips`);
process.exit(failed ? 1 : 0);
