import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";
import {
  COURSES, COURSE_EXAM_METHOD, COURSE_SLUGS, courseBySlug, courseLessonStats,
  fmtHours, slugForCourse,
} from "@/lib/curriculum";
import { isFreeBeta } from "@/lib/stripe/server";
import { courseCatalogItem, fmtUsd } from "@/lib/stripe/catalog";
import { FREE_COURSE_IDS } from "@/lib/billing/access";

export function generateStaticParams() {
  return Object.values(COURSE_SLUGS).map((slug) => ({ slug }));
}

/** Unique long-form intro copy per course (SEO + genuinely useful). */
const INTRO: Record<string, { who: string; what: string }> = {
  ut: {
    what: "Ultrasonic Testing training takes you from sound wave physics and transducer fundamentals through calibration, straight beam and angle beam techniques, thickness measurement, immersion testing, and weld inspection to code. The Level III curriculum adds procedure writing, technique development, and method administration.",
    who: "UT is one of the most in-demand NDT methods — pipeline, structural steel, aerospace, and power generation all depend on it. It rewards technicians who like instrumentation and interpretation, and UT Level II is a common target for direct-to-Level-II training plans.",
  },
  rt: {
    what: "Radiographic Testing training covers radiation sources, exposure technique, film and digital radiography (CR/DR), image quality indicators, and interpretation of weldments and castings — paired with the radiation safety knowledge every radiographer must hold.",
    who: "RT technicians work under regulatory oversight, so employers expect rigorous, documented training. Pair this course with our Radiation Safety / IRRSP prep course if you are working toward a radiographer card.",
  },
  mt: {
    what: "Magnetic Particle Testing training covers magnetization theory, yokes and wet horizontal benches, continuous and residual methods, field indicators and quality control, and evaluation of indications per E1444 and common industry specifications.",
    who: "MT is a high-volume surface method in aerospace overhaul, automotive, and steel fabrication. With a 16-hour NAS410-aligned formal training requirement per level, it is one of the fastest routes to a working NDT qualification.",
  },
  pt: {
    what: "Liquid Penetrant Testing training covers Type I fluorescent and Type II visible penetrant systems, processing controls, dwell times, developers, and the evaluation of indications across aerospace and industrial hardware.",
    who: "PT is frequently a technician's first method — the equipment is simple but the process discipline matters. The course's process-control depth is built for aerospace work where NAS410 governs.",
  },
  et: {
    what: "Eddy Current Testing training covers electromagnetic induction, impedance plane analysis, probe selection, surface and bolt-hole inspection, conductivity and coating thickness measurement, and an introduction to eddy current array techniques.",
    who: "ET dominates aviation maintenance inspection — fastener holes, wheels, and structure. If you work in or toward an aviation repair station, ET Level II is one of the most valuable qualifications you can hold.",
  },
  vt: {
    what: "Visual Testing training covers direct and remote visual inspection, lighting and measurement requirements, borescope operation and technique, weld discontinuities, and acceptance criteria for welds and components.",
    who: "VT underpins every other method — most inspections begin (and many end) with a documented visual examination. It is the lowest-hour formal training requirement and an ideal first qualification.",
  },
  basic: {
    what: "The NDT Basic course covers materials and manufacturing processes, the origins of discontinuities, and a structured survey of the major NDT methods — the common body of knowledge behind every method qualification.",
    who: "Built both for brand-new technicians who need orientation before picking a method, and for Level III candidates preparing for the ASNT Basic examination.",
  },
  rad: {
    what: "Radiation Safety training covers radiation fundamentals, biological effects, dose limits, ALARA, survey instruments, regulations, source security, and emergency procedures for industrial radiography.",
    who: "Required knowledge for industrial radiographers and IRRSP card candidates. Jurisdiction requirements vary — your regulator's required hours and practical components govern.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return {};
  const stats = courseLessonStats(course);
  const levels = course.levels.map((l) => l.level);
  const levelLabel = ["I", "II", "III"].includes(levels[0]) ? `Levels ${levels.join(", ")}` : levels.join(" · ");
  return {
    title: `${course.name} (${course.code}) Training Online — ${levelLabel}`,
    description: `Online ${course.name} training built to ${course.cp105 ?? "ANSI/ASNT CP-105"}: ${stats.lessons} lessons, ${fmtHours(stats.hours)} formal training hours mapped to SNT-TC-1A 2024 and NAS410, with tracked engagement time and audit-ready records.`,
    alternates: { canonical: `/courses/${slug}` },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();

  const stats = courseLessonStats(course);
  const intro = INTRO[course.id];
  const examMethod = COURSE_EXAM_METHOD[course.id];
  const h = course.hours;
  const beta = isFreeBeta();
  const promoFree = FREE_COURSE_IDS.has(course.id);
  const item = courseCatalogItem(course.id);
  const ctaLabel = promoFree
    ? "Start Free — Limited-Time Offer"
    : beta
      ? "Start This Course — Free During Beta"
      : item
        ? `Get This Course — ${fmtUsd(item.amount)}`
        : "Start This Course";

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
            <h1>{course.name} Training</h1>
            <div className="cp">
              Built to {course.cp105}
              {course.jurisdictionNote ? " · Jurisdiction requirements vary" : ""}
            </div>
            <div className="hours-strip">
              {course.levels.map((l) => (
                <div key={l.level} className="hour-pill">
                  <div className="lbl">Level {l.level} — course length</div>
                  <div className="val">{fmtHours(l.targetHours)}<em>h</em></div>
                </div>
              ))}
              {h.snt_tc_1a?.l1 != null && (
                <div className="hour-pill">
                  <div className="lbl">SNT-TC-1A 2024 (L1/L2)</div>
                  <div className="val">{h.snt_tc_1a.l1}<em>/</em>{h.snt_tc_1a.l2}<em>h</em></div>
                </div>
              )}
              {h.nas410?.l1 != null && (
                <div className="hour-pill">
                  <div className="lbl">NAS410 (L1/L2)</div>
                  <div className="val">{h.nas410.l1}<em>/</em>{h.nas410.l2}<em>h</em></div>
                </div>
              )}
              {h.directToL2 && (
                <div className="hour-pill">
                  <div className="lbl">Direct to Level II</div>
                  <div className="val">{h.directToL2}<em>h</em></div>
                </div>
              )}
            </div>
            <p style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href={`/learn/${slug}`}>
                {ctaLabel}
              </Link>
              {examMethod && (
                <Link className="btn btn-ghost" href={`/practice-exams/${slug}`}>Practice Exam</Link>
              )}
            </p>
          </div>
        </section>

        <section className="block tight">
          <div className="wrap">
            <div className="grid cols-2" style={{ alignItems: "start", marginBottom: 44 }}>
              <div className="prose">
                <span className="kicker">About this course</span>
                <p style={{ marginTop: 6 }}>{intro?.what}</p>
                <p>{intro?.who}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--text-soft)", letterSpacing: ".04em" }}>
                  {stats.lessons} LESSONS · {stats.modules} MODULES · {fmtHours(stats.hours)} DESIGNED TRAINING HOURS
                </p>
              </div>
              <div className="grid" style={{ alignContent: "start" }}>
                {course.id === "vt" && (
                  <div className="card feature" style={{ borderTopColor: "var(--green)" }}>
                    <span className="code" style={{ color: "var(--green)" }}>Fully produced</span>
                    <h3>Complete, ready-to-take course</h3>
                    <p>
                      Every VT lesson ships finished: a narrated teaching video, professional
                      voiceover audio, written instruction with photorealistic imagery and
                      technical diagrams, hands-on exercises — including a borescope scanning
                      simulator and a lighting trainer — a knowledge check per lesson, module
                      quizzes, and a 50-question final exam per level. Pass the final with every
                      lesson complete and your formal-training certificate is issued automatically.
                    </p>
                  </div>
                )}
                <div className="card feature">
                  <span className="code">Hours that count</span>
                  <h3>Active-engagement tracking</h3>
                  <p>
                    Your formal training hours accrue only while you&apos;re actively working in a
                    lesson — idle time and hidden tabs pause the clock. The hour ledger is
                    exportable for your employer&apos;s written practice.
                  </p>
                </div>
                <div className="card feature">
                  <span className="code">Traceability</span>
                  <h3>100% outline coverage</h3>
                  <p>
                    Every numbered CP-105-2024 topic for {course.code} is machine-traced to a
                    lesson. <Link href="/compliance">View the compliance report</Link>.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-head" style={{ marginBottom: 28 }}>
              <span className="kicker">Curriculum</span>
              <h2>What you&apos;ll learn</h2>
            </div>

            {course.levels.map((level) => (
              <div key={level.level} style={{ marginBottom: 44 }}>
                <h3 style={{ fontSize: "1.6rem", marginBottom: 8 }}>
                  {["I", "II", "III"].includes(level.level) ? `Level ${level.level}` : level.level}
                  <span style={{ color: "var(--blue)", marginLeft: 12, fontSize: "1.1rem" }}>
                    {fmtHours(level.targetHours)} hours
                  </span>
                </h3>
                {level.description && (
                  <p style={{ color: "var(--text-soft)", maxWidth: "72ch", marginBottom: 18 }}>{level.description}</p>
                )}
                {level.modules.map((m, mi) => (
                  <details key={m.id} className="module" open={mi === 0}>
                    <summary className="module-head" style={{ display: "flex", listStyle: "none" }}>
                      <span className="m-num">{String(mi + 1).padStart(2, "0")}</span>
                      <h3 style={{ flex: 1, fontSize: "1.12rem" }}>{m.title}</h3>
                      <span className="m-meta">{m.lessons.length} lessons · {fmtHours(m.hours)} h</span>
                    </summary>
                    <div style={{ borderTop: "1px solid var(--line)" }}>
                      {m.cpSection && <div className="cp-ref" style={{ fontFamily: "var(--mono)", fontSize: ".7rem", letterSpacing: ".08em", color: "var(--text-soft)", padding: "12px 22px 0" }}>{m.cpSection}</div>}
                      {m.lessons.map((l) => (
                        <div key={l.id} className="lesson-row" style={{ cursor: "default" }}>
                          <span className="dot"></span>
                          <span className="l-title">{l.title}</span>
                          <span className="l-meta">
                            {[...new Set(l.media.map((x) => x.type))].map((t) => (
                              <span key={t} className={`mtag ${t}`}>{t}</span>
                            ))}
                          </span>
                          <span className="min">{l.minutes} min</span>
                        </div>
                      ))}
                      {m.moduleQuiz && (
                        <div className="quiz-row">
                          MODULE QUIZ — {m.moduleQuiz.questions} questions · {m.moduleQuiz.passingScore}% to pass
                        </div>
                      )}
                    </div>
                  </details>
                ))}
                {level.finalExam && (
                  <div className="module open" style={{ marginTop: 0 }}>
                    <div className="quiz-row" style={{ borderTop: 0 }}>
                      FINAL EXAM — {level.finalExam.questions} questions · {level.finalExam.passingScore}% to pass
                      {level.finalExam.bank ? ` · drawn from the ${level.finalExam.bank} Level ${level.finalExam.bankLevel} bank` : ""}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {course.futureTechniques && course.futureTechniques.length > 0 && (
              <div className="card" style={{ marginTop: 8 }}>
                <span className="code">Roadmap</span>
                <h3>Advanced techniques in development</h3>
                <p>{course.futureTechniques.join(" · ")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="cta-band on-dark">
          <div className="wrap">
            <div>
              <h2>Ready to log real training hours?</h2>
              <p>
                {promoFree
                  ? "Completely free for a limited time — create an account and the full course, hour tracking, and certificate are yours."
                  : beta
                    ? "Enroll free during beta — progress, hours, and exam attempts all tracked to your account."
                    : `One-time purchase${item ? ` (${fmtUsd(item.amount)})` : ""}, lifetime access — progress, hours, and exam attempts all tracked to your account.`}
              </p>
            </div>
            <Link className="btn btn-primary" href={`/learn/${slug}`}>Start {course.code} Training</Link>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "Courses", url: `${SITE_URL}/courses` },
            { name: `${course.name} Training`, url: `${SITE_URL}/courses/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Course",
            name: `${course.name} (${course.code}) Training`,
            description: INTRO[course.id]?.what,
            provider: { "@id": `${SITE_URL}/#organization` },
            url: `${SITE_URL}/courses/${slug}`,
            courseCode: course.code,
            educationalCredentialAwarded: "Certificate of Completion — formal training hours",
            teaches: course.levels.flatMap((l) => l.modules.map((m) => m.title)).slice(0, 12),
            offers: beta
              ? {
                  "@type": "Offer",
                  category: "Free (beta)",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                }
              : {
                  "@type": "Offer",
                  category: "Paid",
                  price: item ? (item.amount / 100).toFixed(2) : undefined,
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
            hasCourseInstance: course.levels.map((l) => ({
              "@type": "CourseInstance",
              name: `${course.name} ${["I", "II", "III"].includes(l.level) ? `Level ${l.level}` : l.level}`,
              courseMode: "Online",
              courseWorkload: `PT${Math.round(l.targetHours)}H`,
            })),
          },
        ]}
      />
    </>
  );
}
