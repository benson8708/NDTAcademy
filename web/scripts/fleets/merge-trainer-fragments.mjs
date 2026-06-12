#!/usr/bin/env node
// Merges src/data/content/<cid>/trainer-fragments/*.json into trainers.json,
// validating engine/mode/taskIds against the engine manifests when the
// media-build mirrors exist. Fragment files are written one-per-module by
// fleet agents so no two agents ever touch the same file.
//   node scripts/fleets/merge-trainer-fragments.mjs <courseId> [more...]
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifests = {};
const mDir = join(web, "media-build", "trainer-manifests");
if (existsSync(mDir))
  for (const f of readdirSync(mDir).filter((f) => f.endsWith(".json")))
    manifests[f.replace(".json", "")] = JSON.parse(readFileSync(join(mDir, f), "utf8"));

for (const cid of process.argv.slice(2)) {
  const dir = join(web, "src", "data", "content", cid, "trainer-fragments");
  if (!existsSync(dir)) { console.log(`${cid}: no fragments dir`); continue; }
  const merged = {};
  let errs = 0;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const frag = JSON.parse(readFileSync(join(dir, f), "utf8"));
    for (const [lessonId, cfg] of Object.entries(frag)) {
      const man = manifests[cfg.engine];
      if (man) {
        const mode = (man.modes ?? []).find((m) => m.id === cfg.mode);
        if (!mode) { console.log(`✗ ${lessonId}: engine ${cfg.engine} has no mode ${cfg.mode}`); errs++; continue; }
        const badTask = (cfg.tasks ?? []).find((t) => !(mode.taskIds ?? []).includes(t));
        if (badTask) { console.log(`✗ ${lessonId}: mode ${cfg.mode} has no task ${badTask}`); errs++; continue; }
      }
      if (merged[lessonId]) { console.log(`✗ ${lessonId}: duplicate config (also in another fragment)`); errs++; continue; }
      merged[lessonId] = cfg;
    }
  }
  const out = Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(web, "src", "data", "content", cid, "trainers.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`${cid}: merged ${Object.keys(out).length} configs${errs ? ` (${errs} rejected)` : ""}`);
}
