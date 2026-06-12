# NDTAcademy fleet resume plan

**Context:** Multi-agent build-out of all 7 NDT courses (goal: full parity with VT —
content, quizzes, interactives, 3-D trainers, explainer videos, accuracy verification).
Fleets repeatedly hit the Claude weekly usage limit; this plan lets any future session
(scheduled or manual) resume exactly where things stand. Work `cd web/` relative to repo root.

## How resumption works

`python3 scripts/fleets/gen.py <fleet>` recomputes each fleet **from disk state** and
writes `/tmp/fleet-<name>.js` — launch it with the Workflow tool (`{scriptPath}`).
A fleet with nothing left prints `NOTHING-TO-DO` and writes no file. All data is
inlined in the scripts (workflow args are dropped on resume — never use them).

## Order of operations

1. **patch** — missing lessons/quizzes (run first; everything depends on content).
   After: `node scripts/validate-content.mjs --course all` → only acceptable errors are
   files later fleets create.
2. **specs** + **trainers** + **accuracy** — independent, launch in parallel once patch lands.
   - accuracy covers courses NOT in `scripts/fleets/accuracy-state.json` → **add each
     course id to that file when its slice completes** (fixes are applied in place by agents).
   - trainers: after the fleet, merge fragments:
     `node scripts/fleets/merge-trainer-fragments.mjs et pt rad basic` then
     `npm run build` to confirm.
3. **design** — after specs land (spec agents file new asset requests into
   `media-build/spec-asset-requests/`, which gen.py folds in). Re-run gen.py design then.
4. **Media chain** (local CPU + ElevenLabs only, no Claude quota):
   - Narrate any new specs: `node scripts/explainer-narrate.mjs` variants used previously;
     beats live in `media-build/explainer-audio/<id>/beatN.mp3`. ElevenLabs key in `web/.env.local`.
     **Quota guard:** Pro tier 744,383 chars/mo, resets ~Jul 5. Beat narration is small (~10-115k);
     slide audio is big (~250k+/course) — MT done Jun 12; ET/PT/RAD/BASIC slide audio DEFERRED
     to the July quota unless headroom is confirmed.
   - Render: compute render-ready (spec + all assets + all beat mp3s present) and run
     `node scripts/explainer-render-all.mjs <ids...> --concurrency 2`.
   - Upload + wire manifests: `node scripts/upload-explainers.mjs --course <cid>` per course.
   - Slide audio: `node scripts/explainer-slide-narrate.mjs --course <cid>` (idempotent).
5. **Re-verify + ship:** `node scripts/validate-content.mjs --course all` (zero errors),
   `npm run build`, player E2E one lesson per course, then commit + push. Before every
   commit run the staged secret scan: grep the cached diff for the usual key prefixes
   (Stripe live + OpenAI-style project keys, Supabase personal tokens, webhook signing
   secrets, and base64 JWT headers) — the exact pattern list lives in the project
   memory/CLAUDE context; the diff must come back empty.

## Standing rules (user-set, do not violate)

- Secrets stay in gitignored `web/.env.local`; never use the live Stripe key.
- Heavy media (mp4/mp3) goes to Supabase Storage bucket `vt-media`, never the repo.
- Explainer videos LEAD lessons; slides are voiced (Titan v3, settings in scripts) with
  Continue gated on narration end; single subtle NDTAcademy.com watermark; no end cards.
- Commit + push after meaningful milestones without asking.

## State at last update (Jun 12, 2026)

- Content: all 7 courses complete (lessons + quizzes); only figure stragglers possible — trust the validator.
- Accuracy: VT/UT/RT verified+fixed (66 changes). MT/ET/PT/RAD/BASIC pending.
- Specs: VT 30 + UT/RT/MT 127 of 144 on disk (17 missing); ET/PT/RAD/BASIC none yet (~161).
- Assets: 135 on disk; ~103 briefs still undesigned (scripts/fleets/asset-briefs.json minus disk).
- Videos: VT 30 live; UT/RT/MT 21 uploaded + ~24 more rendering locally Jun 12 (upload after).
- Slide audio: VT + MT done (manifest check: src/data/content/<cid>/slide-audio.json).
- Trainers: engines done (6); configs live for VT/UT/RT/MT; ET/PT/RAD/BASIC pending fleet.
