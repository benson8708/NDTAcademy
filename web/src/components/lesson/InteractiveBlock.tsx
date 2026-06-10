"use client";
// In-lesson exercises. Four variants cover the curriculum's interactive
// placeholders: decision scenarios, find-the-indication hotspots on a figure,
// classification sorting, and the illumination calculator.
import { useMemo, useState } from "react";
import type { Interactive } from "@/lib/vtContent";

export default function InteractiveBlock({
  courseId,
  interactive,
  figureFileById,
}: {
  courseId: string;
  interactive: Interactive;
  figureFileById: Record<string, string>;
}) {
  return (
    <div className="interactive-block">
      <div className="ib-head">
        <span className="mtag interactive">interactive</span>
        <span className="t">{interactive.title}</span>
      </div>
      <div className="ib-body">
        <p className="ib-intro">{interactive.intro}</p>
        {interactive.type === "scenario" && <Scenario data={interactive} />}
        {interactive.type === "hotspot" && (
          <Hotspot courseId={courseId} data={interactive} file={figureFileById[interactive.figureId]} />
        )}
        {interactive.type === "sort" && <Sort data={interactive} />}
        {interactive.type === "calculator" && <LightingCalculator />}
      </div>
    </div>
  );
}

function Scenario({ data }: { data: Extract<Interactive, { type: "scenario" }> }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const done = step >= data.steps.length;
  if (done) {
    return <div className="form-ok">Scenario complete — nice decision-making.</div>;
  }
  const s = data.steps[step];
  return (
    <div>
      <div className="ib-progress">Step {step + 1} of {data.steps.length}</div>
      <div className="q-text" style={{ fontSize: "1.05rem" }}>{s.prompt}</div>
      <div className="answers">
        {s.options.map((opt, i) => {
          let cls = "ans";
          if (picked !== null) {
            if (i === s.correct) cls += " correct";
            else if (i === picked) cls += " wrong";
          }
          return (
            <button key={i} className={cls} disabled={picked !== null} onClick={() => setPicked(i)}>
              <span className="key">{"ABCD"[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="ib-feedback">
          <strong>{picked === s.correct ? "Right call." : "Not quite."}</strong> {s.feedback}
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => { setStep(step + 1); setPicked(null); }}>
              {step + 1 === data.steps.length ? "Finish" : "Next Step"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Hotspot({ courseId, data, file }: { courseId: string; data: Extract<Interactive, { type: "hotspot" }>; file?: string }) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const targets = data.regions.filter((r) => r.isTarget).length;
  const foundTargets = data.regions.filter((r, i) => r.isTarget && found.has(i)).length;
  if (!file) return null;
  return (
    <div>
      <div className="hotspot-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/content/${courseId}/figures/${file}`} alt={data.title} />
        {data.regions.map((r, i) => (
          <button
            key={i}
            className={`hotspot-region${found.has(i) ? (r.isTarget ? " hit" : " miss") : ""}`}
            style={{
              left: `${(r.x / 800) * 100}%`,
              top: `${(r.y / 450) * 100}%`,
              width: `${(r.w / 800) * 100}%`,
              height: `${(r.h / 450) * 100}%`,
            }}
            aria-label={r.label}
            onClick={() => {
              setFound((prev) => new Set(prev).add(i));
              setMessage(`${r.isTarget ? "✓" : "✗"} ${r.label}: ${r.feedback}`);
            }}
          />
        ))}
      </div>
      <div className="ib-progress" style={{ marginTop: 10 }}>
        {foundTargets} / {targets} indications found — click suspect areas on the image
      </div>
      {message && <div className="ib-feedback">{message}</div>}
      {foundTargets === targets && <div className="form-ok" style={{ marginTop: 10 }}>All indications located.</div>}
    </div>
  );
}

function Sort({ data }: { data: Extract<Interactive, { type: "sort" }> }) {
  const [assigned, setAssigned] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const allAssigned = data.items.every((_, i) => assigned[i] !== undefined);
  const correctCount = data.items.filter((item, i) => assigned[i] === item.bucket).length;
  return (
    <div>
      {data.items.map((item, i) => (
        <div key={i} className={`sort-row${revealed ? (assigned[i] === item.bucket ? " good" : " bad") : ""}`}>
          <span className="sort-label">{item.label}</span>
          <span className="sort-buckets">
            {data.buckets.map((b, bi) => (
              <button
                key={bi}
                className={`pick btn-sm${assigned[i] === bi ? " sel" : ""}`}
                style={{ padding: "6px 12px", fontSize: ".85rem" }}
                disabled={revealed}
                onClick={() => setAssigned((prev) => ({ ...prev, [i]: bi }))}
              >
                {b}
              </button>
            ))}
          </span>
          {revealed && assigned[i] !== item.bucket && (
            <div className="ib-feedback" style={{ flexBasis: "100%" }}>
              {data.buckets[item.bucket]} — {item.why}
            </div>
          )}
        </div>
      ))}
      {!revealed ? (
        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={!allAssigned} onClick={() => setRevealed(true)}>
          Check Answers
        </button>
      ) : (
        <div className={correctCount === data.items.length ? "form-ok" : "ib-feedback"} style={{ marginTop: 12 }}>
          {correctCount} of {data.items.length} correct
        </div>
      )}
    </div>
  );
}

function LightingCalculator() {
  const [reading, setReading] = useState(50);
  const [unit, setUnit] = useState<"fc" | "lux">("fc");
  const [requirement, setRequirement] = useState(1000);
  const lux = useMemo(() => (unit === "fc" ? reading * 10.7639 : reading), [reading, unit]);
  const passes = lux >= requirement;
  return (
    <div>
      <div className="grid cols-3" style={{ gap: 12 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Meter reading</label>
          <input
            type="number"
            min={0}
            value={reading}
            onChange={(e) => setReading(Number(e.target.value) || 0)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as "fc" | "lux")}>
            <option value="fc">footcandles (fc)</option>
            <option value="lux">lux</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Procedure minimum</label>
          <select value={requirement} onChange={(e) => setRequirement(Number(e.target.value))}>
            <option value={500}>500 lux — general</option>
            <option value={1000}>1000 lux — critical / direct VT</option>
          </select>
        </div>
      </div>
      <div className={passes ? "form-ok" : "form-error"} style={{ marginTop: 14 }}>
        {reading} {unit} = {Math.round(lux).toLocaleString()} lux —{" "}
        {passes
          ? "meets the requirement. Record the reading, meter serial, and calibration due date."
          : `below the ${requirement.toLocaleString()} lux minimum. Add auxiliary lighting and re-measure at the inspection surface.`}
      </div>
    </div>
  );
}
