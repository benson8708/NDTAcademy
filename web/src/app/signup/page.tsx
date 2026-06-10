import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free NDT Academy account — enroll in NDT courses, log formal training hours, and save your practice exam history.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main>
        <section className="block" style={{ minHeight: "70vh" }}>
          <div className="wrap" style={{ maxWidth: 480 }}>
            <div className="card" style={{ padding: 36 }}>
              <span className="kicker">Create Account</span>
              <h1 style={{ fontSize: "1.8rem", marginBottom: 22 }}>Start training in minutes</h1>
              <Suspense>
                <SignupForm />
              </Suspense>
              <p style={{ marginTop: 18, fontSize: ".95rem", color: "var(--text-soft)" }}>
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
