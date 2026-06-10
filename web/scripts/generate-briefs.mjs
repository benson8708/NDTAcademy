// Generates per-module authoring briefs from the curriculum JSON, mirroring
// the format used to produce the VT course.
//   node scripts/generate-briefs.mjs [courseId ...]   (default: the 7 unproduced courses)
// Output: web/content-spec/briefs/<moduleId>.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const briefsDir = join(webRoot, "content-spec", "briefs");
mkdirSync(briefsDir, { recursive: true });

const courses = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["ut", "rt", "mt", "pt", "et", "basic", "rad"];

let modules = 0, lessons = 0;
for (const courseId of courses) {
  const cur = JSON.parse(
    readFileSync(join(webRoot, "src", "data", "curriculum", `${courseId}.json`), "utf8"),
  );
  for (const level of cur.levels) {
    for (const mod of level.modules) {
      const brief = {
        courseId,
        courseName: cur.name,
        courseCode: cur.code,
        moduleId: mod.id,
        level: level.level,
        moduleTitle: mod.title,
        cpSection: mod.cpSection ?? null,
        lessons: mod.lessons.map((l) => ({
          lessonId: l.id,
          title: l.title,
          minutes: l.minutes,
          objectives: l.objectives,
          cp105Topics: l.topics,
          mediaTypes: [...new Set(l.media.map((m) => m.type))],
          needsInteractive: l.media.some((m) => m.type === "interactive" || m.type === "simulation"),
        })),
      };
      writeFileSync(join(briefsDir, `${mod.id}.json`), JSON.stringify(brief, null, 1));
      modules++;
      lessons += mod.lessons.length;
    }
  }
}
console.log(`wrote ${modules} module briefs covering ${lessons} lessons → ${briefsDir}`);
