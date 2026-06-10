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

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/verify");

  const identity = await getIdentityStatus(supabase, user.id);

  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">Identity Verification</span>
            <h1>Verify who you are. Once.</h1>
            <p className="lede">
              Your training record and certificates are only worth something if they&apos;re
              provably yours. Before coursework or exams, we verify your identity with a
              government ID and a selfie — it takes about two minutes, and your assigned
              Level III relies on it when signing off your record.
            </p>
          </div>
        </section>
        <section className="block" style={{ minHeight: "50vh" }}>
          <div className="wrap" style={{ maxWidth: 640 }}>
            {identity.verified ? (
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
