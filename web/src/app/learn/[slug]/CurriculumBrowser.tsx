"use client";
// Level tabs + module accordion for the authenticated course view.
import { useState } from "react";
import Link from "next/link";

interface SlimLesson { id: string; title: string; minutes: number; media: string[] }
interface SlimModule {
  id: string; title: string; cpSection: string; hours: number;
  moduleQuiz: { questions: number; passingScore: number } | null;
  lessons: SlimLesson[];
}
interface SlimLevel {
  level: string; targetHours: number; description: string;
  finalExam: { questions: number; passingScore: number; bank?: string; bankLevel?: number } | null;
  modules: SlimModule[];
}

const fmtH = (m: number) => {
  const h = m / 60;
  return Number.isInteger(h) ? String(h) : h.toFixed(2).replace(/\.?0+$/, "");
};

export default function CurriculumBrowser({
  slug, levels, doneIds, passedScopeIds = [], courseId, levelHours = {},
}: {
  slug: string; levels: SlimLevel[]; doneIds: string[]; passedScopeIds?: string[];
  courseId: string; levelHours?: Record<string, number>;
}) {
  const passed = new Set(passedScopeIds);
  const [levelIdx, setLevelIdx] = useState(0);
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(levels[0]?.modules[0] ? [levels[0].modules[0].id] : []),
  );
  const done = new Set(doneIds);
  const L = levels[levelIdx];

  let totalMin = 0, doneMin = 0;
  L.modules.forEach((m) => m.lessons.forEach((l) => {
    totalMin += l.minutes;
    if (done.has(l.id)) doneMin += l.minutes;
  }));

  const toggleModule = (id: string) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <div className="level-tabs">
        {levels.map((l, i) => (
          <button
            key={l.level}
            className={`level-tab${i === levelIdx ? " sel" : ""}`}
            onClick={() => {
              setLevelIdx(i);
              setOpenModules(new Set(levels[i].modules[0] ? [levels[i].modules[0].id] : []));
            }}
          >
            {l.level === "I" || l.level === "II" || l.level === "III" ? `Level ${l.level}` : l.level}
          </button>
        ))}
      </div>
      <div className="level-meta">
        <p className="desc">{L.description}</p>
        <div className="level-progress">
          <div className="lbl">
            <span>Progress</span>
            <span>{fmtH(doneMin)} / {fmtH(totalMin)} h</span>
          </div>
          <div className="progress">
            <div style={{ width: totalMin ? `${(doneMin / totalMin) * 100}%` : "0%" }} />
          </div>
        </div>
      </div>

      {L.modules.map((m, mi) => (
        <div key={m.id} className={`module${openModules.has(m.id) ? " open" : ""}`}>
          <button type="button" className="module-head" onClick={() => toggleModule(m.id)}>
            <span className="m-num">{String(mi + 1).padStart(2, "0")}</span>
            <h3>{m.title}</h3>
            <span className="m-meta">{m.lessons.length} lessons · {m.hours} h</span>
            <span className="chev"></span>
          </button>
          <div className="module-body">
            {m.cpSection && <div className="cp-ref">{m.cpSection}</div>}
            {m.lessons.map((l) => (
              <Link key={l.id} className={`lesson-row${done.has(l.id) ? " done" : ""}`} href={`/learn/${slug}/${l.id}`}>
                <span className="dot"></span>
                <span className="l-title">{l.title}</span>
                <span className="l-meta">
                  {l.media.map((t) => <span key={t} className={`mtag ${t}`}>{t}</span>)}
                </span>
                <span className="min">{l.minutes} min</span>
              </Link>
            ))}
            {m.moduleQuiz && (
              <div className="quiz-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span>
                  MODULE QUIZ — {m.moduleQuiz.questions} questions · {m.moduleQuiz.passingScore}% to pass
                  {passed.has(m.id) && <span className="badge ok" style={{ marginLeft: 10 }}>Passed</span>}
                </span>
                <Link className="btn btn-primary btn-sm" href={`/learn/${slug}/quiz/${m.id}`}>
                  {passed.has(m.id) ? "Retake Quiz" : "Take Quiz"}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
      {L.finalExam && (
        <div className="module open">
          <div className="quiz-row" style={{ borderTop: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span>
              FINAL EXAM — {L.finalExam.questions} questions · {L.finalExam.passingScore}% to pass ·
              certificate requires all lessons + {L.targetHours} h logged
              ({(levelHours[`${courseId}-${L.level}`] ?? 0).toFixed(1)} h so far) + passing final
              {passed.has(`${courseId}-${L.level}`) && <span className="badge ok" style={{ marginLeft: 10 }}>Passed</span>}
            </span>
            <Link className="btn btn-primary btn-sm" href={`/learn/${slug}/exam/${courseId}-${L.level}`}>
              {passed.has(`${courseId}-${L.level}`) ? "Retake Final" : "Take Final Exam"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
