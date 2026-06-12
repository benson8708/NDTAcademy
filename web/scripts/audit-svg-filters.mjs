#!/usr/bin/env node
// Audits media-src/assets/*.svg for the Chrome zero-bbox filter-region collapse bug:
// an element whose bounding box has zero width or height (perfectly horizontal/vertical
// line) referencing a filter with default objectBoundingBox percentage region does not
// render AT ALL in Chrome (empty filter region). Near-zero bboxes clip the glow falloff.
//
//   node scripts/audit-svg-filters.mjs [--json out.json]
//
// Severities:
//   INVISIBLE  bbox width or height is 0 -> element not painted
//   CLIPPED    percentage region smaller than blur reach (3*stdDev + stroke/2) -> glow cut
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const ASSETS = join(webRoot, "media-src", "assets");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const jsonIdx = process.argv.indexOf("--json");
const jsonOut = jsonIdx > -1 ? process.argv[jsonIdx + 1] : null;

const files = readdirSync(ASSETS).filter((f) => f.endsWith(".svg")).sort();
const puppeteer = (await import("puppeteer-core")).default;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();

const report = [];
for (const f of files) {
  const svg = readFileSync(join(ASSETS, f), "utf8");
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  const issues = await page.evaluate(() => {
    const out = [];
    const num = (v, dflt) => {
      if (v == null || v === "") return dflt;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : dflt;
    };
    for (const el of document.querySelectorAll("[filter]")) {
      const m = /url\(["']?#([^"')]+)["']?\)/.exec(el.getAttribute("filter") || "");
      if (!m) continue;
      const filt = document.getElementById(m[1]);
      if (!filt || filt.tagName.toLowerCase() !== "filter") continue;
      let bb;
      try { bb = el.getBBox(); } catch { continue; }
      const units = filt.getAttribute("filterUnits") || "objectBoundingBox";
      // blur reach: 3*stdDeviation covers ~99.7% of the gaussian, plus stroke overhang
      let stdX = 0, stdY = 0, off = 0;
      for (const p of filt.querySelectorAll("feGaussianBlur, feDropShadow")) {
        const sd = (p.getAttribute("stdDeviation") || "0").trim().split(/[\s,]+/).map(parseFloat);
        stdX = Math.max(stdX, sd[0] || 0);
        stdY = Math.max(stdY, sd.length > 1 ? sd[1] : sd[0] || 0);
        off = Math.max(off, Math.abs(num(p.getAttribute("dx"), 0)), Math.abs(num(p.getAttribute("dy"), 0)));
      }
      const cs = getComputedStyle(el);
      const sw = cs.stroke && cs.stroke !== "none" ? num(cs.strokeWidth, 1) : 0;
      const reachX = 3 * stdX + off + sw / 2;
      const reachY = 3 * stdY + off + sw / 2;
      const rec = {
        id: el.id || null, tag: el.tagName.toLowerCase(),
        bbox: { x: +bb.x.toFixed(1), y: +bb.y.toFixed(1), w: +bb.width.toFixed(1), h: +bb.height.toFixed(1) },
        filter: m[1], units, stdDeviation: Math.max(stdX, stdY), strokeWidth: sw,
        snippet: (el.outerHTML.split(">")[0] + ">").slice(0, 140),
      };
      if (units === "objectBoundingBox") {
        const pct = (attr, dflt) => {
          const v = filt.getAttribute(attr);
          if (v == null) return dflt;
          return v.includes("%") ? parseFloat(v) / 100 : parseFloat(v);
        };
        const fx = pct("x", -0.1), fy = pct("y", -0.1), fw = pct("width", 1.2), fh = pct("height", 1.2);
        if (bb.width === 0 || bb.height === 0) {
          out.push({ ...rec, severity: "INVISIBLE", detail: "zero-extent bbox -> empty filter region, element not rendered" });
          continue;
        }
        // padding the percentage region adds on each side, in user units
        const padL = -fx * bb.width, padR = (fx + fw - 1) * bb.width;
        const padT = -fy * bb.height, padB = (fy + fh - 1) * bb.height;
        const clipX = Math.max(reachX - padL, reachX - padR);
        const clipY = Math.max(reachY - padT, reachY - padB);
        if (clipX > 0.5 || clipY > 0.5)
          out.push({ ...rec, severity: "CLIPPED", detail: `glow reach x=${reachX.toFixed(1)} y=${reachY.toFixed(1)} vs region pad x=${Math.min(padL, padR).toFixed(1)} y=${Math.min(padT, padB).toFixed(1)}` });
      } else {
        // userSpaceOnUse: region must contain bbox expanded by reach
        const fx = num(filt.getAttribute("x"), -Infinity), fy = num(filt.getAttribute("y"), -Infinity);
        const fw = num(filt.getAttribute("width"), Infinity), fh = num(filt.getAttribute("height"), Infinity);
        const ok = fx <= bb.x - reachX && fy <= bb.y - reachY && fx + fw >= bb.x + bb.width + reachX && fy + fh >= bb.y + bb.height + reachY;
        if (!ok) out.push({ ...rec, severity: "CLIPPED-USO", detail: "userSpaceOnUse region does not contain bbox+blur reach (check transforms/local space)" });
      }
    }
    return out;
  });
  if (issues.length) report.push({ file: f, issues });
}
await browser.close();

let inv = 0, clip = 0;
for (const r of report) {
  console.log(`\n${r.file}`);
  for (const i of r.issues) {
    if (i.severity === "INVISIBLE") inv++; else clip++;
    console.log(`  [${i.severity}] ${i.tag}${i.id ? "#" + i.id : ""} bbox=${i.bbox.w}x${i.bbox.h}@(${i.bbox.x},${i.bbox.y}) filter=#${i.filter} std=${i.stdDeviation} sw=${i.strokeWidth}`);
    console.log(`      ${i.detail}`);
  }
}
console.log(`\n${report.length}/${files.length} files affected — ${inv} INVISIBLE, ${clip} CLIPPED`);
if (jsonOut) { writeFileSync(jsonOut, JSON.stringify(report, null, 2)); console.log(`json -> ${jsonOut}`); }
