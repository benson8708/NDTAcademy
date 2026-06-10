"use client";
// Practice exam engine — ported from site/js/exam.js, now drawing from Postgres
// via the draw_questions RPC and saving attempts for signed-in users.
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const METHODS = [
  { key: "UT", code: "UT", label: "Ultrasonic" },
  { key: "RT", code: "RT", label: "Radiographic" },
  { key: "MPI", code: "MT", label: "Mag Particle" },
  { key: "LPI", code: "PT", label: "Penetrant" },
  { key: "ECT", code: "ET", label: "Eddy Current" },
] as const;
const METHOD_NAMES: Record<string, string> = {
  UT: "Ultrasonic", RT: "Radiographic", MPI: "Magnetic Particle",
  LPI: "Liquid Penetrant", ECT: "Eddy Current",
};
const PASS = 80;

interface Question {
  id: number;
  method: string;
  level: number;
  question: string;
  options: string[];
  correct: number;
}

type Phase = "setup" | "exam" | "results";

export default function ExamRunner({ initialMethod = "UT" }: { initialMethod?: string }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [method, setMethod] = useState(initialMethod);
  const [level, setLevel] = useState(1);
  const [count, setCount] = useState(25);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [qs, setQs] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [secs, setSecs] = useState(0);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const startedAt = useRef<number>(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }, []);

  const lockIn = useCallback((idx: number, qIndex: number) => {
    setLocked((already) => {
      if (already) return already;
      stopTimer();
      setPicks((p) => {
        const next = [...p];
        next[qIndex] = idx;
        return next;
      });
      return true;
    });
  }, [stopTimer]);

  const startTimer = useCallback((perQuestion: number, qIndex: number) => {
    stopTimer();
    if (!perQuestion) return;
    setSecs(perQuestion);
    tick.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          stopTimer();
          lockIn(-1, qIndex); // time out = no answer
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [stopTimer, lockIn]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  async function start() {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("draw_questions", {
        p_method: method,
        p_level: level,
        p_count: count,
      });
      if (error) throw error;
      const bank = (data as Question[]).filter(
        (q) => q.question && Array.isArray(q.options) && q.options.length === 4,
      );
      if (!bank.length) throw new Error("No questions returned");
      setQs(bank);
      setI(0);
      setPicks([]);
      setLocked(false);
      setSavedNote(null);
      startedAt.current = Date.now();
      setPhase("exam");
      startTimer(timer, 0);
    } catch {
      setLoadError("Could not load the question bank. Check your connection and try again.");
    }
    setLoading(false);
  }

  async function finish(finalPicks: number[]) {
    stopTimer();
    setPhase("results");
    const right = qs.reduce((n, q, idx) => n + (finalPicks[idx] === q.correct ? 1 : 0), 0);
    const pct = Math.round((right / qs.length) * 100);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("exam_attempts").insert({
          user_id: user.id,
          method,
          level,
          total: qs.length,
          correct: right,
          score: pct,
          passed: pct >= PASS,
          duration_seconds: Math.round((Date.now() - startedAt.current) / 1000),
          detail: { questions: qs.map((q, idx) => ({ id: q.id, pick: finalPicks[idx] ?? -1 })) },
        });
        setSavedNote(error ? null : "Attempt saved to your exam history");
      } else {
        setSavedNote("Sign in to save attempts to your exam history");
      }
    } catch {
      /* anonymous practice still works */
    }
  }

  function next() {
    if (i < qs.length - 1) {
      const ni = i + 1;
      setI(ni);
      setLocked(false);
      startTimer(timer, ni);
    } else {
      finish(picks);
    }
  }

  // ---------- setup ----------
  if (phase === "setup") {
    return (
      <div className="exam-setup">
        {loadError && <div className="form-error" role="alert">{loadError}</div>}
        <div className="field">
          <label>Method</label>
          <div className="option-row">
            {METHODS.map((m) => (
              <button key={m.key} className={`pick${method === m.key ? " sel" : ""}`} onClick={() => setMethod(m.key)}>
                {m.code}<small>{m.label}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Level</label>
          <div className="option-row">
            {[1, 2, 3].map((l) => (
              <button key={l} className={`pick${level === l ? " sel" : ""}`} onClick={() => setLevel(l)}>
                Level {"I".repeat(l)}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Questions</label>
          <div className="option-row">
            {[{ v: 10, l: "Quick drill" }, { v: 25, l: "Standard" }, { v: 50, l: "Full length" }].map((o) => (
              <button key={o.v} className={`pick${count === o.v ? " sel" : ""}`} onClick={() => setCount(o.v)}>
                {o.v}<small>{o.l}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Timer</label>
          <div className="option-row">
            {[{ v: 0, t: "Off", l: "Untimed" }, { v: 60, t: "60s", l: "per question" }, { v: 90, t: "90s", l: "per question" }].map((o) => (
              <button key={o.v} className={`pick${timer === o.v ? " sel" : ""}`} onClick={() => setTimer(o.v)}>
                {o.t}<small>{o.l}</small>
              </button>
            ))}
          </div>
        </div>
        <p style={{ margin: "24px 0" }}>
          <button className="btn btn-primary" onClick={start} disabled={loading}>
            {loading ? "Loading…" : "Start Exam"}
          </button>
        </p>
        <p className="lede" style={{ fontSize: ".95rem" }}>
          Questions are drawn at random from the bank each time, so every attempt is different.
          Passing threshold shown at 80%.
        </p>
      </div>
    );
  }

  // ---------- results ----------
  if (phase === "results") {
    const right = qs.reduce((n, q, idx) => n + (picks[idx] === q.correct ? 1 : 0), 0);
    const pct = Math.round((right / qs.length) * 100);
    const missed = qs
      .map((q, idx) => ({ q, pick: picks[idx] }))
      .filter((x) => x.pick !== x.q.correct);
    return (
      <div className="exam-shell">
        <div className="q-card">
          <div
            className="score-ring"
            style={{
              ["--pct" as string]: pct,
              ["--ring" as string]: pct >= PASS ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)",
            }}
          >
            <div>
              <span className="pct">{pct}%</span>
              <span className="frac">{right} of {qs.length}</span>
            </div>
          </div>
          <div className={`verdict ${pct >= PASS ? "pass" : "fail"}`}>
            {pct >= PASS ? "Pass — nice work" : "Below 80% — keep drilling"}
          </div>
          {savedNote && <div className="saved-note">{savedNote}</div>}
          {missed.length > 0 && (
            <div>
              <h3 style={{ margin: "10px 0 6px" }}>Review ({missed.length} missed)</h3>
              {missed.map(({ q, pick }) => (
                <div key={q.id} className="review-item">
                  <div className="rq">{q.question}</div>
                  {pick >= 0 ? (
                    <div className="ra bad">{"ABCD"[pick]}. {q.options[pick]}</div>
                  ) : (
                    <div className="ra bad">No answer (time)</div>
                  )}
                  <div className="ra good">{"ABCD"[q.correct]}. {q.options[q.correct]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="exam-nav">
          <button className="btn btn-ghost" onClick={() => setPhase("setup")}>Change Setup</button>
          <button className="btn btn-primary" onClick={start} disabled={loading}>
            {loading ? "Loading…" : "Retake (New Questions)"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- exam ----------
  const q = qs[i];
  return (
    <div className="exam-shell">
      <div className="exam-top">
        <span>{METHOD_NAMES[method]} · Level {"I".repeat(level)}</span>
        <span>Question {i + 1} / {qs.length}</span>
        {timer > 0 && (
          <span className={`exam-timer${secs <= 10 ? " warn" : ""}`}>
            00:{String(Math.max(secs, 0)).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="progress"><div style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div className="q-card">
        <div className="q-text">{q.question}</div>
        <div className="answers">
          {q.options.map((opt, idx) => {
            let cls = "ans";
            if (locked) {
              if (idx === q.correct) cls += " correct";
              else if (idx === picks[i]) cls += " wrong";
            }
            return (
              <button key={idx} className={cls} disabled={locked} onClick={() => lockIn(idx, i)}>
                <span className="key">{"ABCD"[idx]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="exam-nav">
        <button className="btn btn-ghost" onClick={() => { stopTimer(); setPhase("setup"); }}>Quit</button>
        <button className="btn btn-primary" disabled={!locked} onClick={next}>
          {i === qs.length - 1 ? "Finish Exam" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
