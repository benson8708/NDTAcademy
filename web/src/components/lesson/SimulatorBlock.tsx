"use client";
// Advanced VT trainers backed by photorealistic scenes.
//  - borescope: drag a circular scope viewport across a dark scene and click
//    the indications you find (teaches systematic RVI scanning).
//  - lighting: raise illumination at the surface until the procedure minimum
//    is met — indications only become visible with adequate light.
import { useRef, useState } from "react";

export interface SimTarget { x: number; y: number; label: string; feedback: string }
export interface Simulator {
  type: "borescope" | "lighting";
  title: string;
  intro: string;
  scene: string; // file in /content/vt/photos/
  targets: SimTarget[]; // x/y as % of scene (0–100)
  minLux?: number;
}

const SCOPE_R = 110; // px radius of the scope viewport

export default function SimulatorBlock({ sim, courseId = "vt", onComplete }: { sim: Simulator; courseId?: string; onComplete?: () => void }) {
  return (
    <div className="interactive-block sim-block">
      <div className="ib-head">
        <span className="mtag simulation">simulation</span>
        <span className="t">{sim.title}</span>
      </div>
      <div className="ib-body">
        <p className="ib-intro">{sim.intro}</p>
        {sim.type === "borescope" ? <Borescope sim={sim} courseId={courseId} onComplete={onComplete} /> : <Lighting sim={sim} courseId={courseId} onComplete={onComplete} />}
      </div>
    </div>
  );
}

/** Crack-like indication overlay drawn at a scene coordinate. */
function Indication({ t, visible, found, onClick }: {
  t: SimTarget; visible: boolean; found: boolean; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`sim-indication${found ? " found" : ""}`}
      style={{ left: `${t.x}%`, top: `${t.y}%`, opacity: visible ? 1 : 0 }}
      onClick={onClick}
      aria-label={t.label}
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 60 30" width="56" height="28" aria-hidden="true">
        <path
          d="M2 18 L12 14 L18 17 L27 9 L33 13 L41 7 L49 11 L58 6"
          fill="none"
          stroke={found ? "#1E9E6A" : "#1a1a1a"}
          strokeWidth={found ? 3 : 2}
          strokeLinecap="round"
          opacity={found ? 1 : 0.85}
        />
        <path d="M27 9 L29 16 M41 7 L42 13" stroke={found ? "#1E9E6A" : "#1a1a1a"} strokeWidth="1.5" opacity={found ? 1 : 0.7} />
      </svg>
    </button>
  );
}

function Borescope({ sim, courseId, onComplete }: { sim: Simulator; courseId: string; onComplete?: () => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [stage, setStage] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [found, setFound] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const src = `/content/${courseId}/photos/${sim.scene}`;
  const done = found.size === sim.targets.length;

  function move(e: React.PointerEvent) {
    const rect = stageRef.current!.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (Math.abs(rect.width - stage.w) > 1 || Math.abs(rect.height - stage.h) > 1) {
      setStage({ w: rect.width, h: rect.height });
    }
  }

  return (
    <div>
      <div className="ib-progress">
        {found.size} / {sim.targets.length} indications located — sweep the scope, click what you find
      </div>
      <div
        ref={stageRef}
        className="scope-stage"
        onPointerMove={move}
        onPointerLeave={() => setPos(null)}
      >
        {/* dark, unscanned stage */}
        <div className="scope-dark" aria-hidden="true" />
        {/* scope viewport revealing the scene */}
        {pos && (
          <div
            className="scope-view"
            style={{ left: pos.x - SCOPE_R, top: pos.y - SCOPE_R, width: SCOPE_R * 2, height: SCOPE_R * 2 }}
          >
            <div
              className="scope-inner"
              style={{
                width: stage.w,
                height: stage.h,
                transform: `translate(${-(pos.x - SCOPE_R)}px, ${-(pos.y - SCOPE_R)}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} />
              {sim.targets.map((t, i) => (
                <Indication
                  key={i}
                  t={t}
                  visible
                  found={found.has(i)}
                  onClick={() => {
                    setFound((prev) => {
                      const nx = new Set(prev).add(i);
                      if (nx.size === sim.targets.length) onComplete?.();
                      return nx;
                    });
                    setMessage(`✓ ${t.label}: ${t.feedback}`);
                  }}
                />
              ))}
            </div>
            <div className="scope-reticle" aria-hidden="true" />
          </div>
        )}
      </div>
      {message && <div className="ib-feedback">{message}</div>}
      {done && (
        <div className="form-ok" style={{ marginTop: 10 }}>
          Inspection complete — all indications located and logged. In a real RVI you&apos;d record
          scope position, direction of view, and tip-to-target distance for each.
        </div>
      )}
    </div>
  );
}

function Lighting({ sim, courseId, onComplete }: { sim: Simulator; courseId: string; onComplete?: () => void }) {
  const [lux, setLux] = useState(150);
  const [found, setFound] = useState<Set<number>>(new Set());
  const min = sim.minLux ?? 1000;
  const src = `/content/${courseId}/photos/${sim.scene}`;
  const brightness = 0.12 + (lux / 1500) * 1.05;
  const visible = lux >= min * 0.8;
  const meets = lux >= min;
  const done = found.size === sim.targets.length;

  return (
    <div>
      <div className="lux-controls">
        <input
          type="range"
          min={50}
          max={1500}
          step={10}
          value={lux}
          onChange={(e) => setLux(Number(e.target.value))}
          aria-label="Illumination level"
        />
        <span className={`badge ${meets ? "ok" : "bad"}`} style={{ fontSize: ".78rem" }}>
          {lux.toLocaleString()} lux {meets ? `≥ ${min.toLocaleString()} — meets procedure` : `< ${min.toLocaleString()} — inadequate`}
        </span>
      </div>
      <div className="lighting-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Inspection surface" style={{ filter: `brightness(${brightness}) contrast(${0.9 + lux / 4000})` }} draggable={false} />
        {sim.targets.map((t, i) => (
          <Indication
            key={i}
            t={t}
            visible={visible}
            found={found.has(i)}
            onClick={() => visible && setFound((prev) => {
              const nx = new Set(prev).add(i);
              if (nx.size === sim.targets.length) onComplete?.();
              return nx;
            })}
          />
        ))}
      </div>
      {!visible && (
        <div className="ib-feedback">
          You can&apos;t evaluate what you can&apos;t see. Raise the illumination to the procedure
          minimum and verify it with a meter <em>at the surface</em>.
        </div>
      )}
      {visible && !done && (
        <div className="ib-feedback">Now the surface reads properly — click each indication you can see.</div>
      )}
      {done && (
        <div className="form-ok" style={{ marginTop: 10 }}>
          All indications found at {lux.toLocaleString()} lux. The same surface hid them at low
          light — that&apos;s why measured illumination is a procedure requirement, not a suggestion.
        </div>
      )}
    </div>
  );
}
