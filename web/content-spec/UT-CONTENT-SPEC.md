# UT Lesson Content Specification (authoring contract)

You are writing **original, industry-neutral training content** for one module of NDT Academy's
Ultrasonic Testing (UT) course, aligned to the ANSI/ASNT CP-105-2024 UT topical outline. The
audience is working NDT technicians earning SNT-TC-1A / NAS410 formal training hours. Tone: a
sharp, experienced Level III teaching working inspectors — concrete, practical, zero fluff. Use
real numbers and field practice. NEVER reproduce copyrighted text (no passages from ASNT books or
standards; short factual values like "5,920 meters per second" are fine). Refer to standards
generically ("codes such as ASME Section V Article 4 require…").

## Files you must write (and nothing else)

For EACH lesson in your module:
- `web/src/data/content/ut/<lessonId>.json` — lesson content (schema below)
- `web/public/content/ut/figures/<figureId>.svg` — one SVG file per figure you declare

For the module:
- `web/src/data/content/ut/quiz-<moduleId>.json` — module quiz

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
  "references": ["CP-105-2024 UT Topical Outline §…", "…"]
}
```

Rules:
- **sections**: 5–9 sections per lesson. Mostly `text` (each 120–260 words), 1–2 `callout`s,
  every declared figure referenced by exactly one `figure` section, 0–2 `table`s. Order them as a
  coherent lecture covering EVERY CP-105 topic listed for the lesson in the brief. Total written
  body ≈ 900–1,600 words (this is a 45–75 minute lesson together with narration, figures, and check).
- **figures**: 1–3 per lesson (exactly the count you reference). IDs: `<lessonId>-fig-a`, `-fig-b`, …
- **checkQuestions**: exactly 5. Four options each, one correct (`correct` = index 0–3), plausible
  distractors, explanation required. Test understanding, not trivia. Include calculation questions
  where the lesson covers math (wavelength, dB, skip distance…).
- **interactive**: `null` unless the brief sets `needsInteractive: true` — then exactly one of the
  structures in "Interactives" below.
- **imagePrompt**: required. A working inspector/equipment scene matching THIS lesson (e.g. "A
  technician couples a dual-element transducer to a corroded pipe elbow, flaw detector showing a
  thickness readout"). No text/captions/logos in the scene.
- **narrationScript**: see below.

## Narration (this becomes a professional voiceover via TTS)

Write 550–900 words of natural spoken prose summarizing and motivating the lesson — the audio a
student plays while reading. Plain text only: no markdown, no headings, no bullet symbols, no
parentheses-heavy asides, no "Figure A shows". Spell out units and symbols the way a narrator says
them ("five point nine two kilometers per second", "twenty decibels", "two and a quarter megahertz").
Short sentences. First person plural is fine ("Let's look at…"). It must stand alone — a student
listening in a truck should learn the lesson's core.

## Figures (SVG)

Hand-drawn technical diagrams in the site's brand style. Requirements:
- `viewBox="0 0 800 450"`, no width/height attributes, `xmlns` present.
- Background: use a flat dark navy panel (`<rect fill="#0A2342"/>`) OR white `#FFFFFF`
  panel with navy linework — pick per figure for clarity.
- Palette: navy `#0A2342`, bright blue `#1B82E8`, pale blue `#E8F1FB`, amber `#F2A33C`,
  green `#1E9E6A`, red `#D14343`, greys `#5A6B7E`/`#D9E0E8`. Text in `font-family="Arial, sans-serif"`
  (SVG-safe), labels ≥ 16px, title text 22–26px bold at top.
- Real diagram content: wave paths, wedges, beam profiles, A-scan screens with labeled echoes,
  cross-sections, angles, scales — not clip art. Label everything. Legible at 700px wide.
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
Hotspots work well on A-scan screens ("click the echo that…") and weld cross-sections. Do NOT use
`calculator` and do NOT add a `simulator` field (those are VT-only widgets).

## Module quiz JSON

`quiz-<moduleId>.json`:
```json
{ "moduleId": "<moduleId>", "questions": [ …exactly 10, same shape as checkQuestions… ] }
```
Quiz questions must span all lessons in the module and be DIFFERENT from the lesson check questions.

## Technical anchors (use these real values correctly)

- Sound: mechanical vibration needing a medium; industrial UT ≈ 0.5–25 MHz (most work 1–10 MHz).
  λ = v/f. Practical sensitivity rule of thumb: flaws smaller than ~λ/2 are unreliable to detect.
- Longitudinal velocities ≈ steel 5,920 m/s (0.233 in/µs), aluminum 6,320, water 1,480, air 330,
  acrylic (wedge plastic) 2,730. Shear ≈ steel 3,240 m/s (0.128 in/µs), aluminum 3,130. Shear ≈ ½
  longitudinal in the same metal; shear does not propagate in liquids/gases.
- Wave modes: longitudinal (compression), shear/transverse, Rayleigh/surface (depth ≈ one λ,
  follows gentle curves), Lamb/plate modes in thin sections.
- Acoustic impedance Z = ρv. Reflection at an interface: R = ((Z₂−Z₁)/(Z₂+Z₁))² — steel–air ≈ 100%
  reflection (why we need couplant), steel–water ≈ 88%.
- Snell's law: sinθ₁/v₁ = sinθ₂/v₂. Mode conversion at interfaces. Water-to-steel critical angles ≈
  14.5° (1st, longitudinal disappears) and ≈ 27° (2nd, shear disappears → surface wave). Acrylic
  wedges on steel: common 45°/60°/70° shear-wave wedges sit between the ≈27.5° first and ≈57°
  second critical incident angles. Beyond the 2nd critical angle: Rayleigh waves.
- Near field N = D²f/4v = D²/4λ (D = element diameter). Amplitude oscillates inside N — size/evaluate
  beyond it when possible. Beam spread half-angle: sin γ = 1.22 v/(D f) (edge/null definition);
  bigger D or higher f → narrower beam.
- Transducers: piezoelectric element (PZT, lead metaniobate, composites; quartz historic), element
  thickness = λ/2 at resonance. Heavy backing/damping → broadband, short pulse, better axial
  resolution, lower sensitivity; light damping → narrowband, the reverse. Types: straight beam,
  dual element (pseudo-focus, near-surface + corrosion work), angle beam wedge, delay line, immersion
  (focused or flat), paintbrush.
- dB math: ΔdB = 20·log₁₀(A₂/A₁). +6 dB = 2× amplitude, +20 dB = 10×. 6 dB-drop sizing for flaws
  larger than the beam; DAC curves from SDHs; TCG; transfer correction between cal block and part.
- Angle-beam weld geometry (thickness T, refracted angle θ): skip distance = 2T·tanθ; leg = T/cosθ;
  surface distance = soundpath·sinθ; depth (1st leg) = soundpath·cosθ; (2nd leg) = 2T − soundpath·cosθ.
- Immersion: water path ≥ part thickness × (v_part/v_water) (≈ 4:1 for steel) plus a margin
  (commonly + 6 mm / ¼ in.) so the second front-surface echo clears the first back echo. Focused
  probes shorten in metal by ≈ the velocity ratio.
- Calibration/reference: IIW Type 1/Type 2 blocks (exit point, refracted angle, distance), DSC/SC/DC
  blocks, area-amplitude and distance-amplitude FBH sets, side-drilled holes (SDH), notches; ASME-style
  basic calibration blocks with SDHs at T/4, T/2, 3T/4. Verify screen linearity (vertical/horizontal)
  and avoid `reject` (it distorts vertical linearity on analog sets).
- Instrument chain: pulser (spike/square), receiver, gain in dB, gates, PRF (too high → wrap-around
  ghosts), A-scan (waveform), B-scan (cross-section), C-scan (plan view). RF vs full-wave rectified
  display.
- Techniques: pulse-echo vs through-transmission (no depth info, needs alignment) vs pitch-catch;
  contact straight beam (thickness, laminations), angle beam (welds), surface wave, immersion
  (production scanning). Thickness gauging: corrosion vs precision modes, multiple-echo with delay
  line, high-temperature work (velocity drops with temperature — recalibrate, special couplant).
- Practical variables: surface roughness and couplant choice (water, gel, glycerin, oil; high-temp
  pastes), curvature (contoured wedges), coarse austenitic/cast grain noise and attenuation
  (scattering ↑ with f⁴ in Rayleigh regime — drop frequency), temperature, mode-converted spurious
  signals, dead zone near the initial pulse.
- Acceptance-criteria framing: indication → evaluate against the governing code (e.g., workmanship
  amplitude-based vs fracture-mechanics-based); record echo amplitude vs reference, location, length.
- Future/advanced (mention only where the brief lists them): phased array (PAUT), TOFD, FMC/TFM,
  guided waves, EMAT, AUT girth-weld scanning.

## Self-check before you finish

1. Every CP-105 topic string in the brief appears as real teaching content (not just mentioned).
2. JSON parses; counts right (5 checks/lesson, 10 quiz questions, figures all referenced & written).
3. SVGs are well-formed XML with the required viewBox.
4. All math examples are dimensionally correct and use the velocities above.
5. Nothing copied from any source — all original prose.
6. Return (as your final message) a one-paragraph summary listing files written.
