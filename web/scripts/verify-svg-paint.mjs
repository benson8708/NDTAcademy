#!/usr/bin/env node
// Paint-verifies filtered zero-extent elements (perfectly horizontal/vertical lines)
// in media-src/assets/*.svg against the Chrome filter-region collapse bug.
// Reveals everything (stroke-dashoffset -> 0, opacity 0 -> 0.95), then for each
// target element asserts that hiding it changes rendered pixels, i.e. it paints.
// Before the userSpaceOnUse fix such elements paint NOTHING in Chrome.
//
//   node scripts/verify-svg-paint.mjs [--shots dir] [name.svg ...]   (default: all)
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const ASSETS = join(webRoot, "media-src", "assets");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const shotsIdx = process.argv.indexOf("--shots");
const shotsDir = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null;
const suffix = process.argv.indexOf("--suffix") > -1 ? process.argv[process.argv.indexOf("--suffix") + 1] : "";
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const named = process.argv.slice(2).filter((a) => a.endsWith(".svg")).map((a) => basename(a));
const files = (named.length ? named : readdirSync(ASSETS).filter((f) => f.endsWith(".svg"))).sort();

const puppeteer = (await import("puppeteer-core")).default;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--force-color-profile=srgb", "--hide-scrollbars"] });
const page = await browser.newPage();

let pass = 0, fail = 0, failures = [];
for (const f of files) {
  const svg = readFileSync(join(ASSETS, f), "utf8");
  const vb = /viewBox="([\d.\s-]+)"/.exec(svg)?.[1].split(/\s+/).map(Number) ?? [0, 0, 600, 340];
  const scale = Math.min(2, 1600 / vb[2]);
  await page.setViewport({ width: Math.round(vb[2] * scale), height: Math.round(vb[3] * scale), deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:#08152b"><div style="width:${Math.round(vb[2] * scale)}px;height:${Math.round(vb[3] * scale)}px">${svg}</div></body></html>`,
    { waitUntil: "load" }
  );
  // reveal: draw paths to fully drawn, hidden groups/labels to visible
  const targets = await page.evaluate(() => {
    for (const el of document.querySelectorAll("[stroke-dashoffset]")) el.setAttribute("stroke-dashoffset", "0");
    for (const el of document.querySelectorAll('[opacity="0"]')) el.setAttribute("opacity", "0.95");
    const out = [];
    let n = 0;
    for (const el of document.querySelectorAll("[filter]")) {
      let bb;
      try { bb = el.getBBox(); } catch { continue; }
      const key = `__pv${n++}`;
      el.setAttribute("data-pv", key);
      if (bb.width === 0 || bb.height === 0)
        out.push({ key, id: el.id || null, tag: el.tagName.toLowerCase(), bbox: `${bb.width}x${bb.height}@(${bb.x},${bb.y})` });
    }
    return out;
  });
  const base = Buffer.from(await page.screenshot());
  if (shotsDir) writeFileSync(join(shotsDir, `${f.replace(".svg", "")}${suffix}.png`), base);
  for (const t of targets) {
    await page.evaluate((k) => { document.querySelector(`[data-pv="${k}"]`).style.visibility = "hidden"; }, t.key);
    const shot = Buffer.from(await page.screenshot());
    await page.evaluate((k) => { document.querySelector(`[data-pv="${k}"]`).style.visibility = ""; }, t.key);
    const paints = !base.equals(shot);
    if (paints) pass++;
    else { fail++; failures.push(`${f}: ${t.tag}${t.id ? "#" + t.id : ""} ${t.bbox}`); }
  }
}
await browser.close();
console.log(`zero-extent filtered elements painting: ${pass} PASS, ${fail} FAIL`);
if (failures.length) { console.log("NOT PAINTING:"); failures.forEach((x) => console.log("  " + x)); }
process.exit(fail ? 1 : 0);
