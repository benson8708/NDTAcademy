// Photorealistic lesson imagery via OpenAI gpt-image-2.
//   node scripts/generate-images.mjs [--only <file>] [--force] [--limit N]
// Saves to web/public/content/vt/photos/<name>.jpg (b64 png -> sips -> jpg).
// Idempotent: skips files that already exist unless --force.
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, statSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const outDir = join(webRoot, "public", "content", "vt", "photos");
mkdirSync(outDir, { recursive: true });

const env = (name) => {
  if (process.env[name]) return process.env[name];
  const line = readFileSync(join(webRoot, ".env.local"), "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : undefined;
};
const KEY = env("OPENAI_API_KEY");
if (!KEY) { console.error("OPENAI_API_KEY missing"); process.exit(2); }
const MODEL = env("OPENAI_IMAGE_MODEL") || "gpt-image-2";

const STYLE =
  "Photorealistic documentary industrial photography, natural lighting, shallow depth of field, " +
  "high detail, shot on full-frame mirrorless, professional NDT inspection setting. " +
  "No text, no captions, no watermarks, no logos.";

/** name (without extension) -> subject prompt */
const MANIFEST = {
  // ---------- Level I heroes ----------
  "vt1-1-1-hero": "An NDT inspector in safety glasses and hi-vis sweeps a bright LED flashlight across a large welded steel assembly in a fabrication shop, leaning in close to study the weld bead",
  "vt1-1-2-hero": "Close composition of an inspector positioning an articulating LED work light low over a steel plate so raking light grazes the surface, fine surface texture becoming visible in the beam",
  "vt1-1-3-hero": "A technician uses a small telescoping inspection mirror and flashlight to examine the hidden back side of a pipe weld in a tight space between structural members",
  "vt1-2-1-hero": "A clean workbench layout of visual inspection tools: lighted 10x magnifier, telescoping mirror, flashlight, and a steel weld sample coupon under a task lamp",
  "vt1-2-2-hero": "A technician feeds an articulating video borescope probe into an inspection port on a jet engine, the handheld display screen showing crisp internal turbine details",
  "vt1-2-3-hero": "Macro shot of a stainless fillet weld gauge measuring the leg size of a fillet weld on a steel T-joint, digital calipers and a steel rule resting nearby",
  "vt1-3-1-hero": "Extreme macro of a weld toe with a fine surface crack and scattered surface porosity on blasted steel, harsh side lighting making the discontinuities stand out",
  "vt1-3-2-hero": "An inspector holds a printed inspection procedure on a clipboard while examining a long weld seam on a steel beam with a flashlight at a raking angle",
  "vt1-3-3-hero": "An inspector photographs a weld indication next to a small steel scale ruler with a macro camera, a rugged tablet showing an inspection report form lies beside the part",
  // ---------- Level II heroes ----------
  "vt2-1-1-hero": "A senior inspector with arms crossed reviews a large pressure vessel head in a heavy fabrication bay while a colleague shines a work light across a circumferential weld",
  "vt2-1-2-hero": "A technician with a headlamp pauses inside a dim industrial vessel interior letting his eyes adapt, faint silhouettes of nozzles and ladders emerging from the dark",
  "vt2-1-3-hero": "A near-vision acuity test card held at reading distance in a brightly lit exam room, optometric trial frame and record sheet on the table in soft focus",
  "vt2-2-1-hero": "Three industrial light sources side by side in a dark shop — warm halogen work lamp, cool fluorescent tube fixture, and a bright LED panel — each pooling light on bare steel",
  "vt2-2-2-hero": "A digital lux meter sensor resting on a steel test surface with its display held in an inspector's gloved hand, a portable LED flood light illuminating the area",
  "vt2-2-3-hero": "Strong raking light skims across a machined metal surface revealing fine scratches and tool marks as bright ridges and deep shadows",
  "vt2-3-1-hero": "A glass triangular prism and convex lenses on an optics bench splitting and bending a visible light beam in a darkened lab",
  "vt2-3-2-hero": "Macro of a coherent fiber optic image bundle end glowing with transmitted light, borescope relay lens sections laid out on dark velvet",
  "vt2-3-3-hero": "An aviation technician guides a rigid borescope into a compressor case port of a turbofan engine on wing, foam-fitted scope case open beside him",
  "vt2-3-4-hero": "A modern video borescope console displaying a turbine blade with stereo measurement cursors and a depth readout on screen, operator's thumb on the articulation joystick",
  "vt2-4-1-hero": "A sand casting cut open on a workbench showing internal shrinkage cavities and gas porosity, inspection flashlight angled across the sectioned face",
  "vt2-4-2-hero": "Severely pitted and corroded pipe exterior with a rusted fastener hole showing a hairline fatigue crack, photographed close with harsh side light",
  "vt2-4-3-hero": "An inspector compares a weld surface indication against a laminated acceptance criteria reference card, holding both in frame with a measuring scale",
  "vt2-4-4-hero": "A completed inspection report package on a desk: printed forms with photographs of welds, a steel scale, stamp, and pen, neatly arranged",
  "vt2-5-1-hero": "A shelf of thick technical code books and standards binders above a drafting table with engineering drawings and a highlighted specification page",
  "vt2-5-2-hero": "A small toolbox safety meeting in a fabrication shop, technicians in PPE around a workbench with an inspection procedure and lockout tags",
  "vt2-5-3-hero": "Profile view of an inspector's line of sight to a steel surface, eye roughly two feet from the part at a low angle, flashlight in hand, measuring rule on the surface",
  "vt2-6-1-hero": "Glowing orange steel slab exiting a rolling mill stand, sparks and steam, heavy industrial machinery framing the shot",
  "vt2-6-2-hero": "A coated pipeline girth weld in an excavation, coating partially removed for inspection, technician's gloved hand holding a flashlight to the bare steel band",
  "vt2-6-3-hero": "The same steel weld shown under two contrasting setups in one frame: half lit flat and dim, half lit with bright angled light revealing surface relief",
  "vt2-6-4-hero": "A macro camera on a small tripod photographing a weld with a scale ruler in frame, ring light glowing, tethered tablet showing the captured image gallery",
  // ---------- simulator backdrops (clean, defect-free; targets overlaid in app) ----------
  "sim-pipe-interior": "Straight-on view down the inside of a clean steel pipe seen through a borescope, even metallic gray walls with subtle machining marks and gentle perspective vanishing point, uniform lighting, no defects",
  "sim-compressor-blades": "Borescope point of view of a row of clean titanium compressor blades inside a gas turbine, even spacing, soft reflections, no damage visible",
  "sim-steel-plate": "Top-down view of a uniform brushed steel plate surface filling the whole frame, fine consistent grain, evenly lit, no defects or marks",
  "sim-weld-seam": "Top-down view of a clean ground steel weld seam running horizontally across the frame on blasted plate, uniform finish, evenly lit, no defects",
};

const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx > -1 ? parseInt(process.argv[limitIdx + 1], 10) : Infinity;
const force = process.argv.includes("--force");

const entries = Object.entries(MANIFEST).filter(([name]) => !only || name === only).slice(0, limit);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let made = 0, skipped = 0, failed = 0;

for (const [name, subject] of entries) {
  const jpg = join(outDir, `${name}.jpg`);
  if (existsSync(jpg) && !force) { skipped++; continue; }
  process.stdout.write(`img ${name}… `);
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const resp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          prompt: `${subject}. ${STYLE}`,
          size: "1536x1024",
          quality: "medium",
          n: 1,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
      const data = await resp.json();
      const b64 = data.data?.[0]?.b64_json;
      if (!b64) throw new Error("no b64 image in response");
      const png = join(outDir, `${name}.png`);
      writeFileSync(png, Buffer.from(b64, "base64"));
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", png, "--out", jpg], { stdio: "pipe" });
      unlinkSync(png);
      console.log(`ok (${Math.round(statSync(jpg).size / 1024)} KB)`);
      made++; ok = true;
    } catch (e) {
      console.log(`attempt ${attempt}: ${e.message}`);
      await sleep(2500 * attempt);
    }
  }
  if (!ok) failed++;
  await sleep(500);
}
const present = readdirSync(outDir).filter((f) => f.endsWith(".jpg")).length;
console.log(`\ndone: ${made} generated, ${skipped} skipped, ${failed} failed · ${present}/${entries.length || Object.keys(MANIFEST).length} present`);
process.exit(failed ? 1 : 0);
