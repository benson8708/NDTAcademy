#!/usr/bin/env node
// Renders every authored spec to mp4 (skips lessons already in explainer-drop unless --force).
//   node scripts/explainer-render-all.mjs [--force] [--concurrency 2]
import { readdirSync, existsSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const SPECS = join(webRoot, "media-src", "specs");
const DROP = join(webRoot, "media-build", "explainer-drop");
const force = process.argv.includes("--force");
const cIdx = process.argv.indexOf("--concurrency");
const CONC = cIdx > -1 ? parseInt(process.argv[cIdx + 1], 10) : 2;

// Positional args render an explicit id list (numbers are skipped — they
// belong to --concurrency); default is every authored spec.
const argIds = process.argv.slice(2).filter((a) => !a.startsWith("--") && !/^\d+$/.test(a));
const ids = (argIds.length ? argIds : readdirSync(SPECS).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort())
  .filter((id) => force || !existsSync(join(DROP, `${id}.mp4`)));
console.log(`rendering ${ids.length} lessons, concurrency ${CONC}`);

let next = 0, active = 0, done = 0, failed = [];
await new Promise((resolve) => {
  const pump = () => {
    while (active < CONC && next < ids.length) {
      const id = ids[next++];
      active++;
      const t0 = Date.now();
      const child = spawn("node", [join(here, "explainer-gen.mjs"), id, "full"], { stdio: ["ignore", "pipe", "pipe"] });
      let out = "";
      child.stdout.on("data", (d) => (out += d));
      child.stderr.on("data", (d) => (out += d));
      child.on("close", (code) => {
        active--; done++;
        const secs = Math.round((Date.now() - t0) / 1000);
        if (code === 0) console.log(`[${done}/${ids.length}] ${id} ok (${secs}s)`);
        else { failed.push(id); console.log(`[${done}/${ids.length}] ${id} FAILED (${secs}s)\n${out.split("\n").slice(-6).join("\n")}`); }
        if (done === ids.length) resolve(); else pump();
      });
    }
  };
  if (!ids.length) resolve(); else pump();
});
console.log(`\nrender complete: ${ids.length - failed.length}/${ids.length} ok${failed.length ? ` — FAILED: ${failed.join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
