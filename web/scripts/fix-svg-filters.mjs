#!/usr/bin/env node
// Fixes the Chrome zero-bbox filter-region collapse found by audit-svg-filters.mjs.
// For every filter referenced by a flagged element, converts the region to
// filterUnits="userSpaceOnUse" sized to the union of the LOCAL bboxes of all
// elements referencing that filter, padded by blur reach + 50 (covers ping
// circles animating r 6->40 at runtime). Blur appearance is unchanged
// (primitiveUnits stays userSpaceOnUse); the region just stops collapsing/clipping.
//
// Files modified by another process between read and write are skipped (logged as
// SKIPPED-RACE) — re-run until the audit comes back clean.
//
//   node scripts/fix-svg-filters.mjs <audit-report.json> [--dry]
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const ASSETS = join(webRoot, "media-src", "assets");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const report = JSON.parse(readFileSync(process.argv[2] ?? join(webRoot, "..", "audit-report.json"), "utf8"));
const dry = process.argv.includes("--dry");

const puppeteer = (await import("puppeteer-core")).default;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();

let changed = 0;
for (const entry of report) {
  const path = join(ASSETS, entry.file);
  const mtime0 = statSync(path).mtimeMs;
  let src = readFileSync(path, "utf8");
  const filterIds = [...new Set(entry.issues.map((i) => i.filter))];
  await page.setContent(`<!doctype html><html><body style="margin:0">${src}</body></html>`);
  const regions = await page.evaluate((ids) => {
    const out = {};
    for (const id of ids) {
      const filt = document.getElementById(id);
      let stdX = 0, stdY = 0, off = 0;
      for (const p of filt.querySelectorAll("feGaussianBlur, feDropShadow")) {
        const sd = (p.getAttribute("stdDeviation") || "0").trim().split(/[\s,]+/).map(parseFloat);
        stdX = Math.max(stdX, sd[0] || 0);
        stdY = Math.max(stdY, sd.length > 1 ? sd[1] : sd[0] || 0);
        off = Math.max(off, Math.abs(parseFloat(p.getAttribute("dx")) || 0), Math.abs(parseFloat(p.getAttribute("dy")) || 0));
      }
      let u = null, maxSw = 0;
      for (const el of document.querySelectorAll("[filter]")) {
        const m = /url\(["']?#([^"')]+)["']?\)/.exec(el.getAttribute("filter") || "");
        if (!m || m[1] !== id) continue;
        let bb;
        try { bb = el.getBBox(); } catch { continue; }
        const cs = getComputedStyle(el);
        if (cs.stroke && cs.stroke !== "none") maxSw = Math.max(maxSw, parseFloat(cs.strokeWidth) || 1);
        u = u
          ? { x0: Math.min(u.x0, bb.x), y0: Math.min(u.y0, bb.y), x1: Math.max(u.x1, bb.x + bb.width), y1: Math.max(u.y1, bb.y + bb.height) }
          : { x0: bb.x, y0: bb.y, x1: bb.x + bb.width, y1: bb.y + bb.height };
      }
      if (!u) continue;
      const reach = 3 * Math.max(stdX, stdY) + off + maxSw / 2;
      const margin = Math.ceil(reach) + 50;
      out[id] = {
        x: Math.floor(u.x0) - margin, y: Math.floor(u.y0) - margin,
        w: Math.ceil(u.x1 - u.x0) + 2 * margin, h: Math.ceil(u.y1 - u.y0) + 2 * margin,
      };
    }
    return out;
  }, filterIds);

  const lines = [];
  for (const id of filterIds) {
    const r = regions[id];
    if (!r) { lines.push(`  !! #${id}: no referencing elements found, skipped`); continue; }
    const re = new RegExp(`<filter id="${id}"[^>]*>`);
    const matches = src.match(new RegExp(re.source, "g")) || [];
    if (matches.length !== 1) { lines.push(`  !! #${id}: ${matches.length} open-tag matches, skipped`); continue; }
    src = src.replace(re, `<filter id="${id}" filterUnits="userSpaceOnUse" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}">`);
    lines.push(`  #${id} -> userSpaceOnUse x=${r.x} y=${r.y} w=${r.w} h=${r.h}`);
  }
  if (!dry && statSync(path).mtimeMs !== mtime0) {
    console.log(`${entry.file}\n  !! SKIPPED-RACE: file changed on disk while computing fix — re-run`);
    continue;
  }
  console.log(`${entry.file}\n${lines.join("\n")}`);
  if (!dry) { writeFileSync(path, src); changed++; }
}
await browser.close();
console.log(`\n${dry ? "DRY RUN — no files written" : `${changed} files rewritten`}`);
