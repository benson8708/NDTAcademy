"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%", marginTop: 8 }}>
        {busy ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
