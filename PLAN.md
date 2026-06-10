# NDTAcademy.com — Project Plan (v2)

Goal: a paid online NDT training platform for individuals and companies, competing with WorldSpec by pairing rich self-paced training with audit-ready formal training records.

> **STATUS UPDATE (June 9, 2026, late evening):** Phases 1–3 are BUILT and TESTED against the live
> Supabase cloud project (`vamjeecpssxhzeyiqqsc`, schema + RLS + full seed applied). The Next.js app
> lives in `web/` — marketing/SEO pages, auth, lesson player, heartbeat hour ledger, DB-backed
> practice exams, both dashboards, and now **Stripe commerce**: entitlement-gated learning
> (FREE_BETA flag keeps beta free), hosted Checkout for individual courses + company seat packs,
> signature-verified webhook fulfillment (idempotency proven with replayed/raced signed events
> against the live DB), refund revocation, atomic seat-count updates, billing panels + customer
> portal. Awaiting only a fresh Stripe *test* API key (saved CLI keys expired) to run
> `web/scripts/stripe-bootstrap.mjs` and exercise real test-card checkouts. See README.md
> (“Stripe commerce”) for setup + the verified test matrix.
>
> **LATER THAT NIGHT — VT COURSE FULLY PRODUCED:** all 30 VT lessons now ship real content —
> written instruction, ElevenLabs voiceovers (Mike's chosen voice "Titan"), gpt-image-2
> photorealistic imagery, ffmpeg-assembled teaching videos (Supabase Storage `vt-media`),
> 65 SVG diagrams, interactive exercises + borescope/lighting simulators, and 240 assessment
> questions (knowledge checks gate lesson completion; module quizzes; level finals draw 50 from
> the pool; passing final + all lessons ⇒ certificate issued server-side). Verified end-to-end in
> the browser against the live DB. See README "VT course — FULLY PRODUCED". The same pipeline
> (web/content-spec + web/scripts) is ready to produce the other 7 courses.
> Remaining: Phase 4 (certificate PDF rendering + public verification page), Phase 5
> (admin/content system), media production for the other courses, question-bank generic rewrite.

MVP catalog: VT, PT, MT, UT, ET, RT as generic (industry-neutral) NDT method courses aligned to CP-105 topical outlines and mapped to SNT-TC-1A / NAS410 formal training-hour requirements. Certificates document course completion / formal training evidence only, never employer certification.

## Stack

- App: Next.js (App Router) deployed on Vercel.
- Backend: Supabase — Auth (SSR), Postgres with RLS on all exposed tables, private Storage buckets with signed URLs.
- Payments: Stripe Billing + Checkout Sessions — individual purchases, company seat packs, subscriptions, invoices, renewals. Webhooks (signature-verified) update entitlements. No secret/service-role keys in client code.

## What exists today (built June 9, 2026)

`site/` contains a working static prototype that becomes the design system and content source for the Next.js app:

- Design system (`site/css/style.css`): brand colors from the logo, Barlow Condensed / Barlow / IBM Plex Mono type, cards, tables, forms, dashboard layout. Ports directly to the Next.js app (Tailwind config or CSS modules).
- Marketing pages: Home, Courses, Practice Exams, Resources, About, Contact. These become the public Next.js routes nearly as-is.
- Practice exam engine (`site/js/exam.js` + `site/data/questions-*.json`): 5,011 questions (UT/RT/MPI/LPI/ECT × Levels 1–3) parsed from Questions.csv, random draw, timed mode, scoring, missed-question review. Logic ports to a React component; the bank seeds the Postgres question tables.
  - NOTE per spec: existing questions inform structure but content gets rewritten to generic NDT examples before paid use. Bank is flagged "generic rewrite pending" in admin.
- Dashboard prototypes (sample data): `dashboard-student.html`, `dashboard-company.html`, `admin.html`, `login.html`. These are the UI spec for the real dashboards — training-hour ledger, seat management, Level III review status, versioned standards library are all represented.
- Brand assets: optimized logo (98KB / 7KB / favicon) in `site/assets/`, 2024 course outline PDFs in `site/assets/outlines/`.

Preview the prototype: open `site/index.html` in a browser (everything, including exams and curricula, works directly from disk).

### Curriculum build (June 9, 2026)
All training modules are built with media placeholders in `site/data/curriculum/` (8 courses, 14 level-curricula, 91 modules, 337 lessons, 415 total training hours), rendered by `course.html` + `js/course.js`:
- Hour targets met per level: UT 40/40, RT 40/40, ET 40/40 (SNT-TC-1A 2024 = NAS410 = 40); MT 16/16 and PT 16/16 (NAS410 governs, exceeds SNT-TC-1A); VT 8/16 (SNT-TC-1A; NAS410 silent on VT); Basic 40; Rad Safety 40 (jurisdiction note included). Direct-to-Level-II totals recorded per Note 1 of Table 6.3.1A.
- Topics: full coverage of the ANSI/ASNT CP-105-2024 topical outlines (OCR'd from the 2024 outline PDFs). Advanced techniques (PAUT, FMC, TOFD, CR/DR/CT, RFT/ACFM/ECA) are catalogued in `futureTechniques` for later buildout.
- Every lesson: objectives, CP-105 topic list, 2-4 media placeholders (video / narration / diagram / interactive / simulation / reference), knowledge-check placeholder. Every module: quiz placeholder. Every level: final exam placeholder wired to the matching question bank.
- Content production to-do: produce media for placeholders, write knowledge-check/module-quiz questions, generic rewrite of the 5,011-question bank.
- Hour sources: SNT-TC-1A 2024 Table 6.3.1A (extracted from the licensed PDF in resources); NAS410 hours per Table 1 (verify against purchased NAS410 Rev 6 text before launch).

### Compliance assurance (June 9, 2026)
`tools/verify_compliance.py` provides repeatable, machine-checked evidence; `site/compliance.html` renders the report:
- CP-105 coverage: all 1,291 numbered items parsed from the OCR'd CP-105-2024 outlines trace to a lesson topic (100% on all 8 courses). Items that fail to match are emitted to a Level III review queue, never assumed covered. Gaps found on first run (PT 36, VT 69, MT 10, ET 3, RT 1) were fixed by patching the curricula.
- Hours: per-level designed minutes vs governing requirement = max(SNT-TC-1A 2024, NAS410). All 14 level-curricula meet with margin.
- Process rule: re-run the verifier after ANY curriculum edit; the report is dated and shipped with the site. Delivery-time hour enforcement (active-engagement tracking + certificate gating) is implemented in the Supabase phase; Level III review/approval remains the human authority on top of the automated checks.

## Build phases

### Phase 1 — Foundation (scaffold + auth + catalog)
1. `create-next-app` + Supabase project; port design system and marketing pages.
2. Schema v1: users, organizations, org_memberships (roles: student, company_admin, instructor, platform_admin), courses, course_versions, modules, activities, enrollments, seats.
3. Supabase SSR auth, role-based middleware, RLS policies per role.
4. Course catalog and paywall stubs.

### Phase 2 — Learning core
1. Lesson player: video, voiceover, diagrams, interactive checks, references, quizzes, progress; pause/resume, bookmarks, review mode, retakes.
2. Active-time tracking: heartbeat-based engagement logging that pauses on idle, hidden tab, or disconnect → time_logs table → training-hour ledger.
3. Question banks in Postgres (seeded from existing JSON), module quizzes + final exams, attempts table.

### Phase 3 — Commerce ✅ (built June 9, 2026; subscriptions deferred)
1. Stripe products: individual course purchase ✅, company seat packs ✅, subscriptions (deferred —
   the lookup-key catalog + webhook architecture extends to Billing when wanted).
2. Checkout Sessions ✅ + customer portal ✅; webhook handlers (signature-verified) for entitlements ✅,
   seat counts ✅, refund revocation ✅, async-payment failures ✅, replays/races (idempotent) ✅.
   Failed payments never grant access (fulfillment requires `payment_status=paid`).

### Phase 4 — Compliance + records
1. Standards as versioned records: CP-105 2024, SNT-TC-1A 2024, NAS410 Rev 6+; training-hour matrices by standard/method/level incl. direct-to-Level-II rules.
2. Certificate engine (PDF): student name, course/method/level, hours awarded, completion date, course version, standards mapping, Level III approval identity, verification ID + QR. Issued only when time + content + quiz + final exam criteria are all met. Historical certificates immutable across standard/version changes.
3. Company portal: invites, seat assignment, per-method progress, hour ledger, downloadable audit reports.

### Phase 5 — Admin/content system
1. Course builder with standards mapping and Level III approval workflow (draft → in review → approved).
2. CP-105 outline ingestion: OCR + human review queue.
3. Question bank manager incl. generic-rewrite workflow for the existing 5,011 questions.

### Phase 6 — Test plan (acceptance gates)
- No access to unpaid courses; company admins see only their own technicians (RLS verified per role).
- Time tracking pauses for idle/hidden/disconnected sessions.
- Certificates blocked until time, lesson, and exam criteria are met; immutable after issue.
- Stripe: subscription, cancellation, failed payment, seat increase, webhook replay.
- PDF rendering + QR verification.

## Open items

- Domain: ndtacademy.com currently shows a HugeDomains parking page — confirm ownership/purchase before launch.
- RT: radiation safety content and jurisdiction/regulatory disclaimers tracked separately from RT theory (modeled in admin prototype).
- Content production: rewrite question bank to generic examples; build lesson media from the `resources/` library (6 GB source material).
- Contact email + Formspree endpoint are placeholders in the prototype (marked TODO).

## References

- ASNT standards: https://www.asnt.org/standards-publications/standards
- NAS410 Rev 6: https://www.aia-aerospace.org/news/aia-and-accuris-release-nas410-revision-6-advancing-aerospace-safety-and-workforce-development/
- WorldSpec: https://www.worldspec.org/
- Supabase SSR auth: https://supabase.com/docs/guides/auth/server-side
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
