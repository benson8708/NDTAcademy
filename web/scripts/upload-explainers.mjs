// Uploads exported Knowlify explainer MP4s to the Supabase Storage public
// bucket "vt-media" under explainers/ and writes the manifest the lesson
// player reads (lessonExplainers -> buildSteps splices them after their
// anchored section).
//
//   1. Export each video from the Knowlify dashboard (Export -> MP4).
//   2. Save it into media-build/explainer-drop/ named <lessonId>.mp4
//      (e.g. vt1-1-1.mp4). See scripts/explainer-export-guide.txt for the
//      lesson <-> dashboard-title <-> filename mapping.
//   3. node scripts/upload-explainers.mjs
//
// Idempotent: re-run any time you add more files; --force re-uploads existing.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const dropDir = join(webRoot, "media-build", "explainer-drop");
const planPath = join(webRoot, "media-build", "explainer-plan.json");
const manifestPath = join(webRoot, "src", "data", "content", "vt", "explainers.json");

const env = (name) => {
  if (process.env[name]) return process.env[name];
  const line = readFileSync(join(webRoot, ".env.local"), "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : undefined;
};
const URL_BASE = env("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE = env("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "vt-media";

if (!existsSync(dropDir)) mkdirSync(dropDir, { recursive: true });
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const planById = new Map(plan.items.map((it) => [it.lessonId, it]));
// Authored specs (media-src/specs) take precedence for title + anchor.
const specsDir = join(webRoot, "media-src", "specs");
const specMeta = (id) => {
  const p = join(specsDir, `${id}.json`);
  if (!existsSync(p)) return null;
  const s = JSON.parse(readFileSync(p, "utf8"));
  return { title: s.displayTitle, afterSection: s.anchorAfterSection };
};

const api = (path, init = {}) =>
  fetch(`${URL_BASE}${path}`, { ...init, headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, ...(init.headers ?? {}) } });

// bucket already exists (teaching videos live here) — create defensively
{
  const r = await api("/storage/v1/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!r.ok) { const b = await r.text(); if (!/already exists|Duplicate/i.test(b)) { console.error("bucket error:", b.slice(0, 200)); process.exit(1); } }
}

const force = process.argv.includes("--force");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const files = readdirSync(dropDir).filter((f) => f.endsWith(".mp4"));
if (!files.length) {
  console.log(`No MP4s in ${dropDir}.\nExport from Knowlify, save as <lessonId>.mp4 (see scripts/explainer-export-guide.txt), then re-run.`);
  process.exit(0);
}

let up = 0, skipped = 0, failed = 0;
for (const f of files) {
  const lessonId = f.replace(/\.mp4$/, "");
  const plan = specMeta(lessonId) ?? planById.get(lessonId);
  if (!plan) { console.log(`! ${f}: no spec or plan entry for "${lessonId}" — filename must be a lessonId; skipping`); failed++; continue; }
  if (manifest[lessonId] && !force) { skipped++; continue; }
  const body = readFileSync(join(dropDir, f));
  process.stdout.write(`upload ${f} (${Math.round(body.length / 1048576)} MB)… `);
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    const r = await api(`/storage/v1/object/${BUCKET}/explainers/${f}`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4", "x-upsert": "true" },
      body,
    });
    if (r.ok) {
      manifest[lessonId] = [{
        uuid: `${lessonId}-explainer`,
        url: `${URL_BASE}/storage/v1/object/public/${BUCKET}/explainers/${f}`,
        title: plan.title,
        afterSection: plan.afterSection,
      }];
      console.log("ok"); up++; ok = true;
    } else {
      console.log(`attempt ${attempt}: HTTP ${r.status} ${(await r.text()).slice(0, 120)}`);
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
  if (!ok) failed++;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`\ndone: ${up} uploaded, ${skipped} already in manifest, ${failed} failed · manifest has ${Object.keys(manifest).length} lessons`);
