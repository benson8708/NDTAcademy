// Generates lesson voiceovers from each lesson's narrationScript via the
// ElevenLabs API into web/public/audio/vt/<lessonId>.mp3.
//
//   ELEVENLABS_API_KEY=...  node scripts/generate-narration.mjs [--only vt1-1-1] [--force]
//
// Reads the key from the environment or web/.env.local. Skips lessons whose
// mp3 already exists unless --force. Voice defaults to "Brian" (professional
// narration); override with ELEVENLABS_VOICE_ID.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const contentDir = join(webRoot, "src", "data", "content", "vt");
const audioDir = join(webRoot, "public", "audio", "vt");
mkdirSync(audioDir, { recursive: true });

function envFromDotfile(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(join(webRoot, ".env.local"), "utf8")
      .split("\n")
      .find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const API_KEY = envFromDotfile("ELEVENLABS_API_KEY");
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY not set (env or web/.env.local). Aborting.");
  process.exit(2);
}
const VOICE_ID = envFromDotfile("ELEVENLABS_VOICE_ID") || "nPczCjzI2devNBz1zQrb"; // Brian
const MODEL_ID = envFromDotfile("ELEVENLABS_MODEL_ID") || "eleven_turbo_v2_5";

const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const force = process.argv.includes("--force");

const lessons = readdirSync(contentDir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("quiz-"))
  .map((f) => f.replace(".json", ""))
  .filter((id) => !only || id === only)
  .sort();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let made = 0, skipped = 0, failed = 0, chars = 0;

for (const id of lessons) {
  const out = join(audioDir, `${id}.mp3`);
  if (existsSync(out) && !force) {
    skipped++;
    continue;
  }
  const { narrationScript } = JSON.parse(readFileSync(join(contentDir, `${id}.json`), "utf8"));
  if (!narrationScript) {
    console.log(`skip ${id}: no narrationScript`);
    continue;
  }
  chars += narrationScript.length;
  process.stdout.write(`tts ${id} (${narrationScript.length} chars)… `);
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const resp = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: narrationScript,
            model_id: MODEL_ID,
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2 },
          }),
        },
      );
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${body.slice(0, 200)}`);
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf.length < 10_000) throw new Error(`suspiciously small audio (${buf.length} bytes)`);
      writeFileSync(out, buf);
      console.log(`ok (${Math.round(buf.length / 1024)} KB)`);
      made++;
      ok = true;
    } catch (e) {
      console.log(`attempt ${attempt} failed: ${e.message}`);
      await sleep(2000 * attempt);
    }
  }
  if (!ok) failed++;
  await sleep(400); // be polite to the API
}

console.log(`\ndone: ${made} generated, ${skipped} skipped (existing), ${failed} failed · ${chars.toLocaleString()} chars sent`);
const total = readdirSync(audioDir).filter((f) => f.endsWith(".mp3"));
console.log(`audio files present: ${total.length}/30 · ${(total.reduce((s, f) => s + statSync(join(audioDir, f)).size, 0) / 1048576).toFixed(1)} MB`);
process.exit(failed ? 1 : 0);
