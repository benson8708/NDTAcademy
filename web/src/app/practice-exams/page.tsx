import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ExamRunner from "@/components/ExamRunner";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free NDT Practice Exams — 5,011 Questions, Levels I–III",
  description:
    "Free NDT practice exams with instant scoring: 5,011 questions in Ultrasonic (UT), Radiographic (RT), Magnetic Particle (MT), Liquid Penetrant (PT), and Eddy Current (ET) testing for Levels I, II and III.",
  alternates: { canonical: "/practice-exams" },
};

const METHOD_LINKS = [
  { slug: "ultrasonic-testing", code: "UT", name: "Ultrasonic Testing", count: 1007 },
  { slug: "radiographic-testing", code: "RT", name: "Radiographic Testing", count: 1001 },
  { slug: "magnetic-particle-testing", code: "MT", name: "Magnetic Particle Testing", count: 1001 },
  { slug: "liquid-penetrant-testing", code: "PT", name: "Liquid Penetrant Testing", count: 1001 },
  { slug: "eddy-current-testing", code: "ET", name: "Eddy Current Testing", count: 1001 },
];

export default function PracticeExamsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">Practice Exam Engine</span>
            <h1>Free NDT Practice Exams</h1>
            <p className="lede">
              5,011 questions across five methods and three levels — drawn fresh from the
              database every attempt. Pick your setup, beat the clock, review every answer.
            </p>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <ExamRunner />
          </div>
        </section>

        <section className="block tight" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <span className="kicker">By Method</span>
              <h2>Method-specific exam prep</h2>
            </div>
            <div className="grid cols-3">
              {METHOD_LINKS.map((m) => (
                <Link key={m.slug} className="card reveal" href={`/practice-exams/${m.slug}`}>
                  <span className="code">{m.code}</span>
                  <h3>{m.name} Practice Exam</h3>
                  <p>{m.count.toLocaleString()} questions · Levels I, II &amp; III · instant scoring and missed-question review.</p>
                </Link>
              ))}
              <Link className="card reveal" href="/courses">
                <span className="code">Courses</span>
                <h3>Need the training first?</h3>
                <p>Every practice bank pairs with a full method course built to CP-105 and the SNT-TC-1A / NAS410 hour requirements.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Practice Exams", url: `${SITE_URL}/practice-exams` },
        ])}
      />
    </>
  );
}
