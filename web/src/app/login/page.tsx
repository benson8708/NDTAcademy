import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NDT Academy account — courses, training hours, exam history, and certificates.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main>
        <section className="block" style={{ minHeight: "70vh" }}>
          <div className="wrap" style={{ maxWidth: 440 }}>
            <div className="card" style={{ padding: 36 }}>
              <span className="kicker">Sign In</span>
              <h1 style={{ fontSize: "1.8rem", marginBottom: 22 }}>Your training, your records</h1>
              <Suspense>
                <LoginForm />
              </Suspense>
              <p style={{ marginTop: 18, fontSize: ".95rem", color: "var(--text-soft)" }}>
                New to NDT Academy? <Link href="/signup">Create a free account</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
