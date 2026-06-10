"use client";
// Active-engagement time tracking. Every BEAT seconds, if the tab is visible
// and the user has interacted within IDLE_MS, one slice is logged to the
// training-hour ledger. Idle or hidden time never counts.
import { useEffect, useRef, useState } from "react";

const BEAT = 30; // seconds per logged slice
const IDLE_MS = 60_000;

export default function HeartbeatTracker({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const lastActivity = useRef(Date.now());
  const [active, setActive] = useState(true);

  useEffect(() => {
    const mark = () => { lastActivity.current = Date.now(); };
    const events: (keyof WindowEventMap)[] = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const isEngaged = () =>
      document.visibilityState === "visible" && Date.now() - lastActivity.current < IDLE_MS;

    const statusTick = setInterval(() => setActive(isEngaged()), 5_000);
    const onVisibility = () => setActive(isEngaged());
    document.addEventListener("visibilitychange", onVisibility);

    const beat = setInterval(() => {
      if (!isEngaged()) return;
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, seconds: BEAT }),
        keepalive: true,
      }).catch(() => {});
    }, BEAT * 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(statusTick);
      clearInterval(beat);
    };
  }, [courseId, lessonId]);

  return (
    <div className={`track-pill${active ? "" : " paused"}`} role="status">
      <span className="pulse" aria-hidden="true"></span>
      {active ? "Logging training time" : "Paused — idle or hidden"}
    </div>
  );
}
