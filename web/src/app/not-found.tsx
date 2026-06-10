import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="block" style={{ minHeight: "60vh" }}>
          <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
            <span className="kicker" style={{ justifyContent: "center" }}>404 · No Indication Found</span>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", marginBottom: 14 }}>
              This page didn&apos;t pass inspection
            </h1>
            <p className="lede" style={{ margin: "0 auto 28px" }}>
              The page you&apos;re looking for doesn&apos;t exist or has moved.
            </p>
            <p style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/">Back to Home</Link>
              <Link className="btn btn-ghost" href="/courses">Browse Courses</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
