# MT Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Magnetic Particle Testing (MT) course, aligned to the ANSI/ASNT CP-105-2024 MT topical outline.
The audience is working NDT technicians earning SNT-TC-1A / NAS410 formal training hours. Tone: a
sharp, experienced Level III teaching working inspectors — concrete, practical, zero fluff. Use
real numbers and field practice, always framed as "typical procedure values — your written
procedure governs". NEVER reproduce copyrighted text (no passages from ASNT books or standards;
short factual values like "1,000 microwatts per square centimeter" are fine). Refer to standards
generically ("practices such as ASTM E709/E1444 and ASME Section V Article 7 specify…").

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/mt/<lessonId>.json` — lesson content (schema below)
- `web/public/content/mt/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/mt/quiz-<moduleId>.json` — module quiz

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
  "references": ["CP-105-2024 MT Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s
  (`variant: "safety"` for arc-flash/UV/electrical content), every declared figure referenced by
  exactly one `figure` section, 0–2 `table`s. Order them as a coherent lecture covering EVERY
  CP-105 topic listed for the lesson in the brief. Total written body ≈ 900–1,600 words.
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Include amperage/field-direction reasoning questions.
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below.
- **imagePrompt**: required. A working MT scene matching THIS lesson (e.g. "An inspector under UV
  light watches green-yellow fluorescent indications bloom along a crankshaft journal on a wet
  horizontal bench unit"). No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units the way a narrator says them
("one hundred amperes per inch", "ten pounds"). Short sentences. First person plural is fine.
It must stand alone — a student listening in a truck should learn the lesson's core.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF` panel with navy
  linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text `font-family="Arial, sans-serif"`,
  labels ≥ 16px, title text 22–26px bold at top.
- Real diagram content: flux lines around parts, hysteresis loops with labeled axes, head-shot/coil/
  prod/yoke setups, leakage fields over cracks, particle indications — not clip art. Label
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
Sorts work well for relevant/nonrelevant/false indication triage and field-direction choices.
Do NOT use `calculator` and do NOT add a `simulator` field (those are VT-only widgets).

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Magnetism: domains; ferromagnetic vs paramagnetic vs diamagnetic; B–H hysteresis loop —
  permeability µ = B/H, retentivity (residual B), coercive force (H to zero it), saturation.
  Hard (high-carbon, high retentivity) vs soft magnetic materials → residual-method suitability.
  Units: flux density B in gauss/tesla (10,000 G = 1 T); magnetizing force H in oersteds (A/m).
- Principle: a surface or near-surface discontinuity crossing flux lines forces leakage flux out of
  the part; particles bridge the leakage field. Detectability is best with flux 45–90° to the
  discontinuity → full coverage needs two roughly perpendicular magnetizations.
- Circular magnetization (current through/around the part — finds longitudinal flaws):
  head shot (direct contact, watch arc burns), central conductor (ID surface field; offset
  conductor covers ≈ 4× the conductor diameter of circumference per shot, rotate and overlap),
  prods (portable; typical procedure values on the order of 90–125 A per inch of prod spacing,
  spacing commonly 6–8 in.; arc-strike risk on aerospace/finished parts — many specs ban prods),
  induced current.
- Longitudinal magnetization (flux along the part — finds transverse flaws): coil/cable wrap —
  classic low-fill-factor rule of thumb NI ≈ 45,000/(L/D) (effective for L/D between ~2 and 15;
  long parts magnetized in ≈18-in. sections); yokes — field between poles; lifting-power checks
  ≈ 10 lb (AC) / ≈ 40 lb (DC) at the pole spacing used.
- Current types: AC — skin effect concentrates field at the surface, excellent particle mobility,
  surface flaws only; half-wave DC (HWDC) — pulsating, good subsurface capability + mobility, the
  dry-powder field favorite; full-wave DC (FWDC) — deepest penetration, bench units; demag needs.
- Particles: dry powder (visible, free-flowing, applied as a light cloud with current ON, best on
  rough/hot work — some rated to ≈ 600 °F) vs wet suspension (finer particles, finds finer flaws);
  visible (black/red) vs fluorescent. Wet-bath concentration by 30-minute settling test: visible
  ≈ 1.2–2.4 mL per 100 mL; fluorescent ≈ 0.1–0.4 mL per 100 mL. Bath carrier (conditioned water or
  light oil), bath contamination and breakdown checks each shift.
- Lighting: fluorescent — UV-A ≥ 1,000 µW/cm² at the surface (meter-verified), ambient white light
  ≤ 2 fc (≈ 20 lux), eye dark-adaptation pause; visible particles — ≥ 100 fc (≈ 1,000 lux) white
  light at the surface.
- Continuous method (current on while applying particles — standard, most sensitive) vs residual
  (high-retentivity parts only).
- Field verification: pie (octagon) gauge, artificial-flaw shim standards (QQI), Hall-effect
  gaussmeter (procedures commonly target a tangential surface field on the order of 30–60 G when
  measured), Ketos-style ring with FBHs for system checks.
- Demagnetization: why (machining chips, arc blow, instrument interference, bearings), AC
  pass-through/step-down, DC reversing-and-decreasing for deep residual fields; verify with a field
  indicator (commonly ≤ 3 G or per procedure). Earth's field ≈ 0.5 G context.
- Interpretation: sharp, dense, tightly held = surface crack/seam; broad fuzzy = subsurface;
  nonrelevant indications from section changes, drilled holes, magnetic writing, weld-metal
  permeability boundaries, external poles; false indications from over-magnetization (furring),
  surface roughness, particle drainage patterns.
- Records & acceptance framing: indication → interpret relevant/nonrelevant → evaluate against the
  governing acceptance criteria; document method, current, amperage, particles, lighting, results.
- Safety: electrical (arc flash at heads/prods, never break contact under current), UV-A eye/skin
  practice, suspension flammability (oil baths), fumes from hot parts.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. Amperage/field guidance is framed as typical-procedure values, not absolutes.
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
