import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ScrollFX from "@/components/landing/ScrollFX";
import WaveProgress from "@/components/landing/WaveProgress";
import HeroWave from "@/components/landing/HeroWave";
import { SITE_URL, faqJsonLd } from "@/lib/site";
import { COURSES, slugForCourse } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "NDT Training Online — SNT-TC-1A & NAS410 Courses | NDT Academy",
  description:
    "NDTAcademy.com — online NDT training founded by two multi-certified ASNT Level IIIs. Every student is assigned a Level III who verifies compliance and competence. UT, RT, MT, PT, ET, VT for Levels I–III. VT Level I & II free for a limited time.",
  alternates: { canonical: "/" },
};

const FAQS = [
  {
    q: "Is VT Level I and II training really free?",
    a: "Yes — for a limited time, Visual Testing Level I and Level II are completely free when you create an account on NDTAcademy.com. That's the full produced course: narrated video lessons, photorealistic and diagram-based instruction, interactive trainers, knowledge checks, module quizzes, the 50-question level finals, tracked formal training hours, and your certificate when you meet every requirement.",
  },
  {
    q: "Who is behind NDT Academy?",
    a: "NDTAcademy.com was founded and created by two multi-certified ASNT Level IIIs with working aviation and industrial inspection backgrounds. The courses come from the procedures, written practices, and qualification programs they run — not from a content farm.",
  },
  {
    q: "What does my assigned Level III actually do?",
    a: "Every student on NDTAcademy.com is assigned an ASNT Level III who oversees their training: reviewing progress and logged hours, verifying that the training record complies with the governing documents (SNT-TC-1A 2024 / NAS410), and confirming competence before a certificate carries their oversight. It's the same authority structure an employer's written practice expects.",
  },
  {
    q: "What is NDT training?",
    a: "NDT training is the formal instruction portion of qualifying as a nondestructive testing technician. Under ASNT SNT-TC-1A and NAS410, qualification combines documented formal training hours, on-the-job experience, and examinations. NDT Academy delivers the formal training: structured method courses covering the ANSI/ASNT CP-105 topical outlines, with every training hour logged for your employer's records.",
  },
  {
    q: "How many training hours do I need for NDT Level I or Level II?",
    a: "It depends on the method and the governing document. For example, SNT-TC-1A 2024 recommends 40 hours for Ultrasonic Testing paths, while NAS410 requires 40 hours for UT, RT and ET, and 16 hours for MT and PT. Visual Testing is 8 hours for Level I and 16 for Level II — and our certificates only issue once those hours are genuinely logged as active engagement.",
  },
  {
    q: "Is online NDT training accepted for certification?",
    a: "Yes — formal training delivered online is widely accepted as the training element of qualification, because SNT-TC-1A leaves the training program to the employer's written practice and NAS410 recognizes structured self-study and computer-based training. What matters is documentation: NDT Academy logs active engagement time, lesson completion, quiz results, and final exams, and issues records your employer or auditor can verify.",
  },
  {
    q: "Do you offer NDT training for companies and teams?",
    a: "Yes. Companies get seat-based enrollment, a dashboard showing every technician's progress and logged training hours, and exportable, audit-ready training records aligned to your written practice — with Level III oversight across the whole roster.",
  },
  {
    q: "Are the practice exams really free?",
    a: "Yes — the full 5,011-question bank across UT, RT, MT, PT and ET at Levels I, II and III is free to use with instant scoring and missed-question review. No account is required to practice; create a free account to save your attempt history (and to claim the free VT course).",
  },
];

export default async function HomePage() {
  // Logged-in students land on their dashboard, not the marketing page.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const methods = COURSES.filter((c) => ["ut", "rt", "mt", "pt", "et", "vt"].includes(c.id));
  return (
    <>
      <WaveProgress />
      <div className="announce-bar">
        🎉 Limited time: <Link href="/signup">VT Level I &amp; II training — completely FREE when you sign up</Link>{" "}
        <span className="mono">· full course · real certificate · no card required</span>
      </div>
      <Header />
      <main>
        {/* ============ HERO ============ */}
        <section className="hero on-dark">
          <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
            <div className="brand-lockup" data-reveal="zoom">
              <div>
                <div className="lk-name">NDTACADEMY<em>.COM</em></div>
                <div className="lk-tag">Train · Test · Certify with Confidence</div>
              </div>
            </div>
            <div className="offer-chip" data-reveal>
              <span className="dot" /> Limited time — VT Level I &amp; II free with signup
            </div>
            <h1 data-reveal>
              Online NDT Training<br />
              <span className="accent">run by Level IIIs.</span>
            </h1>
            <p className="lede" data-reveal>
              NDTAcademy.com was founded by two multi-certified ASNT Level IIIs — and every
              student trains under an assigned Level III who verifies compliance and
              competence. Method courses for Levels I–III, tracked formal training hours,
              and a 5,000-question practice exam bank.
            </p>
            <div className="hero-cta" data-reveal>
              <Link className="btn btn-primary" href="/signup">Create Free Account</Link>
              <Link className="btn btn-ghost" href="/courses/visual-testing">Start VT Free</Link>
            </div>
          </div>
          <HeroWave />
        </section>

        <div className="stat-band on-dark">
          <div className="wrap" data-reveal-stagger data-reveal>
            <div className="stat"><div className="num">2</div><div className="lbl">ASNT Level III founders</div></div>
            <div className="stat"><div className="num">5,011</div><div className="lbl">Practice questions</div></div>
            <div className="stat"><div className="num">415<em>h</em></div><div className="lbl">Designed training hours</div></div>
            <div className="stat"><div className="num">100<em>%</em></div><div className="lbl">CP-105 coverage, verified</div></div>
          </div>
        </div>

        {/* ============ FREE VT OFFER ============ */}
        <section className="offer-band on-dark" id="free-vt">
          <div className="wrap">
            <div data-reveal="left">
              <span className="kicker">Limited-Time Launch Offer</span>
              <h2>VT Level I &amp; II — completely free</h2>
              <p className="lede" style={{ margin: "14px 0 22px" }}>
                Create a free account and take our flagship Visual Testing course at no cost:
                30 narrated video lessons, photoreal imagery, borescope and lighting simulators,
                module quizzes, level finals — and a real, hour-verified certificate of formal
                training when you complete the requirements. No card. No catch.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="btn btn-primary" href="/signup">Sign Up &amp; Start Free</Link>
                <Link className="btn btn-ghost" href="/courses/visual-testing">See the VT Course</Link>
              </div>
            </div>
            <div className="offer-badge" data-reveal="zoom">
              VT I + II<br />FREE
              <small>24 H OF FORMAL TRAINING · LIMITED TIME</small>
            </div>
          </div>
        </section>

        {/* ============ LEVEL III OVERSIGHT ============ */}
        <section className="block dark on-dark">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="kicker">Your Assigned Level III</span>
              <h2>Every student trains under a Level III</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Certificates mean something when a qualified authority stands behind them. On
                NDTAcademy.com, every student is assigned an ASNT Level III who oversees their
                training and verifies compliance and competence — the same structure your
                employer&apos;s written practice expects.
              </p>
            </div>
            <div className="oversight-flow" data-reveal-stagger data-reveal>
              <div className="oversight-step">
                <h3>Assigned</h3>
                <p>Create an account and a multi-certified ASNT Level III is assigned to your training record from day one.</p>
              </div>
              <div className="oversight-step">
                <h3>Overseen</h3>
                <p>Your Level III monitors lesson progress, quiz results, and your active-engagement hour ledger as you train.</p>
              </div>
              <div className="oversight-step">
                <h3>Verified</h3>
                <p>Training records are checked against SNT-TC-1A 2024 / NAS410 hour and content requirements — compliance isn&apos;t assumed, it&apos;s verified.</p>
              </div>
              <div className="oversight-step">
                <h3>Signed Off</h3>
                <p>Competence confirmed: your certificate documents the hours, the content, the exams — and the Level III oversight behind them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FOUNDERS ============ */}
        <section className="block">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="kicker">Founded by the People Who Do the Work</span>
              <h2>Built by two multi-certified ASNT Level IIIs</h2>
            </div>
            <div className="grid cols-2" data-reveal-stagger data-reveal>
              <div className="card feature founder-card tilt-card">
                <div className="founder-medal">III</div>
                <div>
                  <span className="code">Co-Founder · ASNT Level III</span>
                  <h3>Multi-method Level III</h3>
                  <p>
                    Working aviation and industrial inspection background — written practices,
                    qualification programs, and the audits that test them. Built NDT Academy&apos;s
                    curricula directly from the CP-105 topical outlines.
                  </p>
                  <div className="meth">
                    {["UT", "RT", "MT", "PT", "VT"].map((m) => <span key={m} className="chip">{m}</span>)}
                  </div>
                </div>
              </div>
              <div className="card feature founder-card tilt-card">
                <div className="founder-medal">III</div>
                <div>
                  <span className="code">Co-Founder · ASNT Level III</span>
                  <h3>Multi-method Level III</h3>
                  <p>
                    Repair-station and field-inspection experience across aerospace and heavy
                    industry. Leads the Level III oversight program — every student record gets
                    qualified eyes on it.
                  </p>
                  <div className="meth">
                    {["UT", "ET", "MT", "PT", "VT"].map((m) => <span key={m} className="chip">{m}</span>)}
                  </div>
                </div>
              </div>
            </div>
            <p data-reveal style={{ color: "var(--text-soft)", marginTop: 18, maxWidth: "72ch" }}>
              Most online NDT training is written far from the shop floor. Ours comes from the
              two Level IIIs who run it — and who put their oversight on every record this
              platform produces. <Link href="/about">More about our approach →</Link>
            </p>
          </div>
        </section>

        {/* ============ METHODS ============ */}
        <section className="block tight" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head split" data-reveal>
              <div>
                <span className="kicker">Methods</span>
                <h2>NDT training in every major method</h2>
              </div>
              <Link className="btn btn-ghost" href="/courses">All Courses</Link>
            </div>
            <div className="grid cols-3" data-reveal-stagger data-reveal>
              {methods.map((c) => (
                <Link key={c.id} className="card tilt-card" href={`/courses/${slugForCourse(c.id)}`}>
                  <span className="code">{c.code}{c.id === "vt" ? " · FREE FOR A LIMITED TIME" : ""}</span>
                  <h3>{c.name}</h3>
                  <p>
                    {c.id === "ut" && "Sound theory through hands-on calibration: thickness, shear wave, and weld inspection technique."}
                    {c.id === "rt" && "Film and digital radiography, exposure technique, and image interpretation, with radiation safety."}
                    {c.id === "mt" && "Yokes, benches, and wet/dry techniques for surface and near-surface indications in ferrous parts."}
                    {c.id === "pt" && "Type I and II penetrant systems, processing, and evaluation per industry specifications."}
                    {c.id === "et" && "Impedance plane analysis, surface and bolt-hole inspection, and eddy current array techniques."}
                    {c.id === "vt" && "Fully produced: narrated videos, simulators, quizzes, finals, and an hour-verified certificate."}
                  </p>
                  <div className="levels">
                    {c.levels.map((l) => (
                      <span key={l.level} className="chip">
                        {l.level === "I" || l.level === "II" || l.level === "III" ? `Level ${l.level}` : l.level}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="block dark on-dark">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="kicker">How it works</span>
              <h2>From signup to a verified certificate</h2>
            </div>
            <div className="steps" data-reveal-stagger data-reveal>
              <div className="step"><div><h3>Create your free account</h3><p>Takes a minute — and unlocks the free VT Level I &amp; II course while the launch offer lasts. A Level III is assigned to your record.</p></div></div>
              <div className="step"><div><h3>Train</h3><p>Narrated video lessons, photoreal imagery, interactive trainers. Active engagement time logs toward SNT-TC-1A / NAS410 formal training hours — idle time doesn&apos;t count.</p></div></div>
              <div className="step"><div><h3>Prove it</h3><p>Knowledge checks gate every lesson, module quizzes check retention, and a 50-question final closes each level. Drill the 5,011-question practice bank anytime.</p></div></div>
              <div className="step"><div><h3>Certify with confidence</h3><p>Your certificate issues only when lessons, the full auditable hours, and the final are all met — with Level III oversight documented behind it.</p></div></div>
            </div>
          </div>
        </section>

        {/* ============ AUDIENCE ============ */}
        <section className="block">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="kicker">Who it&apos;s for</span>
              <h2>Individuals and companies</h2>
            </div>
            <div className="audience" data-reveal-stagger data-reveal>
              <div className="card feature tilt-card">
                <span className="code">For Technicians</span>
                <h3>Start or advance your NDT career</h3>
                <ul>
                  <li>VT Level I &amp; II free for a limited time</li>
                  <li>Method courses for Levels I, II and III</li>
                  <li>Formal training hours logged automatically</li>
                  <li>An assigned Level III on your record</li>
                </ul>
                <Link className="btn btn-primary" href="/signup">Create Free Account</Link>
              </div>
              <div className="card feature tilt-card">
                <span className="code">For Companies</span>
                <h3>Train and document your whole team</h3>
                <ul>
                  <li>Company dashboard with every technician&apos;s progress</li>
                  <li>Seat-based enrollment for multiple students</li>
                  <li>Exportable, audit-ready training records</li>
                  <li>Level III oversight across the roster</li>
                </ul>
                <Link className="btn btn-primary" href="/contact">Talk to Us</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="block tight" id="faq">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <span className="kicker">NDT Training FAQ</span>
              <h2>Common questions, straight answers</h2>
            </div>
            <div className="faq" data-reveal-stagger data-reveal>
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-a"><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band on-dark">
          <div className="wrap">
            <div data-reveal="left">
              <h2>Your free VT course is waiting</h2>
              <p>Sign up in a minute. Train under a Level III. Earn a certificate that holds up.</p>
            </div>
            <Link className="btn btn-primary" href="/signup" data-reveal="right">Create Free Account</Link>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollFX />
      <JsonLd data={faqJsonLd(FAQS)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "NDT Training Courses",
          itemListElement: COURSES.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/courses/${slugForCourse(c.id)}`,
            name: `${c.name} Training`,
          })),
        }}
      />
    </>
  );
}
