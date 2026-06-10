# BASIC Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
NDT Basic course — Level III preparation covering certification program administration, materials
and processes, and the survey of all major NDT methods (the scope of the ASNT "Basic" examination,
aligned to the CP-105-2024 outline). The audience is experienced Level II technicians and
engineers preparing for Level III responsibility. Tone: a sharp, experienced Level III mentoring a
future peer — concrete, practical, zero fluff, comfortable with program-management nuance. NEVER
reproduce copyrighted text (no passages from ASNT books, SNT-TC-1A, CP-189, or NAS410; summarize
their requirements in your own words and frame them as "the recommended practice / the standard
requires-style" guidance). Refer to standards generically.

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/basic/<lessonId>.json` — lesson content (schema below)
- `web/public/content/basic/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/basic/quiz-<moduleId>.json` — module quiz

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
  "references": ["CP-105-2024 Basic Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s,
  every declared figure referenced by exactly one `figure` section, 0–2 `table`s (tables shine in
  this course: method-comparison matrices, level-responsibility splits, discontinuity-by-process).
  Cover EVERY CP-105 topic listed for the lesson in the brief. Total body ≈ 900–1,600 words.
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Write Level III-exam-style judgment questions.
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below.
- **imagePrompt**: required. A scene matching THIS lesson (e.g. "A senior NDT engineer reviews a
  written practice binder beside method qualification records spread on a conference table in a
  fabrication shop office"). No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out numbers the way a narrator says them.
Short sentences. First person plural is fine. It must stand alone.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF` panel with navy
  linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text `font-family="Arial, sans-serif"`,
  labels ≥ 16px, title 22–26px bold at top.
- Real diagram content: program org charts, qualification flowcharts, crystal structures, phase/
  heat-treat diagrams, weld/casting cross-sections with labeled discontinuities, method-selection
  decision trees — not clip art. Label everything. Legible at 700px wide.
- No external refs, no <image>, no scripts.

## Interactives (when the brief sets needsInteractive)

Choose the ONE type that best fits the lesson:

```json
{ "type": "scenario", "title": "…", "intro": "Setup paragraph.", "steps": [
    { "prompt": "Decision question…", "options": ["…","…","…"], "correct": 1, "feedback": "What a Level III should know here." }
  ] }                                            // 3–5 steps
{ "type": "hotspot", "title": "…", "intro": "Find the …", "figureId": "<a figure you declare>",
  "regions": [ { "x": 120, "y": 80, "w": 90, "h": 60, "label": "…", "isTarget": true, "feedback": "…" } ] }
                                                 // 3–6 regions, ≥1 target; coords in the 800×450 viewBox
{ "type": "sort", "title": "…", "intro": "Classify each item.", "buckets": ["…","…"],
  "items": [ { "label": "…", "bucket": 0, "why": "…" } ] }   // 6–10 items
```
Sorts are excellent here (discontinuity → process of origin; task → responsible level; defect type →
best method). Do NOT use `calculator` and do NOT add a `simulator` field (VT-only widgets).

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Personnel qualification/certification: qualification = demonstrated skill/knowledge (training,
  experience, exams); certification = written testimony by the employer (SNT-TC-1A model) or a
  central body. SNT-TC-1A is a RECOMMENDED PRACTICE — the employer's written practice tailors and
  makes it binding; CP-189 is a STANDARD (minimum requirements, "shall"); NAS410 governs aerospace
  (stricter hour counts, annual vision, defined instructor/auditor roles); ACCP/central
  certification as alternatives. Exams: general (method theory), specific (employer procedures/
  equipment), practical (hands-on with checklist); composite grading commonly ≥ 80% average with
  per-exam minimums (state as "commonly"). Vision: near-vision acuity annually (Jaeger-type),
  color perception on entry/interval. Levels: trainee (no call), Level I (perform per instruction,
  no evaluation call), Level II (set up, perform, interpret AND evaluate to criteria, report),
  Level III (establish techniques/procedures, interpret codes, designate methods, train/examine,
  audit). Recertification intervals commonly ≤ 5 years (SNT-TC-1A model: 3 for I/II, 5 for III —
  state as typical); interrupted service provisions live in the written practice.
- Materials: crystal structures BCC (ferrite, Cr, W), FCC (austenite, Al, Cu, Ni), HCP (Ti, Zn,
  Mg); grains/grain boundaries; alloying; solid solution vs precipitation strengthening.
  Mechanical properties: yield, UTS, elongation, hardness (Brinell/Rockwell/Vickers correlations),
  toughness (Charpy; ductile-brittle transition in BCC steels). Steel heat treatment: annealing
  (soft, coarse), normalizing (refined, uniform), quench → martensite (hard, brittle, crack risk),
  tempering (toughness back), hardenability vs hardness; surface hardening (carburize, nitride,
  induction); stress relief. Aluminum: solution treat + age (T6 etc.).
- Discontinuity origins — inherent (ingot: pipe, porosity, nonmetallic inclusions, segregation);
  primary processing (rolling/forging/extrusion: laminations, stringers, seams, laps, bursts;
  casting: shrinkage [macro/micro/filamentary], gas porosity/blowholes, cold shuts, misruns, hot
  tears, sand/slag inclusions, core shift); welding (porosity, slag, incomplete fusion/penetration,
  undercut, overlap, cracks: hot/solidification, cold/hydrogen-delayed, crater, HAZ; arc strikes,
  spatter, tungsten inclusions); secondary processing (machining tears, grinding cracks/burns,
  heat-treat/quench cracks, plating hydrogen embrittlement); service (fatigue cracks at stress
  risers — beach marks macro, striations micro; creep above ≈ 0.4 T_melt; corrosion: uniform,
  galvanic, pitting, crevice, intergranular, SCC [tensile stress + specific environment, e.g.
  chlorides + austenitic stainless], corrosion fatigue, hydrogen damage/blistering; erosion,
  cavitation, fretting, wear; overload: ductile dimples vs brittle cleavage/chevron marks).
- Welding processes to recognize: SMAW, GMAW (spray/short-circuit), FCAW, GTAW, SAW, ESW/EGW,
  resistance, electron beam/laser, brazing/soldering (lack of bond) — and which discontinuities
  each favors.
- Method survey — for EACH major method (VT, PT, MT, ET, UT, RT, plus AE, LT, IR/thermography,
  vibration analysis where the brief lists them): physical principle, what it detects (surface vs
  near-surface vs volumetric), material limits (e.g., MT ferromagnetic only; ET conductors only;
  PT surface-breaking only; RT orientation-sensitive to planar flaws; UT couples to geometry/grain),
  key variables, typical equipment/consumables, advantages, limitations, and personnel/safety notes.
  Leak testing submethods: bubble, pressure change, halogen diode, helium mass spectrometer (most
  sensitive). Method selection logic: defect type + location + material + geometry + access +
  quantity/speed + cost + safety; methods complement each other (e.g., RT + UT on welds).
- Program administration: written procedures (scope, personnel, equipment, calibration, technique,
  acceptance criteria, records), procedure qualification/demonstration, audits, records retention,
  measuring & test equipment calibration traceability, nonconformance handling, the Level III's
  role in tailoring codes (ASME/AWS/API context) into shop practice.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. Program requirements are framed as the document's model ("the recommended practice suggests…"),
   never as legal absolutes.
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
