# RAD (Radiation Safety) Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Radiation Safety course (course id `rad`, code RS) for industrial radiography personnel, aligned
to the CP-105-2024 radiation safety outline and typical NRC / Agreement-State expectations
(10 CFR 19/20/34 style). The audience is working radiographers and trainees earning formal
training hours. Tone: a sharp, experienced RSO teaching people whose lives depend on getting this
right — concrete, serious, zero fluff. This is SAFETY training: be rigorous with numbers, and
always add "your license, regulator, and written operating procedures govern" framing. NEVER
reproduce copyrighted or regulatory text verbatim — explain requirements in your own words as
"typical NRC/Agreement-State requirements". This course is jurisdiction-aware: state that exact
requirements vary by jurisdiction and license.

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/rad/<lessonId>.json` — lesson content (schema below)
- `web/public/content/rad/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/rad/quiz-<moduleId>.json` — module quiz

## Lesson JSON schema (follow EXACTLY — a validator will reject deviations)

```json
{
  "lessonId": "<exact lesson id from the brief>",
  "title": "<exact lesson title from the brief>",
  "narrationScript": "<550–900 words of plain spoken prose — see Narration below>",
  "imagePrompt": "<one sentence describing a photorealistic industrial scene for this lesson's hero image — concrete subject, setting, action; no text, no logos>",
  "sections": [
    { "type": "text", "heading": "Short Heading", "body": "Markdown paragraphs. **bold**, bullet lists with - , no headings inside body." },
    { "type": "callout", "variant": "safety", "title": "…", "body": "Markdown. variant ∈ key|standard|safety" },
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
  "references": ["CP-105-2024 Radiation Safety Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s (use
  `variant: "safety"` generously — this is the safety course), every declared figure referenced by
  exactly one `figure` section, 0–2 `table`s (dose limits, posting thresholds, package labels are
  natural tables). Cover EVERY topic listed for the lesson in the brief. Total body ≈ 900–1,600 words.
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Include dose-math questions (inverse square, time, decay,
  HVL) where the lesson covers them.
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below. Emergency-response scenarios are gold here.
- **imagePrompt**: required. A working radiation-safety scene matching THIS lesson (e.g. "A
  radiographer at a rope-and-placard boundary reads a handheld survey meter at dusk, gamma
  projector and guide tube visible in the background"). No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units the way a narrator says them
("five rem per year", "two millirem per hour", "one hundred curies"). Short sentences. First
person plural is fine. It must stand alone — and it must take safety seriously without melodrama.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF` panel with navy
  linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text `font-family="Arial, sans-serif"`,
  labels ≥ 16px, title 22–26px bold at top.
- Real diagram content: exposure-device cutaways (source assembly, drive cable, guide tube,
  collimator), boundary/posting layouts with dose-rate rings, decay and inverse-square curves,
  dosimeter cutaways, package labels with TI placement — not clip art. Label everything. Legible
  at 700px wide.
- No external refs, no <image>, no scripts.

## Interactives (when the brief sets needsInteractive)

Choose the ONE type that best fits the lesson:

```json
{ "type": "scenario", "title": "…", "intro": "Setup paragraph.", "steps": [
    { "prompt": "Decision question…", "options": ["…","…","…"], "correct": 1, "feedback": "What a safe radiographer does here." }
  ] }                                            // 3–5 steps
{ "type": "hotspot", "title": "…", "intro": "Find the …", "figureId": "<a figure you declare>",
  "regions": [ { "x": 120, "y": 80, "w": 90, "h": 60, "label": "…", "isTarget": true, "feedback": "…" } ] }
                                                 // 3–6 regions, ≥1 target; coords in the 800×450 viewBox
{ "type": "sort", "title": "…", "intro": "Classify each item.", "buckets": ["…","…"],
  "items": [ { "label": "…", "bucket": 0, "why": "…" } ] }   // 6–10 items
```
Scenarios shine for source-retraction failures and overexposure response; hotspots on device
cutaways and boundary diagrams. Do NOT use `calculator` and do NOT add a `simulator` field.

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Fundamentals: atom/isotopes; ionizing radiation types — alpha (paper-stopped, internal hazard),
  beta (≈ mm of aluminum, skin/lens hazard), gamma & X (the radiography hazard, HVLs of dense
  material), neutron (special facilities). Ionization is the damage mechanism.
- Units (teach both systems): exposure — roentgen (R); absorbed dose — rad (gray; 1 Gy = 100 rad);
  dose equivalent — rem (sievert; 1 Sv = 100 rem); for gamma/X in tissue, 1 R ≈ 1 rad ≈ 1 rem
  working approximation. Activity — curie (3.7×10¹⁰ dps) and becquerel. Quality factors: γ/β = 1,
  α = 20, neutrons ≈ 10.
- Typical occupational dose limits (NRC 10 CFR 20 model — frame as "typical US regulatory limits"):
  whole-body TEDE 5 rem/yr; lens 15 rem/yr; skin/extremities 50 rem/yr; declared pregnant worker
  0.5 rem per gestation; minors 10% of adult; general public 0.1 rem/yr and ≤ 2 mrem in any hour
  in unrestricted areas. There is NO "safe" threshold assumed — ALARA always.
- Posting thresholds (typical): "Radiation Area" ≥ 5 mrem in 1 h at 30 cm; "High Radiation Area"
  ≥ 100 mrem in 1 h at 30 cm (control entry, alarms/locks); "Very High Radiation Area" ≥ 500 rad
  in 1 h at 1 m. Radiography boundaries are typically established and surveyed to ≈ 2 mrem/h with
  "Radioactive Material" / radiation signage and direct surveillance.
- ALARA toolkit: TIME (dose = rate × time), DISTANCE (inverse square: I₁d₁² = I₂d₂² — doubling
  distance quarters the rate), SHIELDING (HVL/TVL; collimators cut dose dramatically; depleted
  uranium/tungsten device shields). Source outputs ≈ 0.5 R/h·Ci at 1 m for Ir-192, ≈ 1.3 for
  Co-60 (approximate). Decay math A = A₀(½)^(t/T½): Ir-192 T½ ≈ 74 d, Co-60 ≈ 5.27 y, Se-75 ≈ 120 d.
- Biological effects: ionization → DNA damage; deterministic/acute effects with thresholds
  (observable blood changes around ~25 rem acute; radiation sickness onset roughly 100+ rem acute;
  LD50/60 on the order of 400 rem whole-body without care — state as approximate) vs stochastic
  effects (cancer risk, no threshold assumed); acute vs chronic exposure; most sensitive tissues =
  rapidly dividing (marrow, GI, gonads); embryo/fetus sensitivity; somatic vs heritable.
- Personnel monitoring for radiography (typical rule: ALL THREE worn): (1) whole-body badge —
  film/TLD/OSL, processed at required intervals, legal dose of record; (2) direct-reading pocket
  dosimeter — typical range 0–200 mR, zeroed daily, read frequently, off-scale ⇒ stop work and
  process the badge before returning; (3) alarming ratemeter, function-checked daily. Lost badge,
  questionable dose ⇒ report to the RSO.
- Survey instruments: GM/ion-chamber meters covering at least ≈ 2 mR/h through 1 R/h, calibrated
  at required intervals (commonly every 6 months and after repair — "typical requirement"),
  battery/check-source response check each day of use. THE RULE: the survey meter is the only
  thing that proves the source is shielded — survey the device after EVERY exposure, on every
  approach, 360° around the crank and guide-tube path, before locking and leaving.
- Equipment: gamma exposure device (Type B transport-rated projector; depleted-uranium shield;
  source assembly/pigtail with female connector; drive cable/crank; guide tubes; collimators),
  daily pre-use inspection (connectors, cables, crank effort), periodic maintenance, quarterly
  physical inventory, sealed-source leak tests at ≈ 6-month intervals (wipe ≥ 0.005 µCi removable
  = leaking — "typical threshold"), locked/secured storage with two independent barriers.
- Operations: pre-job survey plan, boundary setup and posting, continuous direct surveillance of
  the high-radiation boundary, communication, collimator use, retraction discipline (count cranks,
  CONFIRM by meter), securing the device, documentation (utilization/survey logs).
- Emergencies: source fails to retract / disconnects — back away measuring with the meter, secure
  the boundary at the typical 2 mrem/h line, keep everyone out, never touch or improvise retrieval
  (specialized source-recovery teams only), notify the RSO and regulator as required. Damaged
  device/vehicle accident/lost source: same instincts — distance, boundary, notification.
  Typical reportable events: lost/stolen source (immediate), overexposures above limits
  (immediate/24-h tiers — "typical reporting tiers").
- Transport (DOT model): Type B packages for radiography sources; labels by surface/1-m dose rate —
  White-I (≤ 0.5 mrem/h surface), Yellow-II (≤ 50 mrem/h surface, TI ≤ 1), Yellow-III (higher);
  Transport Index = highest mrem/h at 1 m; shipping papers, package marking, vehicle security
  (two barriers), blocking and bracing; placarding when required.
- Program/regulatory structure: NRC vs Agreement States; specific license; RSO duties; operating
  & emergency procedures; personnel: radiographer vs radiographer's assistant (direct supervision);
  required training + exams + periodic refresher/audits (annual-style); certification cards for
  industrial radiographers per jurisdiction (e.g., IRRSP-style); reciprocity when crossing
  jurisdictions; inspections and enforcement; workers' rights to dose records (Form-19/Form-5
  style annual reports — describe generically).

## Self-check before you finish

1. Every topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. Every regulatory number is framed as "typical NRC/Agreement-State requirement" with
   license/jurisdiction caveat; dose math is correct.
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
