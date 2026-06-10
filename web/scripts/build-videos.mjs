// Builds a teaching video per VT lesson: narration audio + photorealistic hero
// + rasterized figure diagrams, assembled with ffmpeg (title card, Ken Burns
// on photos, even slide pacing across the narration track).
//   node scripts/build-videos.mjs [--only vt1-1-1] [--force] [--limit N]
// Output: web/media-build/videos/<lessonId>.mp4 (uploaded to Supabase Storage
// by scripts/upload-videos.mjs — they are too heavy for the repo/deploy).
import { readFileSync, existsSync, mkdirSync, readdirSync, writeFileSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const contentDir = join(webRoot, "src", "data", "content", "vt");
const figuresDir = join(webRoot, "public", "content", "vt", "figures");
const photosDir = join(webRoot, "public", "content", "vt", "photos");
const audioDir = join(webRoot, "public", "audio", "vt");
const outDir = join(webRoot, "media-build", "videos");
const tmpRoot = join(webRoot, "media-build", "tmp");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpRoot, { recursive: true });

const W = 1280, H = 720;
const SRC_W = 1920, SRC_H = 1080; // slides rendered larger for zoompan headroom
const FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
const curriculum = JSON.parse(readFileSync(join(webRoot, "src", "data", "curriculum", "vt.json"), "utf8"));

const lessonMeta = new Map();
for (const L of curriculum.levels)
  for (const m of L.modules)
    for (const l of m.lessons)
      lessonMeta.set(l.id, { title: l.title, level: L.level, module: m.title });

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
const probeSeconds = (file) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

/** SVG -> PNG letterboxed onto navy. Uses qlmanage (macOS) to rasterize. */
function svgToPng(svgPath, pngPath, tmp) {
  execFileSync("qlmanage", ["-t", "-s", "1920", "-o", tmp, svgPath], { stdio: "pipe" });
  const generated = join(tmp, `${svgPath.split("/").pop()}.png`);
  if (!existsSync(generated)) throw new Error(`qlmanage produced nothing for ${svgPath}`);
  ff(["-i", generated, "-vf",
    `scale=${SRC_W}:${SRC_H}:force_original_aspect_ratio=decrease,pad=${SRC_W}:${SRC_H}:(ow-iw)/2:(oh-ih)/2:color=0x0A2342`,
    "-frames:v", "1", pngPath]);
  return pngPath;
}

function photoToPng(srcJpg, pngPath) {
  ff(["-i", srcJpg, "-vf",
    `scale=${SRC_W}:${SRC_H}:force_original_aspect_ratio=increase,crop=${SRC_W}:${SRC_H}`,
    "-frames:v", "1", pngPath]);
  return pngPath;
}

const esc = (s) => s.replace(/\\/g, "").replace(/'/g, "’").replace(/:/g, "\\:").replace(/%/g, "\\%");

const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx > -1 ? parseInt(process.argv[limitIdx + 1], 10) : Infinity;
const force = process.argv.includes("--force");

const lessonIds = readdirSync(contentDir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("quiz-"))
  .map((f) => f.replace(".json", ""))
  .filter((id) => !only || id === only)
  .sort()
  .slice(0, limit);

let made = 0, skipped = 0, failed = 0;
for (const id of lessonIds) {
  const out = join(outDir, `${id}.mp4`);
  if (existsSync(out) && !force) { skipped++; continue; }
  const audio = join(audioDir, `${id}.mp3`);
  if (!existsSync(audio)) { console.log(`skip ${id}: no narration audio`); continue; }
  const meta = lessonMeta.get(id);
  const content = JSON.parse(readFileSync(join(contentDir, `${id}.json`), "utf8"));
  const tmp = join(tmpRoot, id);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  process.stdout.write(`video ${id}… `);
  try {
    const duration = probeSeconds(audio);

    // ---- collect slides: hero photo, then figures (in lesson order) ----
    const slides = [];
    const hero = join(photosDir, `${id}-hero.jpg`);
    if (existsSync(hero)) slides.push(photoToPng(hero, join(tmp, "s0.png")));
    (content.figures ?? []).forEach((f, i) => {
      const svg = join(figuresDir, f.file);
      if (existsSync(svg)) {
        try { slides.push(svgToPng(svg, join(tmp, `s${i + 1}.png`), tmp)); } catch { /* skip bad rasterization */ }
      }
    });
    if (slides.length === 0) throw new Error("no slides available");

    // ---- title card: darkened hero (or navy) + lesson title ----
    const titleBase = join(tmp, "titlebase.png");
    if (existsSync(hero)) {
      ff(["-i", slides[0], "-vf", `scale=${W}:${H},eq=brightness=-0.25:saturation=0.8,boxblur=3:1`, "-frames:v", "1", titleBase]);
    } else {
      ff(["-f", "lavfi", "-i", `color=c=0x0A2342:s=${W}x${H}`, "-frames:v", "1", titleBase]);
    }
    const title = join(tmp, "title.png");
    const levelLabel = ["I", "II", "III"].includes(meta.level) ? `LEVEL ${meta.level}` : meta.level.toUpperCase();
    // Wrap long titles onto two drawtext lines (drawtext has no auto-wrap)
    const words = meta.title.toUpperCase().split(" ");
    let line1 = "", line2 = "";
    for (const w of words) {
      if (line2 || (line1 + " " + w).trim().length > 38) line2 = (line2 + " " + w).trim();
      else line1 = (line1 + " " + w).trim();
    }
    const titleSize = 46;
    const titleFilters = [
      `drawbox=x=0:y=${H - 280}:w=${W}:h=280:color=0x061830@0.78:t=fill`,
      `drawtext=fontfile='${FONT}':text='NDT ACADEMY  ·  VISUAL TESTING  ·  ${esc(levelLabel)}':fontcolor=0x1B82E8:fontsize=28:x=70:y=${H - 244}`,
      `drawtext=fontfile='${FONT}':text='${esc(line1)}':fontcolor=white:fontsize=${titleSize}:x=70:y=${H - 196}`,
      line2 ? `drawtext=fontfile='${FONT}':text='${esc(line2)}':fontcolor=white:fontsize=${titleSize}:x=70:y=${H - 196 + titleSize + 10}` : null,
      `drawtext=fontfile='${FONT}':text='${esc(meta.module.toUpperCase())}':fontcolor=0xC7D5E6:fontsize=24:x=70:y=${H - 70}`,
    ].filter(Boolean);
    ff(["-i", titleBase, "-vf", titleFilters.join(","), "-frames:v", "1", title]);

    // ---- timing: 5s title, remaining narration split across slides ----
    const titleDur = 5;
    const per = Math.max((duration - titleDur) / slides.length, 6);

    // ---- per-slide clips (subtle zoom on photos via zoompan) ----
    const concatParts = [];
    const titleClip = join(tmp, "c_title.mp4");
    ff(["-loop", "1", "-framerate", "30", "-t", String(titleDur), "-i", title,
      "-vf", `scale=${W}:${H},format=yuv420p`, "-r", "30",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", titleClip]);
    concatParts.push(titleClip);
    slides.forEach((s, i) => {
      const clip = join(tmp, `c${i}.mp4`);
      const frames = Math.round(per * 30);
      // Single input frame -> zoompan emits `frames` output frames (slow drift zoom)
      ff(["-i", s, "-vf",
        `zoompan=z='min(1.0+0.0008*on,1.16)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=30,format=yuv420p`,
        "-frames:v", String(frames), "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        clip]);
      concatParts.push(clip);
    });

    // ---- concat + mux narration ----
    const list = join(tmp, "list.txt");
    writeFileSync(list, concatParts.map((p) => `file '${p}'`).join("\n"));
    const silent = join(tmp, "video.mp4");
    ff(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);
    ff(["-i", silent, "-i", audio,
      "-filter_complex", `[1:a]adelay=${titleDur * 1000}|${titleDur * 1000},apad=pad_dur=1[a]`,
      "-map", "0:v", "-map", "[a]",
      "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-c:a", "aac", "-b:a", "128k",
      "-shortest", out]);

    console.log(`ok (${Math.round(statSync(out).size / 1048576 * 10) / 10} MB, ${Math.round(duration + titleDur)}s, ${slides.length + 1} slides)`);
    made++;
  } catch (e) {
    console.log(`FAILED: ${String(e.message).slice(0, 200)}`);
    failed++;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
console.log(`\ndone: ${made} built, ${skipped} skipped, ${failed} failed`);
process.exit(failed ? 1 : 0);
