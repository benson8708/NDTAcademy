import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { getIdentityStatus } from "@/lib/identity";
import { COURSES, courseById, courseLessonIds, fmtHours, slugForCourse } from "@/lib/curriculum";
import { isFreeBeta } from "@/lib/stripe/server";
import { fmtUsd } from "@/lib/stripe/catalog";
import { openBillingPortal } from "@/app/billing/actions";

export const metadata: Metadata = { title: "Student Dashboard", robots: { index: false } };

const METHOD_LABEL: Record<string, string> = {
  UT: "UT", RT: "RT", MPI: "MT", LPI: "PT", ECT: "ET",
};

const BILLING_NOTICE: Record<string, string> = {
  nocustomer: "No billing history yet — the portal opens after your first purchase.",
  error: "Couldn't open the billing portal. Please try again in a moment.",
  unconfigured: "Billing isn't open yet.",
};

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  const { billing } = await searchParams;
  const identity = await getIdentityStatus(supabase, user.id);

  const [
    { data: profile },
    { data: enrollments },
    { data: progressRows },
    { data: hourRows },
    { data: attempts },
    { data: quizAttempts },
    { data: certificates },
    { data: memberships },
    { data: purchases },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase.from("enrollments").select("course_id, status, enrolled_at").order("enrolled_at", { ascending: false }),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
    supabase.from("training_hours_v").select("course_id, hours").eq("user_id", user.id),
    supabase.from("exam_attempts").select("method, level, total, correct, score, passed, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("quiz_attempts").select("scope, scope_id, total, correct, score, passed, created_at").eq("user_id", user.id).in("scope", ["module", "final"]).order("created_at", { ascending: false }).limit(8),
    supabase.from("certificates").select("title, hours, issued_at, verification_code").eq("user_id", user.id).order("issued_at", { ascending: false }),
    supabase.from("org_memberships").select("org_id, role").eq("user_id", user.id),
    supabase.from("purchases").select("kind, course_id, seats, amount_total, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const doneIds = new Set((progressRows ?? []).map((r) => r.lesson_id));
  const hoursByCourse = new Map((hourRows ?? []).map((r) => [r.course_id, Number(r.hours)]));
  const totalHours = [...hoursByCourse.values()].reduce((a, b) => a + b, 0);
  const isOrgAdmin = (memberships ?? []).some((m) => m.role === "admin");

  const courseRows = (enrollments ?? [])
    .map((e) => {
      const course = courseById(e.course_id);
      if (!course) return null;
      const ids = courseLessonIds(course);
      const completed = ids.filter((id) => doneIds.has(id)).length;
      const pct = ids.length ? Math.round((completed / ids.length) * 100) : 0;
      const target = course.levels.reduce((s, l) => s + l.targetHours, 0);
      return {
        course,
        slug: slugForCourse(course.id),
        pct,
        logged: hoursByCourse.get(course.id) ?? 0,
        target,
        status: e.status,
      };
    })
    .filter((r) => r !== null);

  const inProgress = courseRows.filter((r) => r.pct < 100);
  const avgScore = attempts?.length
    ? Math.round(attempts.reduce((s, a) => s + Number(a.score), 0) / attempts.length)
    : null;
  const firstName = (profile?.full_name || "").split(" ")[0] || "there";
  const resume = courseRows.find((r) => r.pct < 100) ?? courseRows[0];

  // Unified recent-assessment list: practice exams + module quizzes + finals
  const moduleLabelById = new Map<string, string>();
  for (const c of COURSES)
    for (const l of c.levels)
      for (const m of l.modules) moduleLabelById.set(m.id, `${c.code} — ${m.title}`);
  const recentAttempts = [
    ...(attempts ?? []).map((a) => ({
      label: `${METHOD_LABEL[a.method] ?? a.method} Level ${"I".repeat(a.level)} — Practice (${a.total}q)`,
      created_at: a.created_at,
      score: Number(a.score),
      passed: a.passed,
    })),
    ...(quizAttempts ?? []).map((a) => {
      const dash = a.scope_id.lastIndexOf("-");
      const label =
        a.scope === "final"
          ? `${courseById(a.scope_id.slice(0, dash))?.code ?? a.scope_id} Level ${a.scope_id.slice(dash + 1)} — Final Exam`
          : `${moduleLabelById.get(a.scope_id) ?? a.scope_id} — Module Quiz`;
      return { label, created_at: a.created_at, score: Number(a.score), passed: a.passed };
    }),
  ]
    .sort((x, y) => (x.created_at < y.created_at ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="dash-body">
      <Header />
      <div className="dash-layout">
        <aside className="dash-side">
          <div className="side-label">Learn</div>
          <a href="/dashboard" className="active">Overview</a>
          <a href="/courses">Course Catalog</a>
          <a href="/practice-exams">Practice Exams</a>
          <div className="side-label">Records</div>
          <a href="#hours">Training Hours</a>
          <a href="#certs">Certificates</a>
          <a href="#exams">Exam History</a>
          <a href="#billing">Billing</a>
          {isOrgAdmin && (
            <>
              <div className="side-label">Company</div>
              <a href="/dashboard/company">Company Dashboard</a>
            </>
          )}
        </aside>

        <main className="dash-main">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1>Welcome back, {firstName}</h1>
              <p className="dash-sub">
                {resume
                  ? `${resume.course.name} is ${resume.pct}% complete — ${fmtHours(Math.max(resume.target - resume.logged, 0))} formal training hours remain toward the ${fmtHours(resume.target)} h design target.`
                  : "Enroll in a course to start logging formal training hours."}
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button className="btn btn-ghost btn-sm" type="submit">Sign Out</button>
            </form>
          </div>

          {!identity.verified && (
            <div className="panel" style={{ borderLeft: "3px solid var(--amber)" }}>
              <div className="panel-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span>
                  <strong>Identity verification required</strong> — a one-time government ID + selfie
                  check unlocks coursework, exams, and certificates.
                </span>
                <Link className="btn btn-primary btn-sm" href="/verify">Verify Now</Link>
              </div>
            </div>
          )}
          {billing && BILLING_NOTICE[billing] && (
            <div className="panel">
              <div className="panel-body">{BILLING_NOTICE[billing]}</div>
            </div>
          )}

          <div className="kpis" id="hours">
            <div className="kpi">
              <div className="lbl">Training hours logged</div>
              <div className="num">{fmtHours(Math.round(totalHours * 100) / 100)}</div>
              <div className="delta">active-engagement time</div>
            </div>
            <div className="kpi">
              <div className="lbl">Courses in progress</div>
              <div className="num">{inProgress.length}</div>
            </div>
            <div className="kpi">
              <div className="lbl">Avg practice score</div>
              <div className="num">{avgScore != null ? `${avgScore}%` : "—"}</div>
              <div className="delta">{attempts?.length ? `last ${attempts.length} attempts` : "no attempts yet"}</div>
            </div>
            <div className="kpi">
              <div className="lbl">Certificates earned</div>
              <div className="num">{certificates?.length ?? 0}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>My Courses</h3>
              {resume && (
                <Link className="btn btn-primary btn-sm" href={`/learn/${resume.slug}`}>
                  Resume {resume.course.code}
                </Link>
              )}
            </div>
            <div className="panel-body flush">
              {courseRows.length === 0 ? (
                <div className="panel-empty">
                  No enrollments yet. <Link href="/courses">Browse the course catalog</Link>
                  {isFreeBeta() ? " — free during beta." : "."}
                </div>
              ) : (
                <table className="data">
                  <thead>
                    <tr><th>Course</th><th>Levels</th><th>Progress</th><th>Hours logged</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {courseRows.map((r) => (
                      <tr key={r.course.id}>
                        <td><strong>{r.course.name}</strong></td>
                        <td>{r.course.levels.map((l) => l.level).join(", ")}</td>
                        <td>
                          <div className={`bar${r.pct === 100 ? " good" : r.pct < 25 ? " warn" : ""}`}>
                            <i style={{ width: `${r.pct}%` }} />
                          </div>
                        </td>
                        <td>{fmtHours(r.logged)} / {fmtHours(r.target)}</td>
                        <td>
                          {r.pct === 100
                            ? <span className="badge ok">Complete</span>
                            : <span className="badge info">In progress</span>}
                        </td>
                        <td><Link href={`/learn/${r.slug}`}>Open</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="grid cols-2">
            <div className="panel" id="exams">
              <div className="panel-head">
                <h3>Recent Exam Attempts</h3>
                <Link className="btn btn-ghost btn-sm" href="/practice-exams">New Exam</Link>
              </div>
              <div className="panel-body flush">
                {!recentAttempts.length ? (
                  <div className="panel-empty">No attempts yet — <Link href="/practice-exams">take a free practice exam</Link>.</div>
                ) : (
                  <table className="data">
                    <thead><tr><th>Exam</th><th>Date</th><th>Score</th><th></th></tr></thead>
                    <tbody>
                      {recentAttempts.map((a, i) => (
                        <tr key={i}>
                          <td>{a.label}</td>
                          <td>{new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                          <td>{Math.round(a.score)}%</td>
                          <td>
                            {a.passed
                              ? <span className="badge ok">Pass</span>
                              : <span className="badge bad">Below 80%</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="panel" id="certs">
              <div className="panel-head"><h3>Certificates</h3></div>
              <div className="panel-body flush">
                {!certificates?.length ? (
                  <div className="panel-empty">
                    Certificates are issued when logged hours, lessons, and the final exam all meet
                    requirements for a level.
                  </div>
                ) : (
                  <table className="data">
                    <thead><tr><th>Certificate</th><th>Issued</th><th>Hours</th><th>Verify</th></tr></thead>
                    <tbody>
                      {certificates.map((c) => (
                        <tr key={c.verification_code}>
                          <td>{c.title}</td>
                          <td>{new Date(c.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td>{fmtHours(Number(c.hours))}</td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: ".78rem" }}>{c.verification_code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="panel" id="billing">
            <div className="panel-head">
              <h3>Billing</h3>
              <form action={openBillingPortal.bind(null, "/dashboard")}>
                <button className="btn btn-ghost btn-sm" type="submit">
                  Manage Billing &amp; Receipts
                </button>
              </form>
            </div>
            <div className="panel-body flush">
              {!purchases?.length ? (
                <div className="panel-empty">
                  No purchases yet.{isFreeBeta() ? " Every course is free during beta." : ""}
                </div>
              ) : (
                <table className="data">
                  <thead><tr><th>Purchase</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {purchases.map((p, i) => (
                      <tr key={i}>
                        <td>
                          {p.kind === "course"
                            ? `${courseById(p.course_id ?? "")?.name ?? p.course_id} — course`
                            : `Company seats × ${p.seats}`}
                        </td>
                        <td>{new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td>{fmtUsd(p.amount_total)}</td>
                        <td>
                          {p.status === "refunded"
                            ? <span className="badge warn">Refunded</span>
                            : <span className="badge ok">Paid</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>All Courses</h3></div>
            <div className="panel-body" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COURSES.map((c) => (
                <Link key={c.id} className="btn btn-ghost btn-sm" href={`/learn/${slugForCourse(c.id)}`}>
                  {c.code}
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
