import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";
import report from "@/data/compliance.json";

export const metadata: Metadata = {
  title: "CP-105 Compliance Report — Verified Outline Coverage & Training Hours",
  description:
    "Machine-verified evidence that every NDT Academy course covers its ANSI/ASNT CP-105-2024 topical outline at 100% and meets governing SNT-TC-1A 2024 / NAS410 formal training hours.",
  alternates: { canonical: "/compliance" },
};

interface LevelHours {
  level: string; designedHours: number; snt: number | null; nas: number | null;
  governing: number | null; meets: boolean; marginMinutes?: number;
}
interface CourseReport {
  id: string; code: string; name: string;
  outlineItems: number; matched: number; unmatchedCount: number; coveragePct: number;
  hours?: LevelHours[];
}
interface Report {
  generated: string;
  methodology: { coverage: string; hours: string };
  courses: CourseReport[];
}

const R = report as unknown as Report;

export default function CompliancePage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">Standards Traceability</span>
            <h1>Compliance Report</h1>
            <p className="lede">
              Machine-verified evidence that every course covers its ANSI/ASNT CP-105-2024
              topical outline and meets the governing formal training hours from SNT-TC-1A 2024
              and NAS410.
            </p>
          </div>
        </section>

        <section className="block tight">
          <div className="wrap">
            <div className="proto-note">
              COMPLIANCE SNAPSHOT — generated {R.generated} by tools/verify_compliance.py from the
              OCR&apos;d CP-105-2024 outlines and the course curriculum data. Regenerated after every
              curriculum change.
            </div>

            <div className="panel">
              <div className="panel-head"><h3>CP-105-2024 Outline Coverage</h3></div>
              <div className="panel-body flush">
                <table className="data">
                  <thead>
                    <tr><th>Course</th><th>Outline items</th><th>Matched</th><th>Coverage</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {R.courses.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.code}</strong> — {c.name}</td>
                        <td>{c.outlineItems}</td>
                        <td>{c.matched}</td>
                        <td>
                          <div className="bar good" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 10 }}>
                            <i style={{ width: `${c.coveragePct}%` }} />
                          </div>
                          {c.coveragePct.toFixed(1)}%
                        </td>
                        <td>
                          {c.unmatchedCount === 0
                            ? <span className="badge ok">Complete</span>
                            : <span className="badge warn">{c.unmatchedCount} for L3 review</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head"><h3>Formal Training Hours vs Governing Requirement</h3></div>
              <div className="panel-body flush">
                <table className="data">
                  <thead>
                    <tr><th>Course / Level</th><th>Designed</th><th>SNT-TC-1A 2024</th><th>NAS410</th><th>Governing</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {R.courses.flatMap((c) =>
                      (c.hours ?? []).map((lh) => (
                        <tr key={`${c.id}-${lh.level}`}>
                          <td><strong>{c.code}</strong> {["I","II","III"].includes(lh.level) ? `Level ${lh.level}` : lh.level}</td>
                          <td>{lh.designedHours} h</td>
                          <td>{lh.snt ?? "—"}{lh.snt != null ? " h" : ""}</td>
                          <td>{lh.nas ?? "—"}{lh.nas != null ? " h" : ""}</td>
                          <td>{lh.governing ?? "—"}{lh.governing != null ? " h" : ""}</td>
                          <td>{lh.meets ? <span className="badge ok">Meets</span> : <span className="badge bad">Short</span>}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head"><h3>Methodology &amp; Limits</h3></div>
              <div className="panel-body">
                <p style={{ marginBottom: 10 }}><strong>Coverage (CP-105):</strong> {R.methodology.coverage}</p>
                <p style={{ marginBottom: 10 }}><strong>Hours (SNT-TC-1A / NAS410):</strong> {R.methodology.hours}</p>
                <p style={{ marginBottom: 10 }}>
                  <strong>Design vs. delivery:</strong> This report verifies <em>course design</em>.
                  Delivered training hours are enforced at run time by active-engagement time
                  tracking (idle/hidden-tab pauses) and certificate gating: a certificate is only
                  issued when logged time, lesson completion, knowledge checks, and the final exam
                  all meet requirements.
                </p>
                <p>
                  <strong>Authority:</strong> Automated traceability supports — but does not replace —
                  review and approval of each course by a qualified Level III, and verification of
                  NAS410 figures against the purchased Rev 6 standard text. SNT-TC-1A figures were
                  extracted from the licensed SNT-TC-1A 2024 document (Table 6.3.1A).
                </p>
              </div>
            </div>

            <p>
              See also: <Link href="/ndt-training-hours">NDT training hour requirements by method</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Compliance", url: `${SITE_URL}/compliance` },
        ])}
      />
    </>
  );
}
