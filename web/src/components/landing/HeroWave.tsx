"use client";
// Hero UT wave — the brand's three-peak A-scan motif, driven entirely by
// scroll: peaks rise and fall as you scroll up and down, and hold still the
// moment you stop. One rAF-throttled scroll listener, no idle animation.
import { useEffect, useRef } from "react";

const W = 560, H = 220, BASE = 180;

// Signature peaks: apex x, shoulder geometry, max height, scroll phase/rate
const PEAKS = [
  { x: 95, lead: 80, trail: 110, edge: 176, max: 140, phase: 0.0, rate: 9 },
  { x: 228, lead: 215, trail: 242, edge: 172, max: 96, phase: 1.6, rate: 12 },
  { x: 358, lead: 345, trail: 372, edge: 174, max: 64, phase: 3.1, rate: 7 },
];

function wavePath(scroll: number) {
  const h = PEAKS.map(
    (p) => p.max * (0.5 + 0.5 * Math.sin(scroll * p.rate + p.phase)),
  );
  return (
    `M0,${BASE} L60,${BASE} ` +
    `L${PEAKS[0].lead},${PEAKS[0].edge} L${PEAKS[0].x},${(BASE - h[0]).toFixed(1)} L${PEAKS[0].trail},${PEAKS[0].edge} ` +
    `L150,${BASE} L200,${BASE} ` +
    `L${PEAKS[1].lead},${PEAKS[1].edge} L${PEAKS[1].x},${(BASE - h[1]).toFixed(1)} L${PEAKS[1].trail},${PEAKS[1].edge} ` +
    `L270,${BASE} L330,${BASE} ` +
    `L${PEAKS[2].lead},${PEAKS[2].edge} L${PEAKS[2].x},${(BASE - h[2]).toFixed(1)} L${PEAKS[2].trail},${PEAKS[2].edge} ` +
    `L420,${BASE} L560,${BASE}`
  );
}

export default function HeroWave() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const glowRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const render = () => {
      raf = 0;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const d = wavePath(window.scrollY / max);
      pathRef.current?.setAttribute("d", d);
      glowRef.current?.setAttribute("d", d);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const initial = wavePath(0);
  return (
    <svg
      className="hero-scan hero-scan-live"
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path ref={glowRef} d={initial} stroke="#1B82E8" strokeWidth="8" strokeLinejoin="round" opacity=".15" />
      <path ref={pathRef} d={initial} stroke="#1B82E8" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="0" y1={BASE} x2={W} y2={BASE} stroke="rgba(255,255,255,.25)" strokeWidth="1" />
    </svg>
  );
}
