import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ExamRunner from "@/components/ExamRunner";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";

const EXAM_PAGES: Record<string, {
  bank: string; code: string; name: string; total: number;
  perLevel: [number, number, number]; blurb: string; courseSlug: string;
}> = {
  "ultrasonic-testing": {
    bank: "UT", code: "UT", name: "Ultrasonic Testing", total: 1007, perLevel: [301, 353, 353],
    courseSlug: "ultrasonic-testing",
    blurb: "Wave propagation, transducers, calibration blocks, angle beam geometry, DAC curves, and code evaluation — the topics UT qualification exams actually test.",
  },
  "radiographic-testing": {
    bank: "RT", code: "RT", name: "Radiographic Testing", total: 1001, perLevel: [333, 334, 334],
    courseSlug: "radiographic-testing",
    blurb: "Source characteristics, exposure calculations, film and digital technique, IQIs, and image interpretation for weldments and castings.",
  },
  "magnetic-particle-testing": {
    bank: "MPI", code: "MT", name: "Magnetic Particle Testing", total: 1001, perLevel: [332, 335, 334],
    courseSlug: "magnetic-particle-testing",
    blurb: "Magnetization methods, field strength and direction, continuous vs residual technique, indications, and E1444-style process questions.",
  },
  "liquid-penetrant-testing": {
    bank: "LPI", code: "PT", name: "Liquid Penetrant Testing", total: 1001, perLevel: [295, 353, 353],
    courseSlug: "liquid-penetrant-testing",
    blurb: "Penetrant types and sensitivity levels, dwell times, removal methods, developers, and evaluation of indications.",
  },
  "eddy-current-testing": {
    bank: "ECT", code: "ET", name: "Eddy Current Testing", total: 1001, perLevel: [333, 334, 334],
    courseSlug: "eddy-current-testing",
    blurb: "Impedance plane behavior, frequency selection, lift-off and edge effects, conductivity, and bolt-hole and surface scanning technique.",
  },
};

export function generateStaticParams() {
  return Object.keys(EXAM_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = EXAM_PAGES[slug];
  if (!m) return {};
  return {
    title: `Free ${m.code} Practice Exam — ${m.total.toLocaleString()} ${m.name} Questions`,
    description: `Free ${m.name} (${m.code}) practice exam: ${m.total.toLocaleString()} questions for Levels I, II and III with instant scoring, per-question timer, and missed-question review. No account required.`,
    alternates: { canonical: `/practice-exams/${slug}` },
  };
}

export default async function MethodExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = EXAM_PAGES[slug];
  if (!m) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">{m.code} · Practice Exam</span>
            <h1>{m.name} Practice Exam</h1>
            <p className="lede">
              {m.total.toLocaleString()} {m.code} questions — {m.perLevel[0]} Level I,{" "}
              {m.perLevel[1]} Level II, {m.perLevel[2]} Level III. Free, instant scoring,
              and a full review of everything you miss.
            </p>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <ExamRunner initialMethod={m.bank} />
          </div>
        </section>

        <section className="block tight" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="grid cols-2">
              <div className="card feature">
                <span className="code">What&apos;s covered</span>
                <h3>Built like the real thing</h3>
                <p>{m.blurb}</p>
              </div>
              <div className="card feature">
                <span className="code">Train first</span>
                <h3>{m.name} Course</h3>
                <p>
                  Structured {m.code} training to CP-105 with SNT-TC-1A / NAS410 hours, tracked
                  engagement time, and records for your employer.
                </p>
                <p style={{ marginTop: 14 }}>
                  <Link className="btn btn-primary btn-sm" href={`/courses/${m.courseSlug}`}>
                    View the {m.code} Course
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Practice Exams", url: `${SITE_URL}/practice-exams` },
          { name: `${m.name} Practice Exam`, url: `${SITE_URL}/practice-exams/${slug}` },
        ])}
      />
    </>
  );
}
