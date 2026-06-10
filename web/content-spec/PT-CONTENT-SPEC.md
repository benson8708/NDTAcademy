# PT Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Liquid Penetrant Testing (PT) course, aligned to the ANSI/ASNT CP-105-2024 PT topical outline.
The audience is working NDT technicians earning SNT-TC-1A / NAS410 formal training hours. Tone: a
sharp, experienced Level III teaching working inspectors — concrete, practical, zero fluff. Use
real numbers and field practice, always framed as "typical procedure values — your written
procedure governs". NEVER reproduce copyrighted text. Refer to standards generically ("practices
such as ASTM E165/E1417 and ASME Section V Article 6 specify…").

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/pt/<lessonId>.json` — lesson content (schema below)
- `web/public/content/pt/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/pt/quiz-<moduleId>.json` — module quiz

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
  "references": ["CP-105-2024 PT Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s,
  every declared figure referenced by exactly one `figure` section, 0–2 `table`s. Order them as a
  coherent lecture covering EVERY CP-105 topic listed for the lesson in the brief. Total written
  body ≈ 900–1,600 words.
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Test process-control reasoning, not trivia.
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below.
- **imagePrompt**: required. A working PT scene matching THIS lesson (e.g. "Gloved hands spray red
  visible penetrant onto a machined flange face in a process line, dwell timer beside the part").
  No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units the way a narrator says them
("ten minutes", "forty pounds per square inch"). Short sentences. First person plural is fine.
It must stand alone — a student listening in a truck should learn the lesson's core.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF` panel with navy
  linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text `font-family="Arial, sans-serif"`,
  labels ≥ 16px, title 22–26px bold at top.
- Real diagram content: capillary cross-sections (contact angle, crack entrapment), process-step
  flow diagrams, station layouts, indication development over time — not clip art. Label
  everything. Legible at 700px wide.
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
Sorts work well for type/method classification and indication triage; scenarios for wash/over-wash
decisions. Do NOT use `calculator` and do NOT add a `simulator` field (VT-only widgets).

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Physics: capillary action draws penetrant into surface-breaking discontinuities — driven by
  surface tension and wetting ability (contact angle well below 90°); viscosity affects how fast,
  not how well; the flaw must be open to the surface and clean. Bleed-out reverses the process
  into the developer (blotter analogy).
- Classification — Type I fluorescent, Type II visible (red dye). Methods: A water-washable,
  B post-emulsifiable lipophilic, C solvent-removable, D post-emulsifiable hydrophilic.
  Fluorescent sensitivity levels ½ through 4 (ultralow to ultrahigh); higher sensitivity = finds
  finer flaws but more background noise on rough surfaces. Developer forms: a dry powder,
  b/c aqueous (soluble/suspendible), d/e nonaqueous wet (solvent-based — the most sensitive in
  common spot use), f special.
- Standard process: pre-clean → dry → penetrant application & dwell → removal → (dry) → developer
  & development dwell → interpret/evaluate → post-clean → protect.
- Pre-cleaning: solvent, vapor degrease, alkaline, ultrasonic; mechanical operations that smear
  metal (peening, abrasive blasting, wire brushing, some machining) can close cracks — etch after,
  or avoid before PT. Acids/chromates left in flaws kill fluorescence.
- Temperatures and times (typical procedure values): standard band ≈ 40–125 °F (4–52 °C);
  penetrant dwell commonly ≥ 10 minutes (longer when cold, for tight fatigue cracks, or per
  procedure; don't let it dry on the part); developer dwell commonly ≥ 10 minutes and interpret
  within the procedure's window (over-development bleeds indications wide).
- Removal: Method A — coarse water spray, commonly ≤ 40 psi and ≈ 50–100 °F water, stop at
  background; over-washing pulls penetrant out of flaws (the classic PT sin). Method C — wipe with
  clean dry lint-free cloth, then solvent-DAMPENED cloth; NEVER flood the surface with solvent.
  Method B (lipophilic) — immerse/drain, emulsifier contact time is critical, no agitation, then
  rinse. Method D (hydrophilic) — water pre-rinse, then emulsifier dip ≈ 5–35% concentration (spray
  much weaker, commonly ≤ 5%), then final rinse; the controlled choice for high-sensitivity work.
- Drying: oven commonly ≤ 160 °F part temperature; dry BEFORE dry/nonaqueous developer, AFTER
  aqueous developer application.
- Lighting: Type I — UV-A ≥ 1,000 µW/cm² at the surface, ambient white ≤ 2 fc (≈ 20 lux), allow
  eye dark adaptation (commonly several minutes), check UV intensity periodically with a meter;
  photochromic/tinted lenses interfere. Type II — ≥ 100 fc (≈ 1,000 lux) white light at the surface.
- Process control: daily system-performance check against a known-defect comparator panel (e.g.,
  star-burst/TAM-style panel), penetrant brightness/contamination checks, water content,
  emulsifier concentration (refractometer), developer condition (no fluorescent specks in dry
  developer), UV lamp/meter checks, bath temperature.
- Interpretation: continuous linear = crack/seam/lap/cold shut; intermittent linear = partially
  closed/ground-over flaw; rounded = porosity, pits; weak diffuse background vs discrete bleed-out;
  bleed-out speed and re-bleed after wipe-off indicate flaw volume. False indications: lint, poor
  wash, handling transfer, drainage gullies; nonrelevant: press fits, keyways, weld geometry.
- Materials compatibility: low sulfur/halogen formulations for nickel alloys, austenitic stainless,
  and titanium (residue limits per analysis); LOX-compatible penetrants where oxygen service rules
  apply; flammability and ventilation for solvents; aerosol handling.
- Special applications where the brief calls for them: leak-through testing, high-temperature
  penetrants, filtered-particle method on ceramics; aerospace etch-then-inspect sequences.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. Time/temperature/pressure guidance is framed as typical-procedure values, not absolutes.
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
