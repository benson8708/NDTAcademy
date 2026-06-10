import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — NDT Training Built by Working NDT Professionals",
  description:
    "NDT Academy grew out of real aviation and industrial inspection work — method courses, practice exams, and training records built the way qualification programs actually run.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">About</span>
            <h1>Built by working NDT professionals</h1>
            <p className="lede">
              NDT Academy grew out of real inspection work — aviation and industrial — and the
              training programs built to qualify the technicians doing it.
            </p>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="grid cols-2">
              <div>
                <span className="kicker">Our Approach</span>
                <h2 style={{ marginBottom: 18 }}>Train the way the work actually happens</h2>
                <p style={{ marginBottom: 16 }}>
                  Most NDT training is either too academic or too thin. Ours is built from the
                  procedures, specifications, and exam requirements technicians face on the job:
                  SNT-TC-1A qualification structure, real written practices, and the codes that
                  govern aviation and industrial inspection.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Every course pairs theory with the documents you&apos;ll actually use, and every
                  method has a deep practice exam bank — over 5,000 questions — so you walk into
                  your qualification exam having already passed it many times.
                </p>
                <p style={{ marginBottom: 16 }}>
                  And because training only matters if it can be proven, the platform logs
                  active-engagement training time, traces every lesson to the CP-105 topical
                  outlines, and produces records your Level III and your auditor can verify.
                </p>
                {/* TODO: founder bio, photo, years of experience, ASNT Level III methods, IRRSP */}
              </div>
              <div className="grid" style={{ alignContent: "start" }}>
                <div className="card feature reveal">
                  <span className="code">Credentials</span>
                  <h3>SNT-TC-1A &amp; NAS410 Aligned</h3>
                  <p>Courses follow ASNT SNT-TC-1A 2024 recommended training and NAS410 requirements for Levels I, II, and III.</p>
                </div>
                <div className="card feature reveal">
                  <span className="code">Experience</span>
                  <h3>Aviation &amp; Industrial</h3>
                  <p>Built from real repair station and industrial inspection programs, written practices, and procedures.</p>
                </div>
                <div className="card feature reveal">
                  <span className="code">Depth</span>
                  <h3>5,011-Question Bank</h3>
                  <p>Method- and level-specific exam preparation across UT, RT, MT, PT, and ET.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-band on-dark">
          <div className="wrap">
            <div>
              <h2>Questions about our training?</h2>
              <p>We&apos;re happy to talk through certification paths and company programs.</p>
            </div>
            <Link className="btn btn-primary" href="/contact">Get in Touch</Link>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "About", url: `${SITE_URL}/about` },
        ])}
      />
    </>
  );
}
