// Patches simulator definitions into four strategic VT lessons (idempotent).
// Scenes are clean gpt-image-2 backdrops; indications are app-rendered
// overlays at these controlled coordinates.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "content", "vt");

const SIMS = {
  "vt1-2-2": {
    type: "borescope",
    title: "RVI Trainer: Scan the Pipe Bore",
    intro:
      "You're inspecting the inside of a process pipe with a video borescope. The bore is dark until your scope reaches it — sweep systematically (don't jump around) and click every indication you find.",
    scene: "sim-pipe-interior.jpg",
    targets: [
      { x: 22, y: 38, label: "Linear indication at 10 o'clock", feedback: "A linear indication along the surface — record clock position, axial location, and length, then move on without losing your scan pattern." },
      { x: 58, y: 64, label: "Pitting cluster near the bottom", feedback: "Localized pitting — note the cluster boundary and the deepest pit; depth may need a measurement-capable scope tip." },
      { x: 81, y: 30, label: "Indication at the far weld", feedback: "An indication at the girth weld — slow down at every weld; that's where the action is." },
    ],
  },
  "vt2-3-3": {
    type: "borescope",
    title: "RVI Trainer: Compressor Blade Inspection",
    intro:
      "Borescope inspection of a compressor stage. Index blade by blade — engine inspections fail audits when technicians skip blades. Find every damaged blade.",
    scene: "sim-compressor-blades.jpg",
    targets: [
      { x: 30, y: 45, label: "Leading-edge nick", feedback: "Foreign object damage on the leading edge — measure against the engine manual's serviceable limits before condemning." },
      { x: 66, y: 52, label: "Tip curl", feedback: "Tip damage — check the adjacent blades and downstream stages; FOD rarely hits just one blade." },
    ],
  },
  "vt2-2-2": {
    type: "lighting",
    title: "Lighting Trainer: Make the Surface Readable",
    intro:
      "This steel surface contains indications you cannot see at ambient shop light. Raise the illumination, watch the lux meter, and notice exactly when the surface becomes readable — then find what was hiding.",
    scene: "sim-steel-plate.jpg",
    minLux: 1000,
    targets: [
      { x: 34, y: 41, label: "Hairline crack", feedback: "" },
      { x: 71, y: 62, label: "Surface lap", feedback: "" },
    ],
  },
  "vt1-1-2": {
    type: "lighting",
    title: "Lighting Trainer: The 1000-Lux Difference",
    intro:
      "A ground weld seam that 'looked fine' at low light. Bring the measured illumination up to the procedure minimum and see what changes.",
    scene: "sim-weld-seam.jpg",
    minLux: 1000,
    targets: [
      { x: 48, y: 47, label: "Toe crack", feedback: "" },
    ],
  },
};

for (const [lessonId, sim] of Object.entries(SIMS)) {
  const file = join(contentDir, `${lessonId}.json`);
  const content = JSON.parse(readFileSync(file, "utf8"));
  content.simulator = sim;
  writeFileSync(file, JSON.stringify(content, null, 1));
  console.log(`patched ${lessonId} with ${sim.type} simulator`);
}
