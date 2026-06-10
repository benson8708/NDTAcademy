import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";
import { COURSES, COURSE_EXAM_METHOD, courseLessonStats, fmtHours, slugForCourse } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "NDT Courses — UT, RT, MT, PT, ET, VT Training for Levels I–III",
  description:
    "Online NDT method courses built to ANSI/ASNT CP-105 with hours mapped to SNT-TC-1A 2024 and NAS410: Ultrasonic, Radiographic, Magnetic Particle, Liquid Penetrant, Eddy Current, Visual Testing, NDT Basic, and Radiation Safety.",
  alternates: { canonical: "/courses" },
};

const BLURBS: Record<string, string> = {
  ut: "Sound wave physics, transducers, calibration, straight beam and angle beam techniques, thickness measurement, weld inspection, and evaluation to code. Level III prep covers procedure writing and method administration.",
  rt: "Radiation sources, exposure technique, film and digital systems, image quality indicators, and interpretation of weldments and castings. Includes radiation safety integration and IRRSP preparation guidance.",
  mt: "Magnetization theory, yokes and wet horizontal benches, continuous and residual methods, field indicators, and evaluation per E1444 and industry specifications.",
  pt: "Type I fluorescent and Type II visible penetrant systems, dwell and processing controls, developers, and evaluation of indications across aerospace and industrial work.",
  et: "Electromagnetic induction, impedance plane analysis, probe selection, surface and bolt-hole inspection, conductivity testing, and eddy current array techniques.",
  vt: "Direct and remote visual inspection, lighting and measurement requirements, borescope operation and technique, and acceptance criteria for welds and components.",
  basic: "Materials and processes, discontinuity origins, and a survey of all major NDT methods. The starting point for new technicians and the Level III Basic exam.",
  rad: "Radiation fundamentals, dose limits, survey instruments, regulations, and emergency procedures for industrial radiographers and card holders.",
};

export default function CoursesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">Course Catalog</span>
            <h1>NDT Method Courses</h1>
            <p className="lede">
              Structured to the ANSI/ASNT CP-105-2024 topical outlines and the formal training
              hours of SNT-TC-1A 2024 and NAS410, from introductory Level I through Level III
              preparation. Every method course pairs with its practice exam bank.
            </p>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="grid cols-2">
              {COURSES.map((c) => {
                const slug = slugForCourse(c.id);
                const stats = courseLessonStats(c);
                const levels = c.levels.map((l) => l.level);
                return (
                  <div key={c.id} className="card feature" id={c.id}>
                    <span className="code">{c.code} · {c.name}</span>
                    <h3>
                      <Link href={`/courses/${slug}`} style={{ color: "inherit" }}>
                        {c.name}{" "}
                        {levels.length > 1 && ["I", "II", "III"].includes(levels[0])
                          ? `${levels[0]}–${levels[levels.length - 1]}`
                          : ""}
                      </Link>
                    </h3>
                    <p>{BLURBS[c.id]}</p>
                    <p style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: ".74rem", letterSpacing: ".06em", color: "var(--text-soft)" }}>
                      {stats.lessons} LESSONS · {fmtHours(stats.hours)} DESIGNED HOURS
                    </p>
                    <div className="levels">
                      {levels.map((l) => (
                        <span key={l} className="chip">
                          {["I", "II", "III"].includes(l) ? `Level ${l}` : l}
                        </span>
                      ))}
                    </div>
                    <p style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link className="btn btn-primary btn-sm" href={`/courses/${slug}`}>View Curriculum</Link>
                      {COURSE_EXAM_METHOD[c.id] && (
                        <Link className="btn btn-ghost btn-sm" href={`/practice-exams/${slug}`}>Practice Exam</Link>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="block dark on-dark tight">
          <div className="wrap">
            <div className="section-head split" style={{ marginBottom: 0 }}>
              <div>
                <span className="kicker">Full Program</span>
                <h2>20-Week NDT Training Program</h2>
                <p className="lede" style={{ marginTop: 12 }}>
                  A complete multi-method pathway taking a new hire from zero to certifiable
                  Level II across the methods your operation needs. Designed for companies
                  building their own technician pipeline.
                </p>
              </div>
              <Link className="btn btn-primary" href="/contact">Inquire About the Program</Link>
            </div>
          </div>
        </section>

        <section className="cta-band on-dark">
          <div className="wrap">
            <div>
              <h2>Not sure where to start?</h2>
              <p>Tell us about your certification goals or your team&apos;s needs and we&apos;ll map a path.</p>
            </div>
            <Link className="btn btn-primary" href="/contact">Contact Us</Link>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "Courses", url: `${SITE_URL}/courses` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "NDT Training Courses",
            itemListElement: COURSES.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/courses/${slugForCourse(c.id)}`,
              name: `${c.name} Training`,
            })),
          },
        ]}
      />
    </>
  );
}
