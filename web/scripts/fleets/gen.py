#!/usr/bin/env python3
"""Fleet-script generator for the NDTAcademy course build-out.

Every fleet is computed from CURRENT disk state, so it is always safe to
re-run after a partial fleet (quota wall, crashes): only missing work is
emitted. Workflow scripts get ALL data inlined — workflow args are dropped
on resume, which burned two earlier fleets.

  python3 scripts/fleets/gen.py patch     -> /tmp/fleet-patch.js     (missing lessons + quizzes)
  python3 scripts/fleets/gen.py specs     -> /tmp/fleet-specs.js     (missing explainer specs, all courses)
  python3 scripts/fleets/gen.py design    -> /tmp/fleet-design.js    (missing assets: briefs + spec requests)
  python3 scripts/fleets/gen.py accuracy  -> /tmp/fleet-accuracy.js  (courses not in accuracy-state.json)
  python3 scripts/fleets/gen.py trainers  -> /tmp/fleet-trainers.js  (courses without trainers.json)

Run from web/. Launch the emitted file with the Workflow tool ({scriptPath}).
After a fleet completes, mark progress (accuracy: add course ids to
scripts/fleets/accuracy-state.json) and re-run gen.py — an empty fleet
prints NOTHING-TO-DO and writes no file.
"""
import json, glob, os, sys

W = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
COURSES = ["vt", "ut", "rt", "mt", "et", "pt", "rad", "basic"]
ENGINES = {"et": "et", "pt": "pt", "rad": "rs"}  # basic: agent picks per lesson

def cur_lessons(cid):
    cur = json.load(open(f"{W}/src/data/curriculum/{cid}.json"))
    return [(l["id"], m["id"]) for L in cur["levels"] for m in L["modules"] for l in m["lessons"]]

def have_lessons(cid):
    return {os.path.basename(f)[:-5] for f in glob.glob(f"{W}/src/data/content/{cid}/*.json")
            if not os.path.basename(f).startswith(("quiz-", "videos", "explainers", "slide-audio", "trainers"))}

def have_quizzes(cid):
    return {os.path.basename(f)[5:-5] for f in glob.glob(f"{W}/src/data/content/{cid}/quiz-*.json")}

def emit(name, script):
    path = f"/tmp/fleet-{name}.js"
    open(path, "w").write(script)
    print(f"wrote {path} ({len(script)} chars)")

S_OK = "{ type: 'object', properties: { id: {type:'string'}, ok: {type:'boolean'}, newAssets: {type:'array', items:{type:'string'}}, note: {type:'string'} }, required: ['id','ok'] }"

LP = f"""You are authoring ONE lesson for the NDTAcademy NAS410/SNT-TC-1A Level II training platform (repo {W}).
Lesson: <ID> (module <MID>) of course "<CID>".
1. Read src/data/curriculum/<CID>.json for this lesson's title/objectives and module position.
2. Read THREE existing lessons from src/data/content/<CID>/ (or src/data/content/ut/) as exemplars — match schema, section count/length, markdown, callout/figure/media conventions, tone EXACTLY.
3. Write src/data/content/<CID>/<ID>.json: >=4 substantial sections, exactly 5 checkQuestions (4 options, correct index, explanation), narrationScript ~170 words. Figures are 800x450 white-bg SVGs in public/content/<CID>/figures/. Author any interactive the curriculum media list requires. Technical accuracy is paramount (NAS410, SNT-TC-1A, ASTM/ASME).
4. Run: node scripts/validate-content.mjs --course <CID> and confirm YOUR files produce no problems.
Return JSON only: {{"id":"<ID>","ok":true|false,"note":"<=120 chars"}}"""

QP = f"""You are authoring ONE module quiz for the NDTAcademy NAS410/SNT-TC-1A Level II training platform (repo {W}).
Quiz: module <MID> of course "<CID>". Module lessons: <LESSONS>.
1. Read every module lesson in src/data/content/<CID>/ — questions must be answerable from them.
2. Match the schema of 2 existing quiz-*.json exemplars exactly: {{"moduleId":"<MID>","questions":[10 x {{question, options[4], correct, explanation}}]}}.
3. Write src/data/content/<CID>/quiz-<MID>.json — exactly 10 Level II questions spread across lessons, plausible distractors, explanations that teach.
4. Run: node scripts/validate-content.mjs --course <CID>; confirm quiz-<MID> is clean.
Return JSON only: {{"id":"<MID>","ok":true|false,"note":"<=120 chars"}}"""

SP = f"""You are authoring ONE explainer-video spec for NDTAcademy (repo {W}).
Spec: media-src/specs/<ID>.json for lesson <ID> (course <CID>).
1. Read src/data/content/<CID>/<ID>.json — the video is a 60-90s hook for its 2-3 core ideas.
2. Read 3 exemplar specs in media-src/specs/ for the locked format: lessonId, displayTitle, anchorAfterSection, beats[4-5] (beat1 "title"; types title|tiles|diagram|kinetic|list), narration <=25 words/beat (hard cap 27), total 80-115 words, conversational and technically precise.
3. STRONGLY prefer existing assets (ls media-src/assets/*.svg; briefs in scripts/fleets/asset-briefs.json). One asset max once per spec. If a NEW asset is essential: kebab-case name, reference it, and write media-build/spec-asset-requests/<ID>.json: {{"lessonId":"<ID>","assetRequests":[{{"name":"...","brief":"what it must show, labels, reveal stages"}}]}}.
4. Run: node scripts/explainer-validate.mjs <ID> until ✓ ("not designed yet" warnings OK; errors are not).
Return JSON only: {{"id":"<ID>","ok":true|false,"newAssets":["..."],"note":"<=120 chars"}}"""

DP = f"""You are designing ONE technical diagram SVG asset for NDTAcademy explainer videos (repo {W}).
Asset: media-src/assets/<NAME>.svg + manifest <NAME>.json. Unique id prefix: "<PREFIX>". Used by lessons: <LESSONS>.
BRIEF: <BRIEF>

Hard conventions (validator + renderer depend on them):
- viewBox "0 0 600 340", TRANSPARENT background (video supplies the navy backdrop).
- EVERY id in the file (including <defs> ids) starts with "<PREFIX>".
- Style: dark glassmorphism — strokes/fills from #5fe0ff, #9fe6ff, #1E66F5, #eaf6ff; panel fills rgba(10,30,60,.55); labels 11-13px JetBrains Mono UPPERCASE #9fe6ff; thin 1.5-2px strokes.
- Reveal elements rest at opacity="0". Draw-on paths also get pathLength="100" stroke-dasharray="100" stroke-dashoffset="100".
- Optional scan group id "<PREFIX>scanG" only when the brief calls for probe/scan motion.
- ANY <filter> on a perfectly horizontal/vertical line MUST declare filterUnits="userSpaceOnUse" (Chrome renders nothing otherwise).
- Manifest <NAME>.json: {{"description":"one line","scan":{{"id":"<PREFIX>scanG","sweep":[x1,x2],"loop":true}} (only if scanG exists),"reveals":[{{"kind":"fade|draw|ping","id":"<PREFIX>...","at":<0.5-7 seconds>}}]}} — 3-6 reveals telling the story in order. Read 2 existing manifests as exemplars.
- TECHNICAL ACCURACY above all: real proportions, correct labels, correct units.
Iterate visually: render in headless Chrome (puppeteer-core installed; Chrome at "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome") on #0B1F3A at 1200x680, screenshot, LOOK, fix overlaps/illegibility/inaccuracy, repeat until professional. Verify every manifest reveal id exists in the SVG.
Return JSON only: {{"name":"<NAME>","ok":true|false,"iterations":<n>,"note":"<=100 chars"}}"""

VP = f"""You are the ACCURACY VERIFIER for NDTAcademy's NAS410 / SNT-TC-1A Level II training content (repo {W}). Audience: aircraft inspection technicians at an FAA Part 145 repair station. Errors here become errors in real inspections — be rigorous and skeptical.
Target lesson: src/data/content/<CID>/<ID>.json
Verify against NDT domain knowledge (physics, method practice, NAS410, SNT-TC-1A, ASTM/ASME/AWS):
1. Every checkQuestion: (a) keyed option factually correct; (b) EVERY distractor genuinely wrong; (c) explanation agrees with key and is sound; (d) question answerable from this lesson (grounded); (e) numbers, units, formulas, citations exact.
2. Sections, callouts, tables, captions: technical errors, wrong values/units, misstated standards.
FIX confirmed errors in place — minimal surgical edits, identical schema (same keys, 4 options, correct as index). Do NOT rewrite for style. After editing: node -e "JSON.parse(require('fs').readFileSync('src/data/content/<CID>/<ID>.json','utf8'))".
Return JSON only: {{"id":"<ID>","status":"clean"|"fixed","changes":[{{"where","was","now","why" — each <=100 chars}}],"uncertain":["<=120 chars each"]}}"""

VQP = f"""You are the ACCURACY VERIFIER for NDTAcademy's NAS410 / SNT-TC-1A Level II training content (repo {W}).
Target quiz: src/data/content/<CID>/quiz-<MID>.json (10 questions). Read ALL module lessons first for grounding: <LESSONS>.
Verify every question: keyed option correct; every distractor genuinely wrong; explanation sound; grounded in module lessons; numbers/units/citations exact.
FIX confirmed errors in place with minimal surgical edits (same schema). No style rewrites. Confirm valid JSON after edits.
Return JSON only: {{"id":"<MID>","status":"clean"|"fixed","changes":[{{"where","was","now","why" — each <=100 chars}}],"uncertain":["<=120 chars each"]}}"""

TP = f"""You are authoring 3-D trainer configs for ONE module of an NDTAcademy course (repo {W}).
Module: <MID> of course "<CID>" — lessons: <LESSONS>. Suggested engine: <ENGINE> (basic course: pick the best-fitting engine per lesson from ut/mt/et/rt/pt/rs).
1. Read the engine contract src/components/trainer3d/contract.ts and the engine's MANIFEST + modes/params/taskIds in src/components/trainer3d/engines/<ENGINE>.js (and others if mixing).
2. Read src/data/content/ut/trainers.json + src/data/content/vt/trainers.json as exemplars.
3. For EACH lesson where a hands-on task genuinely reinforces its theory (aim for most lessons), write a config: {{"engine","mode","title" (starts "Hands-on:"),"intro" (2-3 sentences tying the task to THIS lesson's idea),"params" (valid per manifest),"tasks":[2-4 task ids valid for that mode]}}. Skip lessons where no engine mode fits — do not force it.
4. Write ONE file: src/data/content/<CID>/trainer-fragments/<MID>.json = {{"<lessonId>": config, ...}} (only your module's lessons). Do NOT touch trainers.json (merge happens later).
5. Validate: every engine/mode/taskId you used exists in the engine MANIFEST; JSON parses.
Return JSON only: {{"id":"<MID>","ok":true|false,"count":<configs written>,"note":"<=120 chars"}}"""

def fleet_patch():
    lessons, quizzes = [], []
    for cid in COURSES:
        all_l = cur_lessons(cid); have = have_lessons(cid); mods = {}
        for lid, mid in all_l:
            mods.setdefault(mid, []).append(lid)
            if lid not in have: lessons.append({"cid": cid, "id": lid, "mid": mid})
        hq = have_quizzes(cid)
        quizzes += [{"cid": cid, "mid": m, "lessons": l} for m, l in mods.items() if m not in hq]
    if not lessons and not quizzes: return print("patch: NOTHING-TO-DO")
    emit("patch", f"""export const meta = {{
  name: 'fleet-patch', description: 'Author missing lessons and quizzes',
  phases: [ {{ title: 'Lessons' }}, {{ title: 'Quizzes' }} ],
}}
const LESSONS = {json.dumps(lessons)}
const QUIZZES = {json.dumps(quizzes)}
const LP = {json.dumps(LP)}
const QP = {json.dumps(QP)}
const S = {S_OK}
phase('Lessons')
const lr = await parallel(LESSONS.map(l => () => agent(LP.replaceAll('<ID>', l.id).replaceAll('<MID>', l.mid).replaceAll('<CID>', l.cid), {{ label: 'lesson:' + l.id, phase: 'Lessons', schema: S }})))
phase('Quizzes')
const qr = await parallel(QUIZZES.map(q => () => agent(QP.replaceAll('<MID>', q.mid).replaceAll('<CID>', q.cid).replaceAll('<LESSONS>', q.lessons.join(', ')), {{ label: 'quiz:' + q.mid, phase: 'Quizzes', schema: S }})))
return {{ lessonsOk: lr.filter(Boolean).filter(r=>r.ok).length, lessonsTotal: LESSONS.length,
  quizzesOk: qr.filter(Boolean).filter(r=>r.ok).length, quizzesTotal: QUIZZES.length,
  fails: [...lr.map((r,i)=>(r&&r.ok)?null:LESSONS[i].id), ...qr.map((r,i)=>(r&&r.ok)?null:QUIZZES[i].mid)].filter(Boolean) }}
""")

def fleet_specs():
    have = {os.path.basename(f)[:-5] for f in glob.glob(f"{W}/media-src/specs/*.json")}
    todo = [{"cid": cid, "id": lid} for cid in COURSES for lid, _ in cur_lessons(cid)
            if lid not in have and lid in have_lessons(cid)]
    skipped = [lid for cid in COURSES for lid, _ in cur_lessons(cid) if lid not in have and lid not in have_lessons(cid)]
    if skipped: print(f"specs: skipping (no lesson yet): {skipped}")
    if not todo: return print("specs: NOTHING-TO-DO")
    emit("specs", f"""export const meta = {{
  name: 'fleet-specs', description: 'Author missing explainer specs ({len(todo)})',
  phases: [ {{ title: 'Specs' }} ],
}}
const SPECS = {json.dumps(todo)}
const SP = {json.dumps(SP)}
const S = {S_OK}
phase('Specs')
const sr = await parallel(SPECS.map(s => () => agent(SP.replaceAll('<ID>', s.id).replaceAll('<CID>', s.cid), {{ label: 'spec:' + s.id, phase: 'Specs', schema: S }})))
return {{ ok: sr.filter(Boolean).filter(r=>r.ok).length, total: SPECS.length,
  fails: sr.map((r,i)=>(r&&r.ok)?null:SPECS[i].id).filter(Boolean),
  newAssets: sr.filter(Boolean).flatMap(r => r.newAssets || []) }}
""")

def fleet_design():
    briefs = json.load(open(f"{W}/scripts/fleets/asset-briefs.json"))
    for f in glob.glob(f"{W}/media-build/spec-asset-requests/*.json"):
        req = json.load(open(f))
        for a in req.get("assetRequests", []):
            if a["name"] not in briefs:
                briefs[a["name"]] = {"prefix": "".join(w[0] for w in a["name"].split("-"))[:4],
                                     "lessons": [req["lessonId"]], "brief": a["brief"]}
    # an asset is only "designed" when BOTH the SVG and its reveal manifest
    # exist — agents killed mid-write leave orphan SVGs that must be redone
    have = {os.path.basename(f)[:-4] for f in glob.glob(f"{W}/media-src/assets/*.svg")
            if os.path.exists(f[:-4] + ".json")}
    todo = [{"name": n, **v} for n, v in sorted(briefs.items()) if n not in have]
    # prefix collisions with existing assets are the designers' problem only if
    # ids clash inside one video; per-asset uniqueness of NEW prefixes is enough
    seen = set()
    for t in todo:
        p = t["prefix"]
        while p in seen: p += "x"
        seen.add(p); t["prefix"] = p
    if not todo: return print("design: NOTHING-TO-DO")
    emit("design", f"""export const meta = {{
  name: 'fleet-design', description: 'Design missing explainer assets ({len(todo)})',
  phases: [ {{ title: 'Design' }} ],
}}
const ASSETS = {json.dumps(todo)}
const DP = {json.dumps(DP)}
const S = {{ type: 'object', properties: {{ name: {{type:'string'}}, ok: {{type:'boolean'}}, iterations: {{type:'number'}}, note: {{type:'string'}} }}, required: ['name','ok'] }}
phase('Design')
const out = await parallel(ASSETS.map(a => () => agent(
  DP.replaceAll('<NAME>', a.name).replaceAll('<PREFIX>', a.prefix).replaceAll('<LESSONS>', (a.lessons||[]).join(', ')).replaceAll('<BRIEF>', a.brief),
  {{ label: 'design:' + a.name, phase: 'Design', schema: S }})))
return {{ designed: out.filter(Boolean).filter(r=>r.ok).length, total: ASSETS.length,
  failed: out.map((r,i)=>(r&&r.ok)?null:ASSETS[i].name).filter(Boolean) }}
""")

def fleet_accuracy():
    state_path = f"{W}/scripts/fleets/accuracy-state.json"
    done = set(json.load(open(state_path))["done"]) if os.path.exists(state_path) else set()
    target = [c for c in COURSES if c not in done]
    blocks, phases = [], []
    for cid in target:
        all_l = [l for l, _ in cur_lessons(cid) if l in have_lessons(cid)]
        mods = {}
        for lid, mid in cur_lessons(cid): mods.setdefault(mid, []).append(lid)
        qz = [{"mid": m, "lessons": l} for m, l in mods.items() if m in have_quizzes(cid)]
        if not all_l: continue
        phases.append(f"{{ title: '{cid.upper()}', detail: '{len(all_l)} lessons + {len(qz)} quizzes' }}")
        blocks.append(f"""phase('{cid.upper()}')
const l_{cid} = await parallel({json.dumps(all_l)}.map(id => () => agent(VP.replaceAll('<ID>', id).replaceAll('<CID>', '{cid}'), {{ label: 'verify:' + id, phase: '{cid.upper()}', schema: S }})))
const q_{cid} = await parallel({json.dumps(qz)}.map(q => () => agent(VQP.replaceAll('<MID>', q.mid).replaceAll('<CID>', '{cid}').replaceAll('<LESSONS>', q.lessons.join(', ')), {{ label: 'verify:quiz-' + q.mid, phase: '{cid.upper()}', schema: S }})))
results.push(...l_{cid}, ...q_{cid})""")
    if not blocks: return print("accuracy: NOTHING-TO-DO")
    nl = "\n"
    emit("accuracy", f"""export const meta = {{
  name: 'fleet-accuracy', description: 'Accuracy-verify courses: {", ".join(target)} (fix in place)',
  phases: [ {", ".join(phases)} ],
}}
const VP = {json.dumps(VP)}
const VQP = {json.dumps(VQP)}
const S = {{ type: 'object', properties: {{ id: {{type:'string'}}, status: {{type:'string', enum:['clean','fixed']}}, changes: {{type:'array'}}, uncertain: {{type:'array'}} }}, required: ['id','status'] }}
const results = []
{nl.join(blocks)}
const all = results.filter(Boolean)
const fixed = all.filter(r => r.status === 'fixed')
return {{ verified: all.length, clean: all.length - fixed.length, fixed: fixed.length,
  totalChanges: fixed.reduce((n,r) => n + (r.changes ? r.changes.length : 0), 0),
  fixedIds: fixed.map(r => r.id),
  changes: fixed.flatMap(r => (r.changes||[]).map(ch => ({{ id: r.id, ...ch }}))),
  uncertain: all.flatMap(r => (r.uncertain||[]).map(u => ({{ id: r.id, u }}))) }}
""")

def fleet_trainers():
    todo = []
    for cid in COURSES:
        if os.path.exists(f"{W}/src/data/content/{cid}/trainers.json"): continue
        mods = {}
        for lid, mid in cur_lessons(cid): mods.setdefault(mid, []).append(lid)
        todo += [{"cid": cid, "mid": m, "lessons": l, "engine": ENGINES.get(cid, "any")} for m, l in mods.items()]
    if not todo: return print("trainers: NOTHING-TO-DO")
    emit("trainers", f"""export const meta = {{
  name: 'fleet-trainers', description: 'Author 3-D trainer configs per module (fragment files)',
  phases: [ {{ title: 'Configs' }} ],
}}
const MODS = {json.dumps(todo)}
const TP = {json.dumps(TP)}
const S = {{ type: 'object', properties: {{ id: {{type:'string'}}, ok: {{type:'boolean'}}, count: {{type:'number'}}, note: {{type:'string'}} }}, required: ['id','ok'] }}
phase('Configs')
const out = await parallel(MODS.map(m => () => agent(
  TP.replaceAll('<MID>', m.mid).replaceAll('<CID>', m.cid).replaceAll('<LESSONS>', m.lessons.join(', ')).replaceAll('<ENGINE>', m.engine),
  {{ label: 'trainer:' + m.mid, phase: 'Configs', schema: S }})))
return {{ ok: out.filter(Boolean).filter(r=>r.ok).length, total: MODS.length,
  configs: out.filter(Boolean).reduce((n,r)=>n+(r.count||0),0),
  fails: out.map((r,i)=>(r&&r.ok)?null:MODS[i].mid).filter(Boolean) }}
""")

FLEETS = {"patch": fleet_patch, "specs": fleet_specs, "design": fleet_design,
          "accuracy": fleet_accuracy, "trainers": fleet_trainers}
if __name__ == "__main__":
    which = sys.argv[1:] or ["patch", "specs", "design", "accuracy", "trainers"]
    for w in which: FLEETS[w]()
