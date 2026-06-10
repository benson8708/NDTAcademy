import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { courseById, courseLessonIds, fmtHours, findLesson, COURSES } from "@/lib/curriculum";
import AddTechnician from "./AddTechnician";
import ExportCsvButton from "./ExportCsvButton";
import { isFreeBeta, isStripeConfigured } from "@/lib/stripe/server";
import { fmtUsd, SEAT_ITEM } from "@/lib/stripe/catalog";
import { retrieveAndFulfillSession } from "@/lib/billing/fulfill";
import { openBillingPortal, startSeatCheckout } from "@/app/billing/actions";

export const metadata: Metadata = { title: "Company Dashboard", robots: { index: false } };

const BILLING_NOTICE: Record<string, string> = {
  cancelled: "Checkout cancelled — no seats were purchased.",
  error: "Something went wrong starting checkout. You have not been charged — please try again.",
  unconfigured: "Seat purchasing isn't open yet.",
  nocustomer: "No billing history yet — the portal opens after your first purchase.",
};

export default async function CompanyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; billing?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/company");
  const { session_id: sessionId, billing } = await searchParams;

  // Returning from seat checkout: fulfill before reading seat_limit so the
  // new seats show immediately (idempotent against the webhook).
  let seatsJustPurchased = false;
  if (sessionId && isStripeConfigured()) {
    try {
      const result = await retrieveAndFulfillSession(sessionId, user.id);
      seatsJustPurchased = result.ok;
    } catch (err) {
      console.error("seat fulfillment on return failed (webhook will retry)", err);
    }
  }

  const { data: adminMemberships } = await supabase
    .from("org_memberships")
    .select("org_id, role, organizations(id, name, seat_limit)")
    .eq("user_id", user.id)
    .eq("role", "admin");

  const org = adminMemberships?.[0]?.organizations as unknown as
    | { id: string; name: string; seat_limit: number }
    | undefined;

  if (!org) {
    return (
      <div className="dash-body">
        <Header />
        <main className="dash-main" style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{ marginTop: 36 }}>Company Dashboard</h1>
          <p className="dash-sub">
            Your account isn&apos;t an admin of a company yet. Create a company account from the{" "}
            <Link href="/signup">signup page</Link>, or ask your company admin to add you to their
            roster. Questions? <Link href="/contact">Contact us</Link>.
          </p>
          <Link className="btn btn-primary" href="/dashboard">Back to Student Dashboard</Link>
        </main>
      </div>
    );
  }

  const [{ data: members }, { data: hourRows }, { data: ledger }, { data: seatEvents }] = await Promise.all([
    supabase
      .from("org_memberships")
      .select("user_id, role, created_at, profiles(full_name)")
      .eq("org_id", org.id)
      .order("created_at"),
    supabase.from("training_hours_v").select("user_id, course_id, hours"),
    supabase
      .from("time_logs")
      .select("user_id, course_id, lesson_id, seconds, created_at")
      .order("created_at", { ascending: false })
      .limit(400),
    supabase
      .from("seat_events")
      .select("delta, reason, created_at")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const memberIds = (members ?? []).map((m) => m.user_id);
  const nameOf = new Map(
    (members ?? []).map((m) => [
      m.user_id,
      ((m.profiles as unknown as { full_name: string } | null)?.full_name || "—"),
    ]),
  );

  const [{ data: progressRows }, { data: enrollRows }, { data: certRows }] = await Promise.all([
    supabase.from("lesson_progress").select("user_id, lesson_id").in("user_id", memberIds),
    supabase.from("enrollments").select("user_id, course_id, enrolled_at").in("user_id", memberIds),
    supabase.from("certificates").select("user_id, title, issued_at").in("user_id", memberIds).order("issued_at", { ascending: false }).limit(8),
  ]);

  // Per-member rollup: primary course = most recently enrolled; progress over that course
  const doneByUser = new Map<string, Set<string>>();
  (progressRows ?? []).forEach((r) => {
    if (!doneByUser.has(r.user_id)) doneByUser.set(r.user_id, new Set());
    doneByUser.get(r.user_id)!.add(r.lesson_id);
  });
  const hoursByUser = new Map<string, number>();
  const hoursByUserCourse = new Map<string, number>();
  (hourRows ?? []).forEach((r) => {
    hoursByUser.set(r.user_id, (hoursByUser.get(r.user_id) ?? 0) + Number(r.hours));
    hoursByUserCourse.set(`${r.user_id}:${r.course_id}`, Number(r.hours));
  });
  const lastActive = new Map<string, string>();
  (ledger ?? []).forEach((r) => {
    if (!lastActive.has(r.user_id)) lastActive.set(r.user_id, r.created_at);
  });

  const roster = (members ?? []).map((m) => {
    const enrolls = (enrollRows ?? [])
      .filter((e) => e.user_id === m.user_id)
      .sort((a, b) => (a.enrolled_at < b.enrolled_at ? 1 : -1));
    const primary = enrolls[0] ? courseById(enrolls[0].course_id) : null;
    let pct = 0, logged = 0, target = 0;
    if (primary) {
      const ids = courseLessonIds(primary);
      const done = doneByUser.get(m.user_id) ?? new Set();
      pct = ids.length ? Math.round((ids.filter((id) => done.has(id)).length / ids.length) * 100) : 0;
      logged = hoursByUserCourse.get(`${m.user_id}:${primary.id}`) ?? 0;
      target = primary.levels.reduce((s, l) => s + l.targetHours, 0);
    }
    const last = lastActive.get(m.user_id);
    const daysSince = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000) : null;
    return {
      userId: m.user_id,
      name: nameOf.get(m.user_id) ?? "—",
      role: m.role,
      course: primary ? `${primary.code}${primary.levels.length > 1 ? "" : ` ${primary.levels[0].level}`}` : "—",
      courseName: primary?.name ?? "Not enrolled",
      pct,
      logged,
      target,
      totalHours: hoursByUser.get(m.user_id) ?? 0,
      daysSince,
    };
  });

  const avgProgress = roster.length
    ? Math.round(roster.reduce((s, r) => s + r.pct, 0) / roster.length)
    : 0;

  const ledgerRows = (ledger ?? []).slice(0, 60).reduce<{
    key: string; date: string; user: string; label: string; seconds: number;
  }[]>((acc, r) => {
    // Collapse consecutive heartbeats for the same user+lesson+day into one line
    const day = new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const key = `${r.user_id}:${r.lesson_id}:${day}`;
    const existing = acc.find((x) => x.key === key);
    if (existing) {
      existing.seconds += r.seconds;
      return acc;
    }
    let label = r.course_id.toUpperCase();
    const course = courseById(r.course_id);
    if (course && r.lesson_id) {
      const f = findLesson(course, r.lesson_id);
      if (f) label = `${course.code} — ${f.lesson.title}`;
    }
    acc.push({ key, date: day, user: nameOf.get(r.user_id) ?? "—", label, seconds: r.seconds });
    return acc;
  }, []).slice(0, 10);

  const csvRows = roster.map((r) => ({
    technician: r.name,
    course: r.courseName,
    progress_pct: r.pct,
    hours_logged: Math.round(r.logged * 100) / 100,
    hours_target: r.target,
    total_hours_all_courses: Math.round(r.totalHours * 100) / 100,
    days_since_active: r.daysSince ?? "",
  }));

  return (
    <div className="dash-body">
      <Header />
      <div className="dash-layout">
        <aside className="dash-side">
          <div className="side-label">Team</div>
          <a href="/dashboard/company" className="active">Overview</a>
          <a href="#roster">Technicians</a>
          <a href="#ledger">Training Records</a>
          <div className="side-label">Personal</div>
          <a href="/dashboard">My Dashboard</a>
        </aside>

        <main className="dash-main">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1>{org.name}</h1>
              <p className="dash-sub">
                {roster.length} of {org.seat_limit} seats in use · scoped to your company by
                row-level security.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <form action={openBillingPortal.bind(null, "/dashboard/company")}>
                <button className="btn btn-ghost btn-sm" type="submit">Billing &amp; Receipts</button>
              </form>
              <form action="/auth/signout" method="post">
                <button className="btn btn-ghost btn-sm" type="submit">Sign Out</button>
              </form>
            </div>
          </div>

          {seatsJustPurchased && (
            <div className="panel">
              <div className="panel-body">
                Seats added — your roster limit is now {org.seat_limit}. Receipt is in your email.
              </div>
            </div>
          )}
          {!seatsJustPurchased && billing && BILLING_NOTICE[billing] && (
            <div className="panel">
              <div className="panel-body">{BILLING_NOTICE[billing]}</div>
            </div>
          )}

          <div className="kpis">
            <div className="kpi">
              <div className="lbl">Seats used</div>
              <div className="num">{roster.length} / {org.seat_limit}</div>
              <div className="delta">{Math.max(org.seat_limit - roster.length, 0)} available</div>
            </div>
            <div className="kpi">
              <div className="lbl">Active technicians</div>
              <div className="num">{roster.filter((r) => r.daysSince != null && r.daysSince <= 14).length}</div>
              <div className="delta">in the last 14 days</div>
            </div>
            <div className="kpi">
              <div className="lbl">Avg course progress</div>
              <div className="num">{avgProgress}%</div>
            </div>
            <div className="kpi">
              <div className="lbl">Team hours logged</div>
              <div className="num">{fmtHours(Math.round(roster.reduce((s, r) => s + r.totalHours, 0) * 10) / 10)}</div>
            </div>
          </div>

          <div className="panel" id="roster">
            <div className="panel-head">
              <h3>Technician Roster</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ExportCsvButton rows={csvRows} filename={`${org.name.replace(/\W+/g, "-")}-training-records.csv`} />
              </div>
            </div>
            <div className="panel-body flush">
              <table className="data">
                <thead>
                  <tr><th>Technician</th><th>Course</th><th>Progress</th><th>Hours</th><th>Last active</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {roster.map((r) => (
                    <tr key={r.userId}>
                      <td><strong>{r.name}</strong>{r.role === "admin" ? " · admin" : ""}</td>
                      <td>{r.courseName}</td>
                      <td>
                        <div className={`bar${r.pct === 100 ? " good" : r.pct < 25 ? " warn" : ""}`}>
                          <i style={{ width: `${r.pct}%` }} />
                        </div>
                      </td>
                      <td>{fmtHours(r.logged)} / {fmtHours(r.target)}</td>
                      <td>
                        {r.daysSince == null ? "—" : r.daysSince === 0 ? "Today" : r.daysSince === 1 ? "Yesterday" : `${r.daysSince}d ago`}
                      </td>
                      <td>
                        {r.pct === 100 ? (
                          <span className="badge ok">Complete</span>
                        ) : r.daysSince != null && r.daysSince > 14 ? (
                          <span className="badge warn">Stalled {r.daysSince}d</span>
                        ) : (
                          <span className="badge info">On track</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid cols-2">
            <div className="panel" id="ledger">
              <div className="panel-head"><h3>Training-Hour Ledger (recent)</h3></div>
              <div className="panel-body flush">
                {ledgerRows.length === 0 ? (
                  <div className="panel-empty">No training time logged yet.</div>
                ) : (
                  <table className="data">
                    <thead><tr><th>Date</th><th>Technician</th><th>Lesson</th><th>Time</th></tr></thead>
                    <tbody>
                      {ledgerRows.map((r) => (
                        <tr key={r.key}>
                          <td>{r.date}</td>
                          <td>{r.user}</td>
                          <td>{r.label}</td>
                          <td>{(r.seconds / 60).toFixed(1)} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div>
              <div className="panel">
                <div className="panel-head"><h3>Seats</h3></div>
                <div className="panel-body">
                  <p style={{ color: "var(--text-soft)", marginBottom: 12 }}>
                    Each seat is one roster slot — seated technicians get the full course
                    catalog. {fmtUsd(SEAT_ITEM.amount)} per seat, one-time.
                  </p>
                  {isStripeConfigured() ? (
                    <form action={startSeatCheckout} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <input type="hidden" name="org_id" value={org.id} />
                      <input
                        type="number"
                        name="seats"
                        min={1}
                        max={500}
                        defaultValue={5}
                        required
                        style={{ width: 90 }}
                        aria-label="Number of seats"
                      />
                      <button className="btn btn-primary btn-sm" type="submit">Buy Seats</button>
                    </form>
                  ) : (
                    <p style={{ marginBottom: 0 }}>
                      Seat purchasing opens soon — <Link href="/contact">contact us</Link> to
                      add seats in the meantime.
                    </p>
                  )}
                  {(seatEvents ?? []).length > 0 && (
                    <table className="data" style={{ marginTop: 14 }}>
                      <thead><tr><th>Change</th><th>Reason</th><th>Date</th></tr></thead>
                      <tbody>
                        {(seatEvents ?? []).map((e, i) => (
                          <tr key={i}>
                            <td>{e.delta > 0 ? `+${e.delta}` : e.delta} seats</td>
                            <td>{e.reason}</td>
                            <td>{new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Add Technician</h3></div>
                <div className="panel-body">
                  <AddTechnician orgId={org.id} />
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Recent Certificates</h3></div>
                <div className="panel-body flush">
                  {!certRows?.length ? (
                    <div className="panel-empty">Certificates appear here when technicians complete level requirements.</div>
                  ) : (
                    <table className="data">
                      <thead><tr><th>Technician</th><th>Certificate</th><th>Issued</th></tr></thead>
                      <tbody>
                        {certRows.map((c, i) => (
                          <tr key={i}>
                            <td>{nameOf.get(c.user_id) ?? "—"}</td>
                            <td>{c.title}</td>
                            <td>{new Date(c.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Assign Training</h3></div>
            <div className="panel-body">
              <p style={{ color: "var(--text-soft)", marginBottom: 12 }}>
                Technicians enroll from the course catalog —{" "}
                {isFreeBeta()
                  ? "every course is free during beta."
                  : "every course is included with their seat."}{" "}
                Methods available:
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COURSES.map((c) => (
                  <span key={c.id} className="chip">{c.code} — {c.name}</span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
