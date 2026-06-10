"use client";
// End-of-lesson knowledge check. Passing (>=80%) records a quiz_attempts row,
// which is what unlocks "Mark Lesson Complete" — the lesson page re-reads the
// attempt server-side on refresh.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QuizQuestion } from "@/lib/vtContent";

const PASS = 80;

export default function KnowledgeCheck({
  lessonId,
  questions,
  alreadyPassed,
}: {
  lessonId: string;
  questions: QuizQuestion[];
  alreadyPassed: boolean;
}) {
  const router = useRouter();
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passedNow, setPassedNow] = useState(false);

  const allAnswered = questions.every((_, i) => picks[i] !== undefined);
  const correct = questions.filter((q, i) => picks[i] === q.correct).length;
  const pct = Math.round((correct / questions.length) * 100);

  async function grade() {
    setGraded(true);
    setSaving(true);
    const passed = pct >= PASS;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          scope: "check",
          scope_id: lessonId,
          total: questions.length,
          correct,
          score: pct,
          passed,
          detail: { picks: questions.map((_, i) => picks[i] ?? -1) },
        });
      }
      if (passed) {
        setPassedNow(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function retry() {
    setPicks({});
    setGraded(false);
  }

  return (
    <div className="kc-block" id="knowledge-check">
      <div className="kc-head">
        <span className="mtag interactive" style={{ background: "#FCF3E3", color: "#B27516" }}>knowledge check</span>
        <span className="t">Pass {PASS}% to log this lesson</span>
        {(alreadyPassed || passedNow) && <span className="badge ok">Passed</span>}
      </div>
      {questions.map((q, qi) => (
        <div key={qi} className="kc-q">
          <div className="q-text" style={{ fontSize: "1.05rem", marginBottom: 12 }}>
            {qi + 1}. {q.question}
          </div>
          <div className="answers">
            {q.options.map((opt, oi) => {
              let cls = "ans";
              if (graded) {
                if (oi === q.correct) cls += " correct";
                else if (picks[qi] === oi) cls += " wrong";
              } else if (picks[qi] === oi) cls += " sel";
              return (
                <button
                  key={oi}
                  className={cls}
                  disabled={graded}
                  onClick={() => setPicks((prev) => ({ ...prev, [qi]: oi }))}
                >
                  <span className="key">{"ABCD"[oi]}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {graded && picks[qi] !== q.correct && (
            <div className="ib-feedback">{q.explanation}</div>
          )}
        </div>
      ))}
      {!graded ? (
        <button className="btn btn-primary" disabled={!allAnswered || saving} onClick={grade}>
          Submit Knowledge Check
        </button>
      ) : (
        <div className={pct >= PASS ? "form-ok" : "form-error"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>
            {correct} / {questions.length} ({pct}%) — {pct >= PASS ? "passed. You can mark this lesson complete." : `below ${PASS}%. Review the material and try again.`}
          </span>
          {pct < PASS && (
            <button className="btn btn-ghost btn-sm" onClick={retry}>Try Again</button>
          )}
        </div>
      )}
    </div>
  );
}
