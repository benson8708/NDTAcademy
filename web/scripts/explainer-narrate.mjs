#!/usr/bin/env node
// Batch ElevenLabs v3 narration for explainer specs.
//   node scripts/explainer-narrate.mjs [lessonId ...]   (default: every spec in media-src/specs)
// Idempotent: skips beats whose mp3 already exists with matching text hash (.txt sidecar).
// Voice: Titan (ELEVENLABS_VOICE_ID), model eleven_v3 — friendly, expressive (the locked course voice).
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const SPECS = join(webRoot, "media-src", "specs");
const AUDIO = join(webRoot, "media-build", "explainer-audio");

const env = (n) => {
  if (process.env[n]) return process.env[n];
  const line = readFileSync(join(webRoot, ".env.local"), "utf8").split("\n").find((l) => l.startsWith(`${n}=`));
  return line ? line.slice(n.length + 1).trim() : undefined;
};
const KEY = env("ELEVENLABS_API_KEY");
const VOICE = env("ELEVENLABS_VOICE_ID") || "dtSEyYGNJqjrtBArPCVZ";
if (!KEY) { console.error("ELEVENLABS_API_KEY missing"); process.exit(2); }

const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 12);

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(SPECS).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();

let made = 0, skipped = 0, failed = 0, long = [];
for (const id of ids) {
  const spec = JSON.parse(readFileSync(join(SPECS, `${id}.json`), "utf8"));
  const dir = join(AUDIO, id);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < spec.beats.length; i++) {
    const text = spec.beats[i].narration;
    const mp3 = join(dir, `beat${i + 1}.mp3`);
    const sidecar = join(dir, `beat${i + 1}.txt`);
    const h = hash(text);
    if (existsSync(mp3) && existsSync(sidecar) && readFileSync(sidecar, "utf8") === h) { skipped++; continue; }
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ text, model_id: "eleven_v3", voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true } }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 140)}`);
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length < 8000) throw new Error(`suspiciously small audio (${buf.length}B)`);
        writeFileSync(mp3, buf);
        writeFileSync(sidecar, h);
        const d = probe(mp3);
        if (d > 10.5) long.push(`${id} beat${i + 1}: ${d.toFixed(1)}s (${text.split(/\s+/).length} words)`);
        process.stdout.write(`${id} b${i + 1} ok (${d.toFixed(1)}s)  `);
        made++; ok = true;
      } catch (e) {
        console.log(`\n${id} b${i + 1} attempt ${attempt}: ${e.message}`);
        await sleep(2500 * attempt);
      }
    }
    if (!ok) failed++;
    await sleep(350);
  }
  console.log("");
}
console.log(`\ndone: ${made} generated, ${skipped} cached, ${failed} failed`);
if (long.length) { console.log("OVER-LENGTH beats (tighten narration):"); long.forEach((l) => console.log("  " + l)); }
process.exit(failed ? 1 : 0);
