# RT Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Radiographic Testing (RT) course, aligned to the ANSI/ASNT CP-105-2024 RT topical outline. The
audience is working NDT technicians earning SNT-TC-1A / NAS410 formal training hours. Tone: a
sharp, experienced Level III teaching working inspectors — concrete, practical, zero fluff. Use
real numbers and field practice. NEVER reproduce copyrighted text (no passages from ASNT books or
standards; short factual values like "74-day half-life" are fine). Refer to standards generically
("codes such as ASME Section V Article 2 require…"). Where the brief covers radiation safety
topics, teach them rigorously — these protect lives — and frame regulatory numbers as "typical
NRC/Agreement-State requirements" (10 CFR 20 / 10 CFR 34 style) rather than legal advice.

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/rt/<lessonId>.json` — lesson content (schema below)
- `web/public/content/rt/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/rt/quiz-<moduleId>.json` — module quiz

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
  "references": ["CP-105-2024 RT Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s
  (use `variant: "safety"` for radiation-safety content), every declared figure referenced by
  exactly one `figure` section, 0–2 `table`s. Order them as a coherent lecture covering EVERY
  CP-105 topic listed for the lesson in the brief. Total written body ≈ 900–1,600 words.
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Include calculation questions where the lesson covers math
  (inverse square, half-life decay, geometric unsharpness, density).
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below.
- **imagePrompt**: required. A working radiography scene matching THIS lesson (e.g. "A radiographer
  cranks the drive cable of a gamma projector behind a collimator while a colleague watches a survey
  meter at the rope boundary"). No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units and symbols the way a narrator says
them ("two curies", "one hundred kilovolts", "five rem per year"). Short sentences. First person
plural is fine. It must stand alone — a student listening in a truck should learn the lesson's core.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF` panel with navy
  linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text in `font-family="Arial, sans-serif"`,
  labels ≥ 16px, title text 22–26px bold at top.
- Real diagram content: source-object-film geometry with rays, decay curves, exposure setups,
  simulated radiograph strips with labeled discontinuity images, X-ray tube cutaways, labeled IQIs —
  not clip art. Label everything. Legible at 700px wide.
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
Hotspots work well on simulated radiograph figures ("click the image of incomplete penetration").
Do NOT use `calculator` and do NOT add a `simulator` field (those are VT-only widgets).

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- X-ray generation: tube with heated filament (mA controls electron current → intensity) and target
  (kVp controls electron energy → penetrating quality and contrast/latitude trade); bremsstrahlung
  continuum + characteristic lines; focal spot size drives geometric unsharpness; duty cycles and
  warm-up; ~99% of tube energy becomes heat.
- Gamma sources: Ir-192 — half-life ≈ 74 days, average energy ≈ 0.35 MeV, workhorse for steel
  roughly 0.5–2.5 in. Co-60 — 5.27 years, 1.17 + 1.33 MeV, steel roughly 1.5–8 in. Se-75 —
  ≈ 120 days, lower energy, thin-wall/high-contrast work. Output rule of thumb: Ir-192 ≈ 0.5 R/h
  per Ci at 1 m; Co-60 ≈ 1.3 R/h per Ci at 1 m (approximate, source-construction dependent).
- Activity: curie = 3.7×10¹⁰ dps (Bq = 1 dps). Decay: A = A₀(½)^(t/T½) — teach the halving table
  method. Specific activity drives physical source size → unsharpness.
- Inverse square law: I₁d₁² = I₂d₂². Attenuation: I = I₀e^(−µx); half-value layer (HVL) and
  tenth-value layer (TVL). Approximate HVLs: Ir-192 ≈ ½ in. steel / ≈ 4.8 mm lead; Co-60 ≈ 7/8 in.
  steel / ≈ 12.5 mm lead (state as approximate).
- Film: density D = log₁₀(I₀/I_t) — D2 passes 1%, D3 passes 0.1% of viewing light. Typical code
  density windows ≈ 1.8–4.0 (X-ray) / 2.0–4.0 (gamma) for single-film viewing; densitometer checked
  against a calibrated step tablet. Film systems/classes (finer grain = slower = sharper); latitude
  vs contrast; characteristic (H&D) curve: base+fog, straight-line region, shoulder.
- Screens: lead foil 0.005–0.010 in. front/back — electron intensification + scatter filtering;
  fluorescent screens much faster but lose definition; screen-film contact matters.
- Processing: develop → stop → fix → wash → dry (manual ≈ 5 min @ 68 °F develop, time-temperature
  charts); replenishment; artifacts: pressure marks, crimp (crescent) marks, static, streaks,
  spotting, fog (light/age/chemical/scatter).
- Geometry: Ug = F·t/d (F = source/focal size, t = object-to-detector distance, d = source-to-object
  distance). Long SFD, small source, film contact → sharp images; codes cap Ug by thickness.
  Distortion from beam/part/film misalignment.
- Image quality indicators: hole-type plaques (1T/2T/4T holes; "2-2T" = plaque 2% of thickness,
  2T hole visible) and wire sets; IQI on source side when possible (film-side requires a lead "F");
  shims under plaque IQIs to account for weld reinforcement; sensitivity ≈ 2% thickness typical.
- Scatter control: collimation, masking, filters, blocking; backscatter check = lead letter "B" on
  the cassette back (light image of B on the film ⇒ backscatter problem → add backing lead).
- Exposure: charts (kV vs thickness at fixed density and SFD), reciprocity (mA·min, Ci·hr),
  adjusting for density changes (density ∝ exposure on the straight-line region; doubling exposure
  raises density roughly one characteristic-curve step), radiographic equivalence factors between
  materials.
- Weld techniques: SWSI (panoramic; source centered), DWSI (source offset outside, film opposite —
  view the weld nearest the film), DWDI ellipse for small-bore (commonly OD ≤ 3.5 in.; offset for
  ellipse, ≥ 2 exposures 90° apart) or superimposed (≥ 3 exposures at 60°/120°); location markers,
  coverage overlap, identification (radiograph traceability: job, weld, date, station).
- Digital: CR (photostimulable phosphor plates, laser readout, erase before reuse), DR/DDA panels;
  key metrics SNR and basic spatial resolution (duplex-wire), greyscale window/level; digital
  latitude advantage; monitor/viewing requirements.
- Radiograph interpretation — image character: porosity = sharp dark rounded spots; slag = dark
  irregular, often along the bevel; incomplete penetration = straight dark line on root centerline;
  lack of fusion = dark line along fusion face (angle-sensitive); cracks = fine, dark, wandering,
  often need beam alignment; undercut = dark irregular band at the toe; excess penetration/
  reinforcement = light areas; tungsten inclusions = bright light spots; burn-through = localized
  dark; film artifacts must be ruled out before calling a discontinuity.
- Viewing: high-intensity illuminator sized for the density range, masked edges, darkened room,
  dark adaptation minutes before reading low-density areas.
- Safety integration (where the brief lists it): ALARA = time, distance, shielding; occupational
  TEDE limit 5 rem/yr (typical regulation); survey meter discipline — survey after EVERY exposure
  and on approach, never trust the crank/indicator; direct-reading dosimeter + badge + alarming
  ratemeter for radiographic operations; boundaries posted at 2 mR/h typical. Deep coverage lives
  in the Radiation Safety course — keep RT lessons focused but never casual about safety.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. All math examples are correct (inverse square, decay halving, Ug).
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
