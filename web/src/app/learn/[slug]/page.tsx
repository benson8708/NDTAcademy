import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CurriculumBrowser from "./CurriculumBrowser";
import { createClient } from "@/lib/supabase/server";
import { courseBySlug, courseLessonIds, fmtHours, courseLessonStats, levelLessonIds } from "@/lib/curriculum";
import { getCourseAccess } from "@/lib/billing/access";
import { getIdentityStatus } from "@/lib/identity";
import { retrieveAndFulfillSession } from "@/lib/billing/fulfill";
import { isStripeConfigured } from "@/lib/stripe/server";
import { courseCatalogItem, fmtUsd } from "@/lib/stripe/catalog";
import { startCourseCheckout } from "@/app/billing/actions";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

const BILLING_NOTICE: Record<string, string> = {
  error: "Something went wrong starting checkout. You have not been charged — please try again.",
  unconfigured: "Purchasing isn't open yet. Hang tight — courses unlock for purchase soon.",
};

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; billing?: string }>;
}) {
  const { slug } = await params;
  const { session_id: sessionId, billing } = await searchParams;
  const course = courseBySlug(slug);
  if (!course) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${slug}`);

  // Returning from Checkout: fulfill immediately rather than waiting on the
  // webhook (both paths are idempotent — first writer wins, second no-ops).
  let justPurchased = false;
  if (sessionId && isStripeConfigured()) {
    try {
      const result = await retrieveAndFulfillSession(sessionId, user.id);
      justPurchased = result.ok;
    } catch (err) {
      console.error("success-redirect fulfillment failed (webhook will retry)", err);
    }
  }

  const access = await getCourseAccess(supabase, user.id, course.id);

  // Identity proofing: required before any coursework, regardless of payment.
  const identity = await getIdentityStatus(supabase, user.id);
  if (access.ok && !identity.verified) {
    return (
      <>
        <Header />
        <main>
          <section className="course-head on-dark">
            <div className="wrap">
              <span className="kicker">{course.code} · Identity Verification Required</span>
              <h1>{course.name}</h1>
              <div className="cp">Built to {course.cp105}</div>
            </div>
          </section>
          <section className="block" style={{ minHeight: "40vh" }}>
            <div className="wrap" style={{ maxWidth: 640 }}>
              <div className="card feature" style={{ borderTopColor: "var(--amber)" }}>
                <span className="code" style={{ color: "#B27516" }}>One-time step</span>
                <h3>Verify your identity to start training</h3>
                <p>
                  Your formal training hours and certificates are tied to a verified identity —
                  it&apos;s what makes the record auditable and lets your assigned Level III sign
                  off on it. A government ID and a selfie, about two minutes, once.
                </p>
                <p style={{ marginTop: 16 }}>
                  <Link className="btn btn-primary" href={`/verify?next=/learn/${slug}`}>
                    Verify My Identity
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!access.ok) {
    const item = courseCatalogItem(course.id);
    const stats = courseLessonStats(course);
    const notice = billing ? BILLING_NOTICE[billing] : undefined;
    const purchasable = isStripeConfigured() && item != null;
    return (
      <>
        <Header />
        <main>
          <section className="course-head on-dark">
            <div className="wrap">
              <span className="kicker">
                {course.code} ·{" "}
                {course.levels.length > 1 ? `Levels ${course.levels.map((l) => l.level).join(" & ")}` : course.levels[0].level}
              </span>
              <h1>{course.name}</h1>
              <div className="cp">
                Built to {course.cp105}
                {course.jurisdictionNote ? " · Jurisdiction requirements vary" : ""}
              </div>
            </div>
          </section>

          <section className="block tight">
            <div className="wrap" style={{ maxWidth: 920 }}>
              {notice && (
                <div className="card" style={{ marginBottom: 18, borderColor: "var(--warn, #c77)" }}>
                  <p style={{ margin: 0 }}>{notice}</p>
                </div>
              )}
              <div className="grid cols-2" style={{ alignItems: "start" }}>
                <div className="card feature">
                  <span className="code">One-time purchase · lifetime access</span>
                  <h3 style={{ fontSize: "2rem", margin: "6px 0 2px" }}>
                    {item ? fmtUsd(item.amount) : "—"}
                  </h3>
                  <p style={{ marginTop: 4 }}>
                    {course.name} — every level and module ({stats.lessons} lessons,{" "}
                    {fmtHours(stats.hours)} designed training hours), active-engagement hour
                    ledger, exam prep, and certificate eligibility when completion criteria
                    are met.
                  </p>
                  {purchasable ? (
                    <form action={startCourseCheckout.bind(null, course.id)}>
                      <button className="btn btn-primary" type="submit">
                        Buy {course.code} — {fmtUsd(item!.amount)}
                      </button>
                    </form>
                  ) : (
                    <button className="btn btn-primary" disabled title="Purchasing opens soon">
                      Purchasing opens soon
                    </button>
                  )}
                  <p style={{ fontSize: ".8rem", color: "var(--text-soft)", marginTop: 10 }}>
                    Secure checkout by Stripe. You&apos;ll be returned here with the course
                    unlocked.
                  </p>
                </div>
                <div className="grid" style={{ alignContent: "start" }}>
                  <div className="card">
                    <span className="code">Training for a team?</span>
                    <h3>Company seats include every course</h3>
                    <p>
                      Seats give each technician on your roster the full catalog plus the
                      company training-hour ledger and audit exports. Manage seats from the{" "}
                      <Link href="/dashboard/company">company dashboard</Link>, or{" "}
                      <Link href="/contact">contact us</Link> for volume pricing.
                    </p>
                  </div>
                  <div className="card">
                    <span className="code">Already purchased?</span>
                    <p style={{ marginBottom: 0 }}>
                      Purchases unlock within a few seconds of payment. If this page still
                      shows after a successful payment, refresh once or check{" "}
                      <Link href="/dashboard">your dashboard</Link>.
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: 28 }}>
                <Link href={`/courses/${slug}`} className="btn btn-ghost btn-sm">
                  ← Course details &amp; curriculum
                </Link>
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Access granted — make sure an enrollment row exists (idempotent).
  await supabase
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_id: course.id },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );

  const lessonIds = courseLessonIds(course);
  const scopeIds = [
    ...course.levels.flatMap((l) => l.modules.map((m) => m.id)),
    ...course.levels.map((l) => `${course.id}-${l.level}`),
  ];
  const [{ data: progressRows }, { data: hourRows }, { data: passedRows }] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).in("lesson_id", lessonIds),
    supabase.from("training_hours_v").select("hours").eq("user_id", user.id).eq("course_id", course.id),
    supabase
      .from("quiz_attempts")
      .select("scope_id")
      .eq("user_id", user.id)
      .eq("passed", true)
      .in("scope", ["module", "final"])
      .in("scope_id", scopeIds),
  ]);
  const done = new Set((progressRows ?? []).map((r) => r.lesson_id));
  const loggedHours = Number(hourRows?.[0]?.hours ?? 0);
  const passedScopeIds = [...new Set((passedRows ?? []).map((r) => r.scope_id))];

  // Per-level logged hours — the certificate's auditable-hours requirement
  const levelSecondRows = await Promise.all(
    course.levels.map((l) =>
      supabase.rpc("lesson_seconds", { p_lesson_ids: levelLessonIds(l) }).then((r) => Number(r.data ?? 0)),
    ),
  );
  const levelHours = Object.fromEntries(
    course.levels.map((l, i) => [`${course.id}-${l.level}`, Math.round((levelSecondRows[i] / 3600) * 10) / 10]),
  );

  return (
    <>
      <Header />
      <main>
        <section className="course-head on-dark">
          <div className="wrap">
            <span className="kicker">
              {course.code} ·{" "}
              {course.levels.length > 1 ? `Levels ${course.levels.map((l) => l.level).join(" & ")}` : course.levels[0].level}
            </span>
            <h1>{course.name}</h1>
            <div className="cp">
              Built to {course.cp105}
              {course.jurisdictionNote ? " · Jurisdiction requirements vary" : ""}
            </div>
            <div className="hours-strip">
              <div className="hour-pill">
                <div className="lbl">Your logged training time</div>
                <div className="val">{fmtHours(loggedHours)}<em>h</em></div>
              </div>
              {course.levels.map((l) => (
                <div key={l.level} className="hour-pill">
                  <div className="lbl">Level {l.level} — course length</div>
                  <div className="val">{fmtHours(l.targetHours)}<em>h</em></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="block tight">
          <div className="wrap">
            {justPurchased && (
              <div className="card" style={{ marginBottom: 18 }}>
                <span className="code">Purchase complete</span>
                <p style={{ margin: "4px 0 0" }}>
                  {course.name} is yours — your receipt is in your email, and billing lives
                  in your <Link href="/dashboard">dashboard</Link>.
                </p>
              </div>
            )}
            <CurriculumBrowser
              slug={slug}
              levels={course.levels.map((l) => ({
                level: l.level,
                targetHours: l.targetHours,
                description: l.description ?? "",
                finalExam: l.finalExam ?? null,
                modules: l.modules.map((m) => ({
                  id: m.id,
                  title: m.title,
                  cpSection: m.cpSection ?? "",
                  hours: m.hours,
                  moduleQuiz: m.moduleQuiz ?? null,
                  lessons: m.lessons.map((ls) => ({
                    id: ls.id,
                    title: ls.title,
                    minutes: ls.minutes,
                    media: [...new Set(ls.media.map((x) => x.type))],
                  })),
                })),
              }))}
              doneIds={[...done]}
              passedScopeIds={passedScopeIds}
              levelHours={levelHours}
              courseId={course.id}
            />
            <p style={{ marginTop: 28 }}>
              <Link href="/dashboard" className="btn btn-ghost btn-sm">← Back to Dashboard</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
