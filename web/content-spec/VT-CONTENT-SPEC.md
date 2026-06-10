# VT Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Visual Testing (VT) course, aligned to the ANSI/ASNT CP-105-2024 VT topical outline. The audience
is working NDT technicians earning SNT-TC-1A / NAS410 formal training hours. Tone: a sharp,
experienced Level III teaching working inspectors — concrete, practical, zero fluff. Use real
numbers and field practice. NEVER reproduce copyrighted text (no passages from ASNT books or
standards; short factual values like "1000 lux" are fine). Refer to standards generically
("codes such as ASME Section V Article 9 require…").

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/vt/<lessonId>.json` — lesson content (schema below)
- `web/public/content/vt/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/vt/quiz-<moduleId>.json` — module quiz

## Lesson JSON schema (follow EXACTLY — a validator will reject deviations)

```json
{
  "lessonId": "vt1-1-1",
  "title": "<exact lesson title from the brief>",
  "narrationScript": "<550–900 words of plain spoken prose — see Narration below>",
  "sections": [
    { "type": "text", "heading": "Short Heading", "body": "Markdown paragraphs. **bold**, bullet lists with - , no headings inside body." },
    { "type": "callout", "variant": "key", "title": "…", "body": "Markdown. variant ∈ key|standard|safety" },
    { "type": "figure", "figureId": "vt1-1-1-fig-a", "caption": "One-sentence caption." },
    { "type": "table", "caption": "…", "headers": ["…"], "rows": [["…"]] }
  ],
  "figures": [
    { "id": "vt1-1-1-fig-a", "title": "…", "file": "vt1-1-1-fig-a.svg" }
  ],
  "interactive": null,
  "checkQuestions": [
    { "question": "…", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why the right answer is right, 1–2 sentences." }
  ],
  "references": ["CP-105-2024 VT Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s,
  every declared figure referenced by exactly one `figure` section, 0–2 `table`s. Order them as a
  coherent lecture covering EVERY CP-105 topic listed for the lesson in the brief. Total written
  body ≈ 900–1,600 words (this is a 45–75 minute lesson together with narration, figures, and check).
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Test understanding, not trivia.
- **interactive**: `null` unless the brief lists `interactive` in the lesson's media types — then
  exactly one of the structures in "Interactives" below.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units the way a narrator says them
("one thousand lux", "thirty degrees"). Short sentences. First person plural is fine ("Let's look
at…"). It must stand alone — a student listening in a truck should learn the lesson's core.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: `#0A2342` → use a flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF`
  panel with navy linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text in `font-family="Arial, sans-serif"`
  (SVG-safe), labels ≥ 16px, title text 22–26px bold at top.
- Real diagram content: geometry, rays, angles, cross-sections, labeled parts, scales — not clip art.
  Label everything. Keep it legible at 700px wide.
- No external refs, no <image>, no scripts.

## Interactives (when the lesson's media includes `interactive`)

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
{ "type": "calculator", "preset": "lighting", "title": "Illumination check",
  "intro": "Use the meter reading to verify the surface meets the procedure minimum." }
```

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "vt1-1", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Photometry: 1 footcandle ≈ 10.76 lux. Common code minimums: ~500 lux (50 fc) general VT,
  ~1000 lux (100 fc) for critical/direct examination (e.g., ASME V Art. 9 practice); verify with a
  calibrated light meter at the surface.
- Direct VT geometry (widely used): eye within 24 in. (600 mm) of the surface, viewing angle not
  less than 30° to the surface.
- Vision: rods (scotopic, periphery, motion) vs cones (photopic, fovea, color); dark adaptation
  ≈ 30 min; near-vision acuity exams (Jaeger J-1/J-2 at specified distance) at least annually per
  employer written practice / NAS410; color-perception testing on entry.
- Acuity: 20/20 ≙ resolving ~1 arc-minute; contrast and motion degrade effective acuity.
- Optics: Snell's law refraction, magnifier power ≈ 250mm/f, 10× inspection magnifier typical;
  field of view vs magnification trade-off; total internal reflection in fiber bundles; coherent
  (image) vs incoherent (light) bundles; CCD/CMOS sensors in video borescopes.
- Borescope DOV: forward, side (90°), forward-oblique, retro; measurement: comparison, shadow,
  stereo, structured-light/phase — accuracy depends on tip-to-target distance calibration.
- Discontinuity taxonomy: inherent (ingot/cast: porosity, nonmetallic inclusions, shrinkage, cold
  shut, segregation; rolled: laminations, seams, stringers), primary processing (laps, bursts),
  welding (incomplete penetration/fusion, undercut, overlap, cracks — crater/longitudinal/
  transverse/HAZ, porosity, spatter, arc strike, excess reinforcement), secondary processing
  (grinding/heat-treat/quench/plating cracks), service (fatigue cracks at stress risers, corrosion
  — uniform, pitting, crevice, galvanic, intergranular, SCC; erosion, cavitation, creep, hydrogen
  damage, wear, mechanical damage).
- Weld measurement tools: fillet weld gauges, bridge-cam (cambridge) gauge, V-WAC, Hi-Lo gauge,
  taper/pit gauges, optical comparators.
- Records: indication → interpretation → evaluation against acceptance criteria → defect only if
  rejectable; reports need traceability (part, procedure, criteria, instrument, lighting, examiner,
  date) plus photos/sketches with scale.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. Nothing copied from any source — all original prose.
5. Return (as your final message) a one-paragraph summary listing files written.
