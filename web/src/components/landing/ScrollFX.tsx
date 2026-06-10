"use client";
// Landing-page motion engine.
//  - Publishes scroll progress as CSS custom properties on <html>:
//      --scroll  (0..1 of full page)  --scroll-px (raw pixels)
//    Everything scroll-driven (waveform, 3D block rotation, parallax) reads
//    these vars so there's exactly one rAF-throttled scroll listener.
//  - Reveal v2: elements with [data-reveal] fade/slide in when they enter the
//    viewport; [data-reveal-stagger] children cascade. Respects
//    prefers-reduced-motion (everything appears instantly).
import { useEffect } from "react";

export default function ScrollFX() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    let raf = 0;
    const publish = () => {
      raf = 0;
      const max = Math.max(root.scrollHeight - window.innerHeight, 1);
      const y = window.scrollY;
      root.style.setProperty("--scroll", (y / max).toFixed(4));
      root.style.setProperty("--scroll-px", String(Math.round(y)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(publish);
    };
    publish();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced) {
      revealEls.forEach((el) => el.classList.add("fx-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            el.classList.add("fx-in");
            if (el.hasAttribute("data-reveal-stagger")) {
              [...el.children].forEach((child, i) =>
                (child as HTMLElement).style.setProperty("--fx-delay", `${Math.min(i * 90, 540)}ms`),
              );
            }
            io.unobserve(el);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );
      revealEls.forEach((el) => io.observe(el));
      return () => {
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
