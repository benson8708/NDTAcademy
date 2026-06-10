"use client";
// One-question-at-a-time runner for module quizzes and level final exams.
// Records a quiz_attempts row at the end; on a passing FINAL it calls the
// finalizeLevel server action, which issues the certificate if the whole
// level is complete.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { finalizeLevel } from "@/app/learn/[slug]/exam/actions";
import type { QuizQuestion } from "@/lib/vtContent";

export default function QuizRunner({
  scope,
  scopeId,
  courseSlug,
  questions,
  passingScore,
  title,
}: {
  scope: "module" | "final";
  scopeId: string;
  courseSlug: string;
  questions: QuizQuestion[];
  passingScore: number;
  title: string;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  // Grading snapshot computed exactly once in finish() — the results screen
  // renders from this, never recomputed from live state.
  const [result, setResult] = useState<{ right: number; pct: number; picks: number[] } | null>(null);
  const [certMessage, setCertMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const q = questions[i];

  async function finish(finalPicks: number[]) {
    setSaving(true);
    const right = questions.reduce((n, qq, idx) => n + (finalPicks[idx] === qq.correct ? 1 : 0), 0);
    const score = Math.round((right / questions.length) * 100);
    const passed = score >= passingScore;
    setResult({ right, pct: score, picks: finalPicks });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          scope,
          scope_id: scopeId,
          total: questions.length,
          correct: right,
          score,
          passed,
          detail: { picks: finalPicks },
        });
      }
      if (scope === "final" && passed) {
        const result = await finalizeLevel(courseSlug, scopeId);
        if (result.certificateIssued) {
          setCertMessage(`Certificate issued — verification code ${result.verificationCode}. It's on your dashboard.`);
        } else if (result.reason) {
          setCertMessage(result.reason);
        }
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    const { right, pct } = result;
    const passed = pct >= passingScore;
    const missed = questions
      .map((qq, idx) => ({ qq, pick: result.picks[idx] }))
      .filter((x) => x.pick !== x.qq.correct);
    return (
      <div className="exam-shell">
        <div className="q-card">
          <div
            className="score-ring"
            style={{
              ["--pct" as string]: pct,
              ["--ring" as string]: passed ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)",
            }}
          >
            <div>
              <span className="pct">{pct}%</span>
              <span className="frac">{right} of {questions.length}</span>
            </div>
          </div>
          <div className={`verdict ${passed ? "pass" : "fail"}`}>
            {passed ? `${title} passed` : `Below ${passingScore}% — review and retake`}
          </div>
          {saving && <div className="saved-note">Recording attempt…</div>}
          {certMessage && <div className="form-ok" style={{ textAlign: "center" }}>{certMessage}</div>}
          {missed.length > 0 && (
            <div>
              <h3 style={{ margin: "10px 0 6px" }}>Review ({missed.length} missed)</h3>
              {missed.map(({ qq, pick }, idx) => (
                <div key={idx} className="review-item">
                  <div className="rq">{qq.question}</div>
                  {pick >= 0 ? (
                    <div className="ra bad">{"ABCD"[pick]}. {qq.options[pick]}</div>
                  ) : (
                    <div className="ra bad">No answer</div>
                  )}
                  <div className="ra good">{"ABCD"[qq.correct]}. {qq.options[qq.correct]}</div>
                  <div className="ib-feedback" style={{ marginTop: 6 }}>{qq.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="exam-nav">
          <a className="btn btn-ghost" href={`/learn/${courseSlug}`}>Back to Curriculum</a>
          <button className="btn btn-primary" onClick={() => { setI(0); setPicks([]); setLocked(false); setResult(null); setCertMessage(null); router.refresh(); }}>
            Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-shell">
      <div className="exam-top">
        <span>{title}</span>
        <span>Question {i + 1} / {questions.length}</span>
        <span>Pass: {passingScore}%</span>
      </div>
      <div className="progress"><div style={{ width: `${(i / questions.length) * 100}%` }} /></div>
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
              <button
                key={idx}
                className={cls}
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  const next = [...picks];
                  next[i] = idx;
                  setPicks(next);
                  setLocked(true);
                }}
              >
                <span className="key">{"ABCD"[idx]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        {locked && picks[i] !== q.correct && (
          <div className="ib-feedback" style={{ marginTop: 12 }}>{q.explanation}</div>
        )}
      </div>
      <div className="exam-nav">
        <a className="btn btn-ghost" href={`/learn/${courseSlug}`}>Quit</a>
        <button
          className="btn btn-primary"
          disabled={!locked}
          onClick={() => {
            if (i < questions.length - 1) {
              setI(i + 1);
              setLocked(false);
            } else {
              finish(picks);
            }
          }}
        >
          {i === questions.length - 1 ? "Finish" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
