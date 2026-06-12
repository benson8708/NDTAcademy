"use client";
// Gated 3-D method trainer step. Loads the lesson's engine (code-split),
// renders the task checklist, and unlocks the player's Continue button when
// every task is done. Engines implement src/components/trainer3d/contract.ts.
import { useEffect, useRef, useState } from "react";
import type { TrainerConfig, TrainerHandle, TrainerMount } from "./contract";

const ENGINES: Record<string, () => Promise<{ default: TrainerMount }>> = {
  ut: () => import("./engines/ut.js"),
  mt: () => import("./engines/mt.js"),
  et: () => import("./engines/et.js"),
  rt: () => import("./engines/rt.js"),
  pt: () => import("./engines/pt.js"),
  rs: () => import("./engines/rs.js"),
};

export default function Trainer3D({
  config,
  onComplete,
}: {
  config: TrainerConfig;
  onComplete: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [hintFor, setHintFor] = useState<string | null>(null);
  const allDone = config.tasks.every((t) => done.has(t.id));
  const completedRef = useRef(false);

  useEffect(() => {
    let handle: TrainerHandle | null = null;
    let cancelled = false;
    const host = hostRef.current;
    const loader = ENGINES[config.engine];
    if (!host || !loader) {
      setError(`Trainer engine "${config.engine}" unavailable`);
      onComplete(); // never trap the student behind a broken trainer
      return;
    }
    loader()
      .then(({ default: mount }) => {
        if (cancelled || !hostRef.current) return;
        handle = mount(hostRef.current, config, {
          onTaskDone: (id) =>
            setDone((prev) => (prev.has(id) ? prev : new Set(prev).add(id))),
          onAllDone: () => setDone(new Set(config.tasks.map((t) => t.id))),
          reducedMotion:
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          width: hostRef.current.clientWidth,
          height: hostRef.current.clientHeight,
        });
      })
      .catch((e) => {
        setError(String(e?.message ?? e));
        onComplete(); // graceful degrade: don't block the lesson
      });
    return () => {
      cancelled = true;
      try { handle?.dispose(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // fire the gate exactly once
  useEffect(() => {
    if (allDone && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [allDone, onComplete]);

  // stuck-hint: surface the first incomplete task's hint after 45s
  useEffect(() => {
    if (allDone) return;
    const t = setTimeout(() => {
      const stuck = config.tasks.find((x) => !done.has(x.id) && x.hint);
      if (stuck) setHintFor(stuck.id);
    }, 45000);
    return () => clearTimeout(t);
  }, [done, allDone, config.tasks]);

  return (
    <div className="t3d">
      <div className="t3d-head">
        <span className="code">Hands-on · 3-D trainer</span>
        <h3>{config.title}</h3>
        <p>{config.intro}</p>
      </div>
      <div className="t3d-stage" ref={hostRef}>
        {error && (
          <div className="t3d-error">
            3-D trainer failed to load ({error}) — continuing without it.
          </div>
        )}
      </div>
      <ul className="t3d-tasks" aria-label="Trainer tasks">
        {config.tasks.map((t) => (
          <li key={t.id} className={done.has(t.id) ? "done" : ""}>
            <span className="t3d-check" aria-hidden="true">
              {done.has(t.id) ? "✓" : "○"}
            </span>
            <span>
              {t.label}
              {hintFor === t.id && !done.has(t.id) && t.hint && (
                <em className="t3d-hint"> — hint: {t.hint}</em>
              )}
            </span>
          </li>
        ))}
      </ul>
      {allDone && <div className="t3d-donebanner">✓ Task complete — continue when ready</div>}
    </div>
  );
}
