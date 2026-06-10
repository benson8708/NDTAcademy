// Uploads built lesson videos to the Supabase Storage public bucket
// "vt-media" and writes the URL manifest the lesson pages read.
//   node scripts/upload-videos.mjs [--force]
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const videosDir = join(webRoot, "media-build", "videos");
const manifestPath = join(webRoot, "src", "data", "content", "vt", "videos.json");

const env = (name) => {
  if (process.env[name]) return process.env[name];
  const line = readFileSync(join(webRoot, ".env.local"), "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : undefined;
};
const URL_BASE = env("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE = env("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "vt-media";

async function api(path, init = {}) {
  const resp = await fetch(`${URL_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, ...(init.headers ?? {}) },
  });
  return resp;
}

// Ensure public bucket exists
{
  const resp = await api("/storage/v1/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (resp.ok) console.log(`bucket ${BUCKET} created`);
  else {
    const body = await resp.text();
    if (/already exists|Duplicate/i.test(body)) console.log(`bucket ${BUCKET} exists`);
    else { console.error("bucket error:", body.slice(0, 300)); process.exit(1); }
  }
}

const force = process.argv.includes("--force");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const files = existsSync(videosDir) ? readdirSync(videosDir).filter((f) => f.endsWith(".mp4")) : [];
let up = 0, skipped = 0, failed = 0;

for (const f of files) {
  const lessonId = f.replace(".mp4", "");
  if (manifest[lessonId] && !force) { skipped++; continue; }
  const body = readFileSync(join(videosDir, f));
  process.stdout.write(`upload ${f} (${Math.round(body.length / 1048576)} MB)… `);
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    const resp = await api(`/storage/v1/object/${BUCKET}/videos/${f}`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4", "x-upsert": "true" },
      body,
    });
    if (resp.ok) {
      manifest[lessonId] = `${URL_BASE}/storage/v1/object/public/${BUCKET}/videos/${f}`;
      console.log("ok");
      up++; ok = true;
    } else {
      console.log(`attempt ${attempt}: HTTP ${resp.status} ${(await resp.text()).slice(0, 120)}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  if (!ok) failed++;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`\ndone: ${up} uploaded, ${skipped} already in manifest, ${failed} failed · manifest has ${Object.keys(manifest).length} entries`);
process.exit(failed ? 1 : 0);
