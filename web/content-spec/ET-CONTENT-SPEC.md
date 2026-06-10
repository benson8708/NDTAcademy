# ET Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Eddy Current Testing (ET) course, aligned to the ANSI/ASNT CP-105-2024 ET topical outline. The
audience is working NDT technicians earning SNT-TC-1A / NAS410 formal training hours. Tone: a
sharp, experienced Level III teaching working inspectors — concrete, practical, zero fluff. Use
real numbers and field practice. NEVER reproduce copyrighted text. Refer to standards generically
("practices such as ASME Section V Article 8 and ASTM E309/E2884 describe…").

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/et/<lessonId>.json` — lesson content (schema below)
- `web/public/content/et/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/et/quiz-<moduleId>.json` — module quiz

## Lesson JSON schema (follow EXACTLY — a validator will reject deviations)

```json
{
  "lessonId": "<exact lesson id from the brief>",
  "title": "<exact lesson title from the brief>",
  "narrationScript": "<550–900 words of plain spoken prose — see Narration below>",
  "imagePrompt": "<one sentence describing a photorealistic industrial scene for this lesson's hero image — concrete subject, setting, action; no text, no logos>",
  "sections": [
    { "type": "text", "heading": "Short Heading", "body": "Markdown paragraphs. **bold**, bullet lists with - , no headings inside body." },
    { "type": "callout", "variant": "key", "title": "…", "body": "Markdown. variant ∈ key|standard|safety" },
    { "type": "figure", "figureId": "<lessonId>-fig-a", "caption": "One-sentence caption." },
    { "type": "table", "caption": "…", "headers": ["…"], "rows": [["…"]] }
  ],
  "figures": [
    { "id": "<lessonId>-fig-a", "title": "…", "file": "<lessonId>-fig-a.svg" }
  ],
  "interactive": null,
  "checkQuestions": [
    { "question": "…", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why the right answer is right, 1–2 sentences." }
  ],
  "references": ["CP-105-2024 ET Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s,
  every declared figure referenced by exactly one `figure` section, 0–2 `table`s. Order them as a
  coherent lecture covering EVERY CP-105 topic listed for the lesson in the brief. Total written
  body ≈ 900–1,600 words.
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Include depth-of-penetration and impedance-plane reasoning
  questions where the lesson covers them.
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below.
- **imagePrompt**: required. A working ET scene matching THIS lesson (e.g. "A technician scans a
  rotating eddy current probe around an aircraft wing-skin fastener hole, instrument impedance-plane
  display glowing beside the work"). No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units and symbols the way a narrator says
them ("one hundred kilohertz", "thirty percent of the International Annealed Copper Standard").
Short sentences. First person plural is fine. It must stand alone.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF` panel with navy
  linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text `font-family="Arial, sans-serif"`,
  labels ≥ 16px, title 22–26px bold at top.
- Real diagram content: coil fields and induced current loops, impedance-plane plots with labeled
  lift-off/conductivity/crack vectors, depth-vs-amplitude decay curves, probe cross-sections, tube
  signal traces — not clip art. Label everything. Legible at 700px wide.
- No external refs, no <image>, no scripts.

## Interactives (when the brief sets needsInteractive)

Choose the ONE type that best fits the lesson:

```json
{ "type": "scenario", "title": "…", "intro": "Setup paragraph.", "steps": [
    { "prompt": "Decision question…", "options": ["…","…","…"], "correct": 1, "feedback": "What a Level II should know here." }
  ] }                                            // 3–5 steps
{ "type": "hotspot", "title": "…", "intro": "Find the …", "figureId": "<a figure you declare>",
  "regions": [ { "x": 120, "y": 80, "w": 90, "h": 60, "label": "…", "isTarget": true, "feedback": "…" } ] }
                                                 // 3–6 regions, ≥1 target; coords in the 800×450 viewBox
{ "type": "sort", "title": "…", "intro": "Classify each item.", "buckets": ["…","…"],
  "items": [ { "label": "…", "bucket": 0, "why": "…" } ] }   // 6–10 items
```
Hotspots work well on impedance-plane figures ("click the lift-off direction") and tube-trace
figures. Do NOT use `calculator` and do NOT add a `simulator` field (VT-only widgets).

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Induction: an AC coil's changing magnetic field induces circulating eddy currents in any nearby
  conductor (Faraday; Lenz gives the opposition). The currents mirror the coil, flow in closed
  loops parallel to the coil winding, and their secondary field loads the coil — changing its
  impedance. Anything that changes eddy-current flow (crack, thinning, conductivity, permeability,
  lift-off) shows up as an impedance change.
- Standard depth of penetration: δ = 1/√(πfµσ); current density falls to 37% (1/e) at 1δ, ≈ 13.5%
  at 2δ, ≈ 5% at 3δ (the practical "effective depth"). Higher frequency, conductivity, or
  permeability ⇒ shallower. Phase lag of the eddy currents ≈ 1 radian (≈ 57°) per standard depth —
  the basis of depth discrimination by phase.
- Conductivity in %IACS (annealed copper = 100): pure aluminum ≈ 61, structural Al alloys mostly
  25–50, titanium alloys ≈ 1–4, austenitic stainless ≈ 2.5, brass ≈ 28. Conductivity falls as
  temperature rises; heat treatment/alloying change it (the basis of sorting and heat-damage
  checks).
- Impedance plane: coil impedance Z = R + jX_L (X_L = 2πfL). Normalized impedance diagrams; the
  lift-off direction vs the conductivity locus; defect signals deflect along/off the locus with a
  phase that rotates with depth; ferromagnetic material drives the point UP the reactance axis
  (µ effect dominates) — magnetic saturation is needed to test ferritic parts/tubes conventionally.
- Probes/coils: absolute vs differential; surface ("pancake") probes, shielded vs unshielded
  (edge-effect control), reflection/driver-pickup; encircling (OD) coils with fill factor
  η = (D_part/D_coil)²; internal bobbin probes for heat-exchanger tubing; rotating probes for
  fastener holes. Edge effect: keep roughly a coil diameter away from edges or use shielded probes.
- Instrumentation: oscillator, bridge, phase-sensitive detection; impedance-plane (X-Y) display,
  sweep/strip-chart for tube pulls; gain, phase rotation, filters (high-pass kills slow wobble at a
  constant scan speed — speed must stay constant), alarm gates/boxes; frequency mixes to suppress
  tube support-plate signals; record/playback for tube jobs.
- Frequency selection: trade sensitivity-at-depth vs resolution; surface cracks → hundreds of kHz
  to MHz; subsurface/second-layer → low kHz; tubing commonly tens to hundreds of kHz with
  multifrequency mixes.
- Reference standards: EDM notch blocks (depth ladders, e.g. 0.008/0.020/0.040 in.), conductivity
  standards (traceable %IACS pairs bracketing the test value), tube calibration standards with
  through-wall hole and flat-bottom holes at specified percent wall depths (e.g. 20/40/60/80%),
  coating-thickness foils. Calibrate, scan, re-verify at intervals and at the end of the shift.
- Applications: surface crack detection (welds with special weld probes, fastener holes with
  rotating scanners, blade roots), conductivity sorting/heat-treat verification (meter + %IACS),
  nonconductive coating thickness via lift-off, corrosion/thinning on aircraft skins (low f,
  phase analysis), nonferromagnetic heat-exchanger tube ID inspection (bobbin differential:
  classic figure-eight flaw signals, phase-to-depth curve, support plates, mixes); remote-field
  ET for ferromagnetic tube (mention where the brief lists it).
- Variables to control: frequency, conductivity, permeability (saturate or compensate), lift-off/
  fill factor, geometry/thickness (thin-wall phase shifts), edge proximity, scan speed,
  temperature. Lift-off is both noise (probe wobble) and signal (coating thickness) — know which
  game you're playing.
- Personnel/eye notes: ET has no special lighting requirement, but signal interpretation training
  and procedure-defined scan patterns/coverage (index, overlap) are everything.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. δ/phase/impedance reasoning is physically correct and consistent across lessons.
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
