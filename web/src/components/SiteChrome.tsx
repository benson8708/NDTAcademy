"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Mobile nav toggle + scroll-reveal, ported from site/js/site.js. */
export function NavToggle() {
  return (
    <button
      className="nav-toggle"
      aria-label="Menu"
      onClick={(e) => {
        const nav = e.currentTarget.parentElement?.querySelector("nav.main-nav");
        nav?.classList.toggle("open");
      }}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}

export function RevealInit() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

/**
 * Session-aware header button. Renders "Sign In" statically so marketing
 * pages stay fully static, then swaps to "Dashboard" after hydration when a
 * session exists.
 */
export function AuthButton() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    // Fetch the friendly name OUTSIDE the auth-state callback — calling awaited
    // supabase methods inside onAuthStateChange deadlocks supabase-js.
    const enrich = async (user: { id: string; email?: string }) => {
      let display = user.email?.split("@")[0] || "Account";
      try {
        const { data: prof } = await supabase
          .from("profiles").select("full_name").eq("id", user.id).single();
        if (prof?.full_name?.trim()) display = prof.full_name.trim();
      } catch { /* keep email-based fallback */ }
      if (active) setName(display);
    };
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) enrich(data.user); else setName(null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // synchronous only — no supabase calls here
      if (!session?.user) setName(null);
      else setName((n) => n || session.user.email?.split("@")[0] || "Account");
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);
  if (name) {
    return (
      <span className="nav-user">
        <a href="/dashboard" className="nav-user-name" title="Go to your dashboard">
          <span className="nav-user-dot" aria-hidden="true" />{name}
        </a>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-ghost btn-sm nav-logout">Log out</button>
        </form>
      </span>
    );
  }
  return <a href="/login" className="btn btn-primary btn-sm">Sign In</a>;
}
