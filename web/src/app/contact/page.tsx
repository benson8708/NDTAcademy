import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Enrollment, Company Training & Certification Questions",
  description:
    "Contact NDT Academy about individual enrollment, company and team NDT training programs, the 20-week program, or certification path questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">Contact</span>
            <h1>Let&apos;s talk training</h1>
            <p className="lede">
              Enrollment questions, company programs, or certification path advice — send a
              note and we&apos;ll get back to you within one business day.
            </p>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="grid cols-2">
              <div>
                {/* TODO: replace action with your Formspree endpoint (free at formspree.io) */}
                <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
                  <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required /></div>
                  <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
                  <div className="field"><label htmlFor="company">Company (optional)</label><input id="company" name="company" /></div>
                  <div className="field">
                    <label htmlFor="topic">I&apos;m interested in</label>
                    <select id="topic" name="topic" defaultValue="Individual enrollment">
                      <option>Individual enrollment</option>
                      <option>Company / team training</option>
                      <option>20-week training program</option>
                      <option>Level III services</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="field"><label htmlFor="msg">Message</label><textarea id="msg" name="message" rows={5} required /></div>
                  <button className="btn btn-primary" type="submit">Send Message</button>
                </form>
              </div>
              <div className="grid" style={{ alignContent: "start" }}>
                <div className="card feature">
                  <span className="code">Email</span>
                  <h3>Direct</h3>
                  <p><a href="mailto:info@ndtacademy.com">info@ndtacademy.com</a></p>
                </div>
                <div className="card feature">
                  <span className="code">Companies</span>
                  <h3>Team Training</h3>
                  <p>Tell us how many technicians and which methods, and we&apos;ll quote seat-based pricing with a company dashboard for tracking.</p>
                </div>
                <div className="card feature">
                  <span className="code">Response</span>
                  <h3>Within 1 business day</h3>
                  <p>We answer every inquiry, usually same day.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Contact", url: `${SITE_URL}/contact` },
        ])}
      />
    </>
  );
}
