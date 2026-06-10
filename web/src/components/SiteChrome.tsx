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
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session?.user),
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  return signedIn ? (
    <a href="/dashboard" className="btn btn-primary btn-sm">Dashboard</a>
  ) : (
    <a href="/login" className="btn btn-primary btn-sm">Sign In</a>
  );
}
