import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PersonaVerify from "./PersonaVerify";
import { createClient } from "@/lib/supabase/server";
import { getIdentityStatus } from "@/lib/identity";

export const metadata: Metadata = { title: "Verify Your Identity", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ recheck?: string; next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/verify");

  const { recheck } = await searchParams;
  const identity = await getIdentityStatus(supabase, user.id);
  const examRecheck = recheck === "exam";

  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">{examRecheck ? "Exam Check-In" : "Identity Verification"}</span>
            <h1>{examRecheck ? "Confirm it's you before the exam" : "Verify who you are"}</h1>
            <p className="lede">
              {examRecheck
                ? "Every exam session starts with a fresh identity check-in — the same government ID + selfie flow, completed within minutes of sitting the exam. It's what makes your scores and certificates defensible."
                : "Your training record and certificates are only worth something if they're provably yours. We verify your identity with a government ID and a selfie before coursework — and re-verify before every exam."}
            </p>
          </div>
        </section>
        <section className="block" style={{ minHeight: "50vh" }}>
          <div className="wrap" style={{ maxWidth: 640 }}>
            {identity.verified && !examRecheck ? (
              <div className="card feature" style={{ borderTopColor: "var(--green)" }}>
                <span className="code" style={{ color: "var(--green)" }}>Verified</span>
                <h3>Your identity is verified</h3>
                <p>
                  You&apos;re cleared for courses and certification exams. Verification ID:{" "}
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".85rem" }}>{identity.inquiryId}</span>
                </p>
                <p style={{ marginTop: 14 }}>
                  <a className="btn btn-primary btn-sm" href="/dashboard">Back to Dashboard</a>
                </p>
              </div>
            ) : (
              <Suspense>
                <PersonaVerify
                  referenceId={user.id}
                  templateId={process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID!}
                  environment={process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT ?? "sandbox"}
                  lastStatus={identity.status}
                />
              </Suspense>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
