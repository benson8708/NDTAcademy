"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: { data: { full_name: String(form.get("full_name")) } },
    });
    if (error || !data.user) {
      setError(error?.message ?? "Could not create your account.");
      setBusy(false);
      return;
    }

    if (accountType === "company") {
      const companyName = String(form.get("company_name") || "").trim();
      if (companyName) {
        const { error: orgError } = await supabase.rpc("create_organization", {
          p_name: companyName,
          p_seats: Math.max(parseInt(String(form.get("seats") || "5"), 10) || 5, 1),
        });
        if (orgError) {
          // Account exists; org creation failed — surface but continue to dashboard
          console.error("create_organization failed:", orgError.message);
        }
      }
    }

    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="field">
        <label>Account type</label>
        <div className="option-row">
          <button type="button" className={`pick${accountType === "individual" ? " sel" : ""}`} onClick={() => setAccountType("individual")}>
            Individual<small>Technician / student</small>
          </button>
          <button type="button" className={`pick${accountType === "company" ? " sel" : ""}`} onClick={() => setAccountType("company")}>
            Company<small>Train a team</small>
          </button>
        </div>
      </div>
      <div className="field">
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" autoComplete="name" placeholder="Jordan Martinez" required />
      </div>
      {accountType === "company" && (
        <>
          <div className="field">
            <label htmlFor="company_name">Company name</label>
            <input id="company_name" name="company_name" autoComplete="organization" placeholder="Acme Inspection Services" required />
          </div>
          <div className="field">
            <label htmlFor="seats">Seats needed</label>
            <input id="seats" name="seats" type="number" min={1} max={500} defaultValue={5} />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" placeholder="8+ characters" minLength={8} required />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%", marginTop: 8 }}>
        {busy ? "Creating account…" : "Create Free Account"}
      </button>
    </form>
  );
}
