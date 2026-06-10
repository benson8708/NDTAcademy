# NDTAcademy.com

Online NDT training platform — Next.js (App Router) + Supabase. Competes with WorldSpec by pairing
self-paced, CP-105-traceable method training with **audit-ready formal training records**
(active-engagement hour tracking, SNT-TC-1A 2024 / NAS410 hour mapping, exportable company records).

## Repo layout

| Path | What it is |
|---|---|
| `web/` | The production Next.js app (TypeScript, no CSS framework — ported design system) |
| `supabase/migrations/` | Schema + RLS + seed migrations (catalog, 5,011-question bank) |
| `site/` | Original static prototype — now the design/content reference only |
| `tools/verify_compliance.py` | CP-105 coverage + hour verifier (writes `site/data/compliance.json`) |
| `resources/` | Source training material (6 GB library, not deployed) |

## Cloud Supabase (live)

- Project: **NDTAcademy** — ref `vamjeecpssxhzeyiqqsc`, region `us-east-2`, org Baron Innovations.
- DB password: in `.supabase-db-password` (gitignored). Keys: `web/.env.local`.
- Schema, RLS, and all seed data (8 courses / 14 levels / 97 modules / 344 lessons / 5,011 questions)
  are **already applied and verified**.
- Outbound Postgres ports were blocked on the build network, so migrations were applied over HTTPS via
  `web/scripts/apply-migrations-https.py` (Management API). On a normal network, plain
  `supabase db push` works — applied versions are recorded in `supabase_migrations.schema_migrations`.
- ⚠️ **Email confirmation is currently disabled** (`mailer_autoconfirm: true`) so signup could be
  tested autonomously. Before launch: re-enable confirmations + configure custom SMTP in
  Supabase Auth settings.

## Run locally

```bash
cd web
npm install
npm run dev          # http://localhost:3000 (or: npm start -- -p 3100 after npm run build)
```

`web/.env.local` (already present locally; recreate on other machines):

```
NEXT_PUBLIC_SUPABASE_URL=https://vamjeecpssxhzeyiqqsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=<sk_test_... — server only, empty until set up (see Stripe section)>
STRIPE_WEBHOOK_SECRET=<whsec_... from stripe listen / bootstrap --webhook>
FREE_BETA=true   # false ⇒ paywall enforced (purchase or org seat required)
```

## Deploy (Vercel)

1. Push this repo to GitHub; import in Vercel with **root directory `web/`**.
2. Set the four env vars above, with `NEXT_PUBLIC_SITE_URL=https://ndtacademy.com`
   (drives canonicals, sitemap, JSON-LD URLs).
3. Add the domain. (ndtacademy.com is currently a HugeDomains parking page — purchase/transfer first.)
4. After deploy: submit `https://ndtacademy.com/sitemap.xml` in Google Search Console.

## What's built & tested (June 9, 2026)

End-to-end tested against the live cloud DB (signup → enroll → lesson → heartbeats → exam → dashboards):

- **Marketing/SEO**: static pages for home (targets “NDT training”), courses, 8 course landing pages
  (full curriculum server-rendered), 5 practice-exam landing pages, training-hours pillar guide,
  resources, about, contact, compliance. JSON-LD (Organization, WebSite, Course, FAQPage,
  BreadcrumbList, ItemList), sitemap.xml, robots.txt, canonicals, OG image, 301s from old `.html` URLs.
- **Auth**: email/password signup (individual or company), SSR sessions, protected routes, signout.
- **Learning**: auto-enroll (free during beta), level tabs, module accordion, lesson player with
  objectives/media placeholders/CP-105 topics, mark-complete, prev/next.
- **Hour ledger**: 30-second heartbeats logged only while tab visible + user active (60 s idle cutoff);
  `time_logs` rows capped at 120 s each; rolled up via `training_hours_v`.
- **Practice exams**: 5,011 questions drawn server-side (`draw_questions` RPC), timed mode, scoring,
  missed-question review; attempts saved to `exam_attempts` for signed-in users; anonymous use free.
- **Dashboards**: student (KPIs, courses, attempts, certificates) and company (seats, roster,
  add-technician-by-email via service-role action, training-hour ledger, CSV export).
- **RLS verified**: members see only their own rows; org admins see members’ records; anonymous gets
  catalog/questions only; email-lookup function denied to clients.
- **Commerce (Phase 3, built June 9)**: entitlement-gated `/learn` (paywall renders when
  `FREE_BETA=false` and no purchase/org seat), signature-verified Stripe webhook writing
  purchases/entitlements/seat changes (idempotency verified with replayed + raced signed events
  against the live DB), seat packs updating `organizations.seat_limit` atomically with a ledger,
  billing panels on both dashboards, customer-portal links. See “Stripe commerce” below.

Test accounts (delete in Supabase Auth before launch): `jordan.martinez.test@ndtacademy.com`,
`sarah.chen.test@ndtacademy.com` (org “Acme Inspection Services”; holds a pre-hour-gate VT-I cert
with 0.04 h — issued before the gate existed), `alex.taylor.test@ndtacademy.com`
(individual; carries crafted test purchases — UT paid, RT refunded — from webhook verification),
`tom.hourgate.test@ndtacademy.com` (hour-gate verification; holds the gated VT-I cert with 8 h).

## Stripe commerce (Phase 3 — built, awaiting a test API key)

Individual course purchases + company seat packs via hosted Checkout Sessions. No Stripe key or
publishable key ever reaches the browser (checkout is a server-action redirect).

**How access works** (`web/src/lib/billing/access.ts`, enforced in `/learn/[slug]`, lesson pages,
and the heartbeat API): `FREE_BETA=true` → everything free (current state). Otherwise a user needs
an un-revoked `course_entitlements` row (individual purchase) **or** membership in any organization
(seats are all-catalog; `seat_limit` caps roster size) **or** `platform_admin`.

**Money flow**: buy button → server action creates a Checkout Session (prices resolved by
`lookup_key`, metadata carries `app/kind/user_id/course_id|org_id/seats`) → webhook
`web/src/app/api/stripe/webhook/route.ts` verifies the signature and fulfills
(`web/src/lib/billing/fulfill.ts`): purchase row (unique per session id), entitlement/enrollment
upserts, seat changes via the atomic `apply_seat_change` SQL function (ledger-gated, exactly-once,
refund floor = current roster size). The success redirect fulfills too — idempotent either way.
Full refunds revoke (course) or decrement (seats); partial refunds keep access. Foreign sessions
(this Stripe account hosts other apps) are ignored via the `metadata.app` tag.

**One-time setup when ready to charge** (the Stripe CLI's saved keys expired May 2025 — mint a fresh
*test* secret key at https://dashboard.stripe.com/test/apikeys, or `stripe login` to re-pair):

```bash
# 1. Put sk_test_... in web/.env.local (STRIPE_SECRET_KEY)
cd web && node scripts/stripe-bootstrap.mjs        # creates 8 course products + seat product
# 2a. Local webhook:  stripe listen --forward-to localhost:3000/api/stripe/webhook  → whsec to env
# 2b. Deployed:       node scripts/stripe-bootstrap.mjs --webhook https://<domain>/api/stripe/webhook
#     (prints STRIPE_WEBHOOK_SECRET once — set it in Vercel)
# 3. Flip FREE_BETA=false (and redeploy/rebuild — course-page CTAs are static) to enforce the paywall
```

Pricing lives in `web/src/data/stripe-catalog.json` (placeholder numbers — UT/RT/ET $349,
MT/PT $249, VT $149, Basic/RadSafety $299, seat $499; edit + re-run bootstrap, it migrates
lookup keys to new prices). Customer portal: enable the default configuration once at
https://dashboard.stripe.com/test/settings/billing/portal if portal links error.

## VT course — FULLY PRODUCED (June 9, 2026, late night)

Visual Testing is the flagship complete course, end-to-end tested (lesson → knowledge check →
module quiz → 50-question final → **certificate auto-issued**, code verified in the DB):

- **30 lessons** with original written instruction (≈36k words), all CP-105 VT topics validated
  by `web/scripts/validate-vt-content.mjs` (content) and the curriculum verifier (structure).
- **30 voiceovers** — ElevenLabs voice “Titan” (`dtSEyYGNJqjrtBArPCVZ`), 131k chars.
  Regenerate: `node scripts/generate-narration.mjs --force` (key in `web/.env.local`).
- **34 photorealistic images** — OpenAI `gpt-image-2` heroes per lesson + simulator backdrops:
  `node scripts/generate-images.mjs` (prompt manifest inside the script).
- **30 teaching videos** (title card + Ken Burns hero/diagram slides + narration, 1280×720) —
  built with ffmpeg (`scripts/build-videos.mjs`, output in gitignored `media-build/`) and served
  from the **Supabase Storage public bucket `vt-media`** via `scripts/upload-videos.mjs`, which
  writes the URL manifest `web/src/data/content/vt/videos.json`.
- **65 brand-style SVG diagrams**, tables, callouts per lesson.
- **Interactives**: scenario / hotspot / classification-sort / lighting-calculator exercises, plus
  two simulators — a **borescope scanning trainer** (drag a scope viewport over a photoreal scene,
  find indications) and a **lighting trainer** (lux slider; defects invisible below the 1000-lux
  procedure minimum). Defined per-lesson in content JSON (`simulator` field).
- **Assessments**: 240 authored questions (5-question check per lesson gating "Mark Complete",
  10-question module quizzes, finals drawing 50 random from the level pool) recorded in
  `quiz_attempts`; the certificate is issued via the `finalizeLevel` server action
  (service-role insert; clients cannot write certificates).
- **Auditable-hours certificate gate** (verified June 9, late night): a certificate requires
  **all three** — every lesson complete, a passing final, **and the level's full formal training
  hours logged as active engagement on that level's lessons** (8 h VT-I / 16 h VT-II, summed by
  the `lesson_seconds` RPC over heartbeat slices). Verified negative (100% final + 9/9 lessons +
  0.1 h logged → refused with a clear message) and positive (8.0 h logged → issued, cert records
  8 h). Students who pass the final early use the **"Claim Certificate"** button on the exam page
  once their hours complete — no retake needed. Hour progress is shown on the exam page hero and
  the curriculum's final-exam row.
- Lesson media order: teaching video (Storage) with hero poster → audio narration + transcript →
  sections/figures → interactive → simulator → CP-105 topics → references → knowledge check.

Content pipeline files: spec `web/content-spec/VT-CONTENT-SPEC.md`, per-module briefs in
`web/content-spec/briefs/`, lesson JSON in `web/src/data/content/vt/`.
⚠️ Deploy note: `web/public/audio/vt` is 112 MB of mp3 — consider moving narration to the
`vt-media` bucket (like videos) before Vercel deploys get slow.

## Landing page v2 (June 9, late night)

Rebuilt around brand recognition and the launch offer, verified in the browser:

- **Branding**: hero brand lockup (logo card + NDTACADEMY.COM wordmark + tagline), name woven
  through copy, the 3D calibration block is etched "NDTACADEMY.COM".
- **Founders + oversight**: "Founded by two multi-certified ASNT Level IIIs" section (placeholder
  bios/method chips — drop in real names, photos, cert details in `web/src/app/page.tsx`), plus an
  "Every student trains under a Level III" band (assigned → overseen → verified → signed off).
- **Motion** (all `prefers-reduced-motion` safe, one rAF scroll listener):
  scroll-driven **UT A-scan** in the hero (echo peaks morph as you scroll, traveling pulse,
  amber scan line), a **wave-form scroll progress bar** at page top, **CSS-3D calibration block
  + probe** that rotates 320° across the page scroll (zero WebGL payload), staggered
  appear-on-scroll reveals on every section, 3D tilt cards.
- **Free VT offer**: announcement bar + offer chip + dedicated band + FAQ + CTAs → /signup.
  Backed by a real grant: `FREE_COURSES=vt` (`web/src/lib/billing/access.ts`) keeps VT open to
  any signed-in account even when `FREE_BETA=false` — verified with a fresh no-org account
  (VT fully accessible; UT correctly showed the $349 paywall). End the promo with
  `FREE_COURSES=""` + rebuild.

## Known gaps / next phases (see PLAN.md)

- Stripe go-live: mint fresh test API key + run bootstrap (above), test a real card → then live key,
  re-enable email confirmations, delete test accounts/data (`purchases`, `course_entitlements`,
  `seat_events`, `stripe_events` test rows), revisit placeholder pricing.
- Knowledge checks / module quizzes / level final exams: placeholders (practice engine covers exam prep).
- Certificate PDF engine + verification page: `certificates` table exists; issuance logic not built.
- Media production for 344 lessons (placeholders render now).
- Question bank generic rewrite (`questions.generic_rewrite_pending` flags every row).
- `tools/verify_compliance.py` needs the OCR text of the outline PDFs in `ocr/` to recompute coverage
  (most outline PDFs are image scans; the original OCR pass wasn't persisted — `site/data/compliance.json`
  holds the verified 2026-06-09 report; ET can be re-checked with `pdftotext`).
