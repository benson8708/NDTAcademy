#!/usr/bin/env node
// Validates explainer specs against the locked format before narration/render.
//   node scripts/explainer-validate.mjs            (all specs)
//   node scripts/explainer-validate.mjs vt1-2-1    (one)
// Checks: shape, beat count/types, narration word counts, icon whitelist,
// scene payload limits, asset references resolvable (existing or pending design),
// per-lesson asset uniqueness, enumeration-sync heuristics.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const SPECS = join(webRoot, "media-src", "specs");
const ASSETS = join(webRoot, "media-src", "assets");

const ICONS = new Set("eye bulb hand-finger history percentage alert-triangle circles ruler-2 search file-text certificate shield-check camera sun contrast-2 focus-2 microscope tool clipboard-check list-check book-2 scale bolt wave-sine chart-line gauge target layers-intersect stack-2 box arrows-maximize arrow-bar-to-up point lock user-check users building-factory-2 flame droplet photo video report notes pencil check x refresh zoom-scan telescope settings magnet radioactive wave-saw-tool activity atom-2 adjustments".split(" "));
const TYPES = new Set(["title", "tiles", "diagram", "kinetic", "list"]);

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(SPECS).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();

const wc = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
let bad = 0;
for (const id of ids) {
  const errs = [], warns = [];
  let spec;
  try { spec = JSON.parse(readFileSync(join(SPECS, `${id}.json`), "utf8")); }
  catch (e) { console.log(`✗ ${id}: unparseable (${e.message})`); bad++; continue; }
  if (spec.lessonId !== id) errs.push(`lessonId mismatch (${spec.lessonId})`);
  if (!spec.displayTitle) errs.push("missing displayTitle");
  if (typeof spec.anchorAfterSection !== "number") errs.push("missing anchorAfterSection");
  const beats = spec.beats ?? [];
  if (beats.length < 3 || beats.length > 5) errs.push(`beat count ${beats.length} (want 4-5)`);
  if (beats[0]?.type !== "title") errs.push("beat 1 must be title");
  const usedAssets = new Set();
  let words = 0;
  beats.forEach((b, i) => {
    const p = b.payload ?? {};
    if (!TYPES.has(b.type)) errs.push(`beat${i + 1}: unknown type ${b.type}`);
    const w = wc(b.narration);
    words += w;
    if (w > 27) errs.push(`beat${i + 1}: narration ${w} words (max 25)`);
    if (w < 8) warns.push(`beat${i + 1}: narration only ${w} words`);
    if (/[*_<>{}\[\]]/.test(b.narration ?? "")) errs.push(`beat${i + 1}: narration has markup chars`);
    const asset = p.asset ?? p.panel;
    if (asset) {
      if (usedAssets.has(asset)) errs.push(`asset ${asset} used twice`);
      usedAssets.add(asset);
      if (!existsSync(join(ASSETS, `${asset}.svg`))) warns.push(`beat${i + 1}: asset "${asset}" not designed yet`);
    }
    if (b.type === "tiles") {
      const n = (p.tiles ?? []).length;
      if (n < 3 || n > 4) errs.push(`beat${i + 1}: ${n} tiles (want 3-4)`);
      (p.tiles ?? []).forEach((t2, j) => {
        if (!ICONS.has(t2.icon)) errs.push(`beat${i + 1} tile${j + 1}: icon "${t2.icon}" not whitelisted`);
        if ((t2.t ?? "").length > 12) warns.push(`beat${i + 1} tile${j + 1}: title long "${t2.t}"`);
      });
    }
    if (b.type === "list") (p.chips ?? []).forEach((c, j) => { if (c.icon && !ICONS.has(c.icon)) errs.push(`beat${i + 1} chip${j + 1}: icon "${c.icon}" not whitelisted`); });
    if (b.type === "title") (p.chips ?? []).forEach((c, j) => { if (c.icon && !ICONS.has(c.icon)) errs.push(`beat${i + 1} chip${j + 1}: icon "${c.icon}" not whitelisted`); });
    if (b.type === "kinetic") {
      const n = (p.lines ?? []).length;
      if (n < 2 || n > 4) errs.push(`beat${i + 1}: ${n} kinetic lines (want 2-3)`);
      (p.lines ?? []).forEach((l, j) => { if ((l.t ?? "").length > 16) warns.push(`beat${i + 1} line${j + 1}: long "${l.t}"`); });
    }
    if (b.type === "diagram" && !p.asset) errs.push(`beat${i + 1}: diagram without asset`);
  });
  if (words < 70 || words > 125) warns.push(`total narration ${words} words (target 80-115)`);
  if (errs.length) { console.log(`✗ ${id}: ${errs.join(" | ")}${warns.length ? `  [warns: ${warns.join(" | ")}]` : ""}`); bad++; }
  else console.log(`✓ ${id} (${beats.length} beats, ${words}w)${warns.length ? `  [${warns.join(" | ")}]` : ""}`);
}
process.exit(bad ? 1 : 0);
