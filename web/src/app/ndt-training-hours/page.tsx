import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd, faqJsonLd } from "@/lib/site";
import { COURSES, fmtHours, slugForCourse } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "NDT Training Hour Requirements — SNT-TC-1A 2024 & NAS410 by Method",
  description:
    "How many formal training hours do you need for NDT Level I and Level II? Full SNT-TC-1A 2024 and NAS410 hour requirements for UT, RT, MT, PT, ET and VT, including direct-to-Level-II totals and how online hours are documented.",
  alternates: { canonical: "/ndt-training-hours" },
};

const FAQS = [
  {
    q: "Who sets NDT training hour requirements?",
    a: "Your employer's written practice sets the binding numbers, guided by SNT-TC-1A (ASNT's recommended practice) for general industry and mandated by NAS410 for aerospace. NDT Academy courses are designed to the stricter of SNT-TC-1A 2024 Table 6.3.1A and NAS410 Table 1 for each method and level.",
  },
  {
    q: "What counts as a formal training hour?",
    a: "Organized, documented instruction in the method — classroom, virtual, or structured self-paced study with records. On NDT Academy, hours accrue only during active engagement: idle time and hidden browser tabs pause the clock, and the resulting ledger lists date, lesson, and minutes for every entry.",
  },
  {
    q: "What is direct-to-Level-II training?",
    a: "When a trainee qualifies straight to Level II without holding Level I, SNT-TC-1A Table 6.3.1A Note 1 requires the combined Level I + Level II training hours. Our course totals record those combined figures per method.",
  },
];

export default function TrainingHoursPage() {
  const methods = COURSES.filter((c) => c.hours.snt_tc_1a || c.hours.nas410);
  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">Reference Guide</span>
            <h1>NDT Training Hour Requirements</h1>
            <p className="lede">
              SNT-TC-1A 2024 and NAS410 formal training hours by method and level — and how a
              compliant online program documents them.
            </p>
          </div>
        </section>

        <section className="block tight">
          <div className="wrap">
            <div className="prose" style={{ marginBottom: 36 }}>
              <p>
                Before any technician can be certified in a nondestructive testing method, the
                governing program requires documented <strong>formal training hours</strong> in
                that method. For most of industry the reference is{" "}
                <strong>ASNT SNT-TC-1A</strong> (a recommended practice your employer adapts
                into its written practice); for aerospace it is <strong>NAS410</strong>, whose
                requirements are mandatory. The two documents don&apos;t always agree — so NDT
                Academy designs every course to meet the <em>stricter</em> of the two.
              </p>
            </div>

            <div className="hours-table-wrap reveal">
              <table className="hours">
                <thead>
                  <tr>
                    <th scope="col">Method</th>
                    <th scope="col">SNT-TC-1A 2024 — Level I</th>
                    <th scope="col">SNT-TC-1A 2024 — Level II</th>
                    <th scope="col">NAS410 — Level I</th>
                    <th scope="col">NAS410 — Level II</th>
                    <th scope="col">Direct to Level II</th>
                    <th scope="col">NDT Academy course</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((c) => {
                    const s = c.hours.snt_tc_1a;
                    const n = c.hours.nas410;
                    const courseTotal = c.levels
                      .filter((l) => ["I", "II"].includes(l.level))
                      .reduce((sum, l) => sum + l.targetHours, 0);
                    return (
                      <tr key={c.id}>
                        <td>
                          <Link href={`/courses/${slugForCourse(c.id)}`}>
                            <strong>{c.code}</strong> — {c.name}
                          </Link>
                        </td>
                        <td className="num">{s?.l1 ?? "—"} h</td>
                        <td className="num">{s?.l2 ?? "—"} h</td>
                        <td className="num">{n?.l1 ?? "—"}{n?.l1 != null ? " h" : ""}</td>
                        <td className="num">{n?.l2 ?? "—"}{n?.l2 != null ? " h" : ""}</td>
                        <td className="num">{c.hours.directToL2 ? `${c.hours.directToL2} h` : "—"}</td>
                        <td className="num"><strong>{fmtHours(courseTotal)} h</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--text-soft)", margin: "12px 2px 0", letterSpacing: ".04em" }}>
              SOURCES: SNT-TC-1A 2024 TABLE 6.3.1A · NAS410 TABLE 1 (VERIFY AGAINST PURCHASED REV 6 TEXT) ·
              &quot;—&quot; = NOT SPECIFIED BY THAT DOCUMENT. EMPLOYER WRITTEN PRACTICE GOVERNS.
            </p>

            <div className="prose" style={{ marginTop: 44 }}>
              <h2>How online training hours get documented</h2>
              <p>
                An auditor reviewing your qualification file wants three things: <strong>what</strong>{" "}
                was taught (a syllabus traceable to CP-105 topical outlines), <strong>how long</strong>{" "}
                you trained (an hour ledger), and <strong>evidence of comprehension</strong> (quiz and
                exam results). NDT Academy produces all three automatically:
              </p>
              <ul>
                <li>Every lesson maps to numbered CP-105-2024 outline topics — <Link href="/compliance">verified at 100% coverage</Link>.</li>
                <li>Training time is logged from active engagement only; idle and hidden-tab time never counts.</li>
                <li>Knowledge checks, module quizzes, and level final exams record scores and dates.</li>
              </ul>
              <h2>Method-by-method notes</h2>
              <ul>
                <li><strong>UT, RT, ET</strong> — 40 hours per level under both documents; the longest formal training requirements in common use. <Link href="/courses/ultrasonic-testing">UT course</Link>, <Link href="/courses/radiographic-testing">RT course</Link>, <Link href="/courses/eddy-current-testing">ET course</Link>.</li>
                <li><strong>MT, PT</strong> — NAS410 requires 16 hours per level, exceeding the SNT-TC-1A recommendation; our <Link href="/courses/magnetic-particle-testing">MT</Link> and <Link href="/courses/liquid-penetrant-testing">PT</Link> courses are built to the 16-hour figure.</li>
                <li><strong>VT</strong> — SNT-TC-1A recommends 8/16 hours (L1/L2); NAS410 is silent on VT. <Link href="/courses/visual-testing">VT course</Link>.</li>
                <li><strong>Radiation Safety</strong> — hours are set by your jurisdiction and license conditions, separate from RT method training. <Link href="/courses/radiation-safety">Radiation Safety course</Link>.</li>
              </ul>
              <h2>FAQ</h2>
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band on-dark">
          <div className="wrap">
            <div>
              <h2>Train to the stricter standard</h2>
              <p>Every course meets SNT-TC-1A 2024 and NAS410 hour requirements with margin.</p>
            </div>
            <Link className="btn btn-primary" href="/courses">Browse NDT Courses</Link>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "NDT Training Hours", url: `${SITE_URL}/ndt-training-hours` },
          ]),
          faqJsonLd(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "NDT Training Hour Requirements — SNT-TC-1A 2024 & NAS410 by Method",
            author: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntityOfPage: `${SITE_URL}/ndt-training-hours`,
          },
        ]}
      />
    </>
  );
}
