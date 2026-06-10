// Test helper: prints a JSON map of { questionText -> correctIndex } over all
// authored VT questions (lesson checks + module quizzes). The E2E browser
// driver injects this map to answer rendered assessments deterministically.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "content", "vt");
const map = {};
for (const f of readdirSync(contentDir).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(readFileSync(join(contentDir, f), "utf8"));
  for (const q of data.checkQuestions ?? data.questions ?? []) map[q.question] = q.correct;
}
console.log(JSON.stringify(map));
