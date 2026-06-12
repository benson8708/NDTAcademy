"use client";
// Full-screen, stepped lesson player. One idea per screen, hard pacing gates
// (watch-to-finish video, reading dwell timers, must-complete interactions),
// a polished one-question-at-a-time knowledge check, and light gamification
// (XP, streaks, stars). Completing the final question at >=80% records the
// check attempt and marks the lesson complete automatically.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MarkdownLite } from "@/lib/markdownLite";
import InteractiveBlock from "@/components/lesson/InteractiveBlock";
import Trainer3D from "@/components/trainer3d/Trainer3D";
import type { TrainerConfig } from "@/components/trainer3d/contract";
import SimulatorBlock from "@/components/lesson/SimulatorBlock";
import type { Step } from "@/lib/lessonSteps";
import { narrationText, narrationKey } from "@/lib/slideNarration";

const PASS_PCT = 80;

export default function LessonPlayer({
  steps,
  lessonId,
  courseId,
  courseSlug,
  nextLessonId,
  alreadyPassed,
  figureFileById,
  slideAudio,
}: {
  steps: Step[];
  lessonId: string;
  courseId: string;
  courseSlug: string;
  nextLessonId: string | null;
  alreadyPassed: boolean;
  figureFileById: Record<string, string>;
  slideAudio?: Record<string, string>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [dwellLeft, setDwellLeft] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [xpPop, setXpPop] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const stepStarted = useRef<number>(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechOn = typeof window !== "undefined" && "speechSynthesis" in window;
  const audioFor = useCallback(
    (s: Step) => { const k = narrationKey(s); return k ? slideAudio?.[k] ?? null : null; },
    [slideAudio],
  );

  const step = steps[idx];
  const questionSteps = useMemo(() => steps.filter((s) => s.kind === "question").length, [steps]);
  const firstQuestionIdx = useMemo(() => steps.findIndex((s) => s.kind === "question"), [steps]);
  const correctCount = useMemo(
    () =>
      steps.reduce(
        (n, s) => (s.kind === "question" && answers[s.index] === s.question.correct ? n + 1 : n),
        0,
      ),
    [steps, answers],
  );

  const award = useCallback((amount: number, label: string) => {
    setXp((x) => x + amount);
    setXpPop(`+${amount} XP · ${label}`);
    setTimeout(() => setXpPop(null), 1400);
  }, []);

  // ----- voiceover (browser speech synthesis) -----
  useEffect(() => {
    try { setMuted(localStorage.getItem("lp-muted") === "1"); } catch {}
  }, []);
  useEffect(() => {
    if (!speechOn) return;
    const pick = () => {
      const vs = window.speechSynthesis.getVoices();
      voiceRef.current =
        vs.find((v) => /Google US English/i.test(v.name)) ||
        vs.find((v) => v.lang === "en-US" && /natural|neural|premium|enhanced/i.test(v.name)) ||
        vs.find((v) => v.lang === "en-US") ||
        vs.find((v) => v.lang?.startsWith("en")) ||
        vs[0] ||
        null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch {} };
  }, [speechOn]);

  const cancelSpeech = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch {}
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    setNarrating(false);
  }, []);
  // Play the slide's pre-rendered Titan audio; fall back to browser speech on error/block.
  const playTitan = useCallback((url: string, text: string, onDone: () => void) => {
    try {
      const a = new Audio(url);
      a.preload = "auto";
      if (muted) a.muted = true;
      audioRef.current = a;
      let fired = false;
      const fin = () => { if (!fired) { fired = true; setNarrating(false); onDone(); } };
      a.onended = fin;
      a.onerror = () => { a.onended = null; setNarrating(false); speak(text, onDone); };
      setNarrating(true);
      a.play().catch(() => { a.onended = null; setNarrating(false); speak(text, onDone); });
    } catch { setNarrating(false); speak(text, onDone); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);
  const speak = useCallback((text: string, onDone: () => void) => {
    if (!speechOn || !text) { onDone(); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 0.98; u.pitch = 1;
      let fired = false;
      const fin = () => { if (!fired) { fired = true; setNarrating(false); onDone(); } };
      u.onend = fin; u.onerror = fin;
      setNarrating(true);
      window.speechSynthesis.speak(u);
    } catch { setNarrating(false); onDone(); }
  }, [speechOn]);
  const toggleMute = () => setMuted((m) => {
    const nv = !m;
    try { localStorage.setItem("lp-muted", nv ? "1" : "0"); } catch {}
    if (nv) cancelSpeech();
    return nv;
  });

  // cancel any speech when the player closes / unmounts
  useEffect(() => { if (!open) cancelSpeech(); }, [open, cancelSpeech]);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch {} }, []);

  // ----- per-step gate management -----
  useEffect(() => {
    if (!open) return;
    stepStarted.current = Date.now();
    const textGated =
      step.kind === "intro" || step.kind === "concept" || step.kind === "table" || step.kind === "quizIntro";
    const text = narrationText(step);

    if (textGated) {
      setUnlocked(false);
      // Narrate the slide; Continue unlocks when the voiceover finishes.
      // Prefer the pre-rendered Titan audio; fall back to the browser voice.
      const url = (!muted && text) ? audioFor(step) : null;
      if (url && text) {
        const safety = setTimeout(() => setUnlocked(true), 180000); // unlock if 'ended' never fires
        playTitan(url, text, () => { setUnlocked(true); clearTimeout(safety); });
        return () => { cancelSpeech(); clearTimeout(safety); };
      }
      if (speechOn && !muted && text) {
        const estMs = Math.min(Math.max((text.length / 14) * 1000, 4000), 90000) + 6000;
        const safety = setTimeout(() => setUnlocked(true), estMs); // unlock if onend never fires
        speak(text, () => { setUnlocked(true); clearTimeout(safety); });
        return () => { cancelSpeech(); clearTimeout(safety); };
      }
      // fallback (muted or no audio/speech support): silent reading-time dwell
      const dwell = step.dwellSec;
      setDwellLeft(dwell);
      const t = setInterval(() => {
        const left = Math.ceil(dwell - (Date.now() - stepStarted.current) / 1000);
        setDwellLeft(Math.max(left, 0));
        if (left <= 0) { setUnlocked(true); clearInterval(t); }
      }, 250);
      return () => clearInterval(t);
    }

    if (step.kind === "results") {
      setUnlocked(true);
    } else {
      // video / explainer / interactive / simulator / question lock until done
      setUnlocked(false);
    }
    // questions + trainer intros are read aloud too (gates stay action-based)
    if ((step.kind === "question" || step.kind === "trainer") && !muted && text) {
      const url = audioFor(step);
      if (url) { playTitan(url, text, () => {}); return () => cancelSpeech(); }
      if (speechOn) { speak(text, () => {}); return () => cancelSpeech(); }
    }
  }, [idx, open, step, muted, speechOn, speak, cancelSpeech, audioFor, playTitan]);

  // keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && unlocked) next();
      if (e.key === "ArrowLeft") back();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, unlocked, idx]);

  // lock page scroll while open
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
  }, [open]);

  function next() {
    if (idx < steps.length - 1) {
      if (step.kind !== "question" && step.kind !== "results") award(10, "step complete");
      setIdx(idx + 1);
    }
  }
  function back() {
    if (idx > 0) setIdx(idx - 1);
  }

  async function recordPass() {
    if (recorded) return;
    setRecorded(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const pct = questionSteps === 0 ? 100 : Math.round((correctCount / questionSteps) * 100);
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        scope: "check",
        scope_id: lessonId,
        total: questionSteps,
        correct: correctCount,
        score: pct,
        passed: pct >= PASS_PCT,
        detail: { player: "v2", xp, bestStreak },
      });
      if (pct >= PASS_PCT) {
        await supabase
          .from("lesson_progress")
          .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
      }
      router.refresh();
    } catch {
      /* surface-level gamification shouldn't block the lesson */
    }
  }

  function retryQuiz() {
    setAnswers({});
    setRecorded(false);
    setIdx(firstQuestionIdx >= 0 ? Math.max(firstQuestionIdx - 1, 0) : 0);
  }

  const progressPct = Math.round((idx / Math.max(steps.length - 1, 1)) * 100);

  if (!open) {
    return (
      <div className="lp-launch card feature" style={{ borderTopColor: "var(--blue)" }}>
        <span className="code">Interactive Lesson</span>
        <h3>{steps[0].kind === "intro" ? steps[0].title : "Start lesson"}</h3>
        <p>
          {steps.length} guided steps · videos, concepts, hands-on practice, and a knowledge
          check. Pacing is enforced — every step must be completed, and your engaged time logs
          toward your formal training hours.
        </p>
        <p style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={() => { setOpen(true); setIdx(0); }}>
            {alreadyPassed ? "Replay Lesson" : "Start Lesson"}
          </button>
          {alreadyPassed && <span className="badge ok">Knowledge check passed</span>}
        </p>
      </div>
    );
  }

  return (
    <div className="lesson-player" role="dialog" aria-label="Lesson player">
      {/* header */}
      <div className="lp-head">
        <button className="lp-exit" onClick={() => setOpen(false)} aria-label="Exit lesson">✕ Exit</button>
        <div className="lp-progress"><div style={{ width: `${progressPct}%` }} /></div>
        <div className="lp-meta">
          {speechOn && (
            <>
              <button
                className="lp-exit"
                onClick={() => {
                  const t = narrationText(step); if (!t) return;
                  const url = audioFor(step);
                  if (url) playTitan(url, t, () => setUnlocked(true));
                  else speak(t, () => setUnlocked(true));
                }}
                aria-label="Replay narration"
                title="Replay narration"
              >↻ Replay</button>
              <button
                className="lp-exit"
                onClick={toggleMute}
                aria-label={muted ? "Unmute narration" : "Mute narration"}
                title={muted ? "Unmute narration" : "Mute narration"}
              >{muted ? "🔇" : "🔊"}</button>
            </>
          )}
          <span className="lp-step">{idx + 1} / {steps.length}</span>
          <span className="lp-xp">⚡ {xp} XP</span>
        </div>
        {xpPop && <div className="lp-xp-pop">{xpPop}</div>}
      </div>

      {/* stage */}
      <div className="lp-stage" key={idx}>
        {step.kind === "intro" && (
          <div className="lp-slide lp-intro">
            {step.hero && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className="lp-hero" src={step.hero} alt="" />
            )}
            <div className="lp-intro-body">
              <span className="kicker">Lesson · {step.minutes} min of formal training</span>
              <h1>{step.title}</h1>
              <ul className="lp-objectives">
                {step.objectives.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </div>
          </div>
        )}

        {(step.kind === "video" || step.kind === "explainer") && (
          <GatedVideo
            key={step.src}
            title={step.title}
            src={step.src}
            poster={step.kind === "video" ? step.poster : null}
            onWatched={() => setUnlocked(true)}
          />
        )}

        {step.kind === "concept" && (
          <div className={`lp-slide lp-concept${step.figure ? " has-figure" : ""}`}>
            <div className="lp-concept-text">
              {step.heading && <h2>{step.heading}</h2>}
              <div className="lp-body"><MarkdownLite text={step.body} /></div>
              {step.callout && (
                <aside className={`lc-callout ${step.callout.variant}`}>
                  {step.callout.title && <div className="lc-callout-title">{step.callout.title}</div>}
                  <MarkdownLite text={step.callout.body} />
                </aside>
              )}
            </div>
            {step.figure && (
              <figure className="lp-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={step.figure.src} alt={step.heading} />
                {step.figure.caption && <figcaption>{step.figure.caption}</figcaption>}
              </figure>
            )}
          </div>
        )}

        {step.kind === "table" && (
          <div className="lp-slide">
            <h2>{step.caption || "Reference"}</h2>
            <div className="lc-table" style={{ marginTop: 18 }}>
              <table className="data">
                <thead><tr>{step.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                <tbody>
                  {step.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step.kind === "trainer" && (
          <div className="lp-slide lp-wide">
            <Trainer3D
              config={step.config as unknown as TrainerConfig}
              onComplete={() => { setUnlocked(true); award(30, "3-D task complete"); }}
            />
          </div>
        )}

        {step.kind === "interactive" && (
          <div className="lp-slide lp-wide">
            <InteractiveBlock
              courseId={courseId}
              interactive={step.interactive}
              figureFileById={figureFileById}
              onComplete={() => { setUnlocked(true); award(25, "exercise complete"); }}
            />
          </div>
        )}

        {step.kind === "simulator" && (
          <div className="lp-slide lp-wide">
            <SimulatorBlock
              sim={step.simulator}
              courseId={courseId}
              onComplete={() => { setUnlocked(true); award(30, "simulation complete"); }}
            />
          </div>
        )}

        {step.kind === "quizIntro" && (
          <div className="lp-slide lp-quiz-intro">
            <div className="lp-badge-ring">🛡️</div>
            <h2>Knowledge Check</h2>
            <p className="lede" style={{ margin: "12px auto 0", textAlign: "center" }}>
              {step.questionCount} questions · {step.passPct}% to pass · correct answers build a
              streak for bonus XP. Pass it and this lesson is logged to your training record.
            </p>
          </div>
        )}

        {step.kind === "question" && (
          <QuestionSlide
            key={step.index}
            step={step}
            picked={answers[step.index]}
            streak={streak}
            onAnswer={(choice) => {
              setAnswers((a) => ({ ...a, [step.index]: choice }));
              if (choice === step.question.correct) {
                const bonus = streak >= 1 ? 10 : 0;
                setStreak((s) => {
                  const ns = s + 1;
                  setBestStreak((b) => Math.max(b, ns));
                  return ns;
                });
                award(20 + bonus, bonus ? `correct · streak x${streak + 1}` : "correct");
              } else {
                setStreak(0);
              }
              setUnlocked(true);
            }}
          />
        )}

        {step.kind === "results" && (
          <ResultsSlide
            correct={correctCount}
            total={questionSteps}
            xp={xp}
            bestStreak={bestStreak}
            recordPass={recordPass}
            onRetry={retryQuiz}
            onExit={() => { setOpen(false); router.refresh(); }}
            nextHref={nextLessonId ? `/learn/${courseSlug}/${nextLessonId}` : `/learn/${courseSlug}`}
          />
        )}
      </div>

      {/* footer nav */}
      {step.kind !== "results" && (
        <div className="lp-foot">
          <button className="btn btn-ghost btn-sm lp-back" onClick={back} disabled={idx === 0}>
            ← Back
          </button>
          <div className="lp-dots" aria-hidden="true">
            {steps.map((s, i) => (
              <span key={i} className={`lp-dot${i === idx ? " cur" : ""}${i < idx ? " done" : ""}`} />
            ))}
          </div>
          <button className={`btn btn-primary lp-next${unlocked ? "" : " locked"}`} onClick={next} disabled={!unlocked}>
            {unlocked
              ? idx === steps.length - 2 ? "Finish" : "Continue →"
              : step.kind === "video" || step.kind === "explainer"
                ? "Watch to continue"
                : step.kind === "interactive" || step.kind === "simulator" || step.kind === "trainer"
                  ? "Complete to continue"
                  : step.kind === "question"
                    ? "Answer to continue"
                    : !muted && (audioFor(step) || speechOn)
                      ? "Narration playing…"
                      : `Continue in ${dwellLeft}s`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- gated video: must actually watch it ---------- */
function GatedVideo({
  title, src, poster, onWatched,
}: { title: string; src: string; poster: string | null; onWatched: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const maxPlayed = useRef(0);
  const [done, setDone] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Autoplay when the step opens. The learner reached here via a click
  // ("Start Lesson" / "Continue"), so playing with sound is allowed in-session;
  // if the browser still blocks it, surface a tap-to-play prompt.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  }, [src]);

  return (
    <div className="lp-slide lp-video">
      <h2>{title}</h2>
      <div className="lp-video-frame">
        <video
          ref={ref}
          autoPlay
          controls
          controlsList="nodownload"
          playsInline
          poster={poster ?? undefined}
          src={src}
          onPlay={() => setBlocked(false)}
          onRateChange={(e) => {
            // pacing gate: speed-watching would undercut logged training time
            const v = e.currentTarget;
            if (v.playbackRate > 1) v.playbackRate = 1;
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            // anti-skip: scrubbing ahead snaps back to the furthest watched point
            if (v.currentTime > maxPlayed.current + 2) {
              v.currentTime = maxPlayed.current;
              return;
            }
            maxPlayed.current = Math.max(maxPlayed.current, v.currentTime);
            if (!done && v.duration > 0 && maxPlayed.current >= v.duration * 0.97) {
              setDone(true);
              onWatched();
            }
          }}
          onEnded={() => { if (!done) { setDone(true); onWatched(); } }}
        />
      </div>
      <p className="lp-hint">
        {done
          ? "✓ Watched — continue when ready"
          : blocked
            ? "▶ Tap the video to start — watch it fully to unlock the next step"
            : "Watch the full video to unlock the next step (skipping ahead is disabled)"}
      </p>
    </div>
  );
}

/* ---------- polished single-question slide ---------- */
function QuestionSlide({
  step, picked, streak, onAnswer,
}: {
  step: Extract<Step, { kind: "question" }>;
  picked: number | undefined;
  streak: number;
  onAnswer: (choice: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(picked ?? null);
  const answered = picked !== undefined;
  const q = step.question;

  return (
    <div className="lp-slide lp-question">
      <div className="lp-q-meta">
        <span>Question {step.index + 1} of {step.total}</span>
        {streak >= 2 && <span className="lp-streak">🔥 {streak} streak</span>}
      </div>
      <h2 className="lp-q-text">{q.question}</h2>
      <div className="lp-options">
        {q.options.map((opt, i) => {
          let cls = "lp-option";
          if (answered) {
            if (i === q.correct) cls += " correct";
            else if (i === picked) cls += " wrong";
            else cls += " dim";
          } else if (selected === i) cls += " sel";
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => setSelected(i)}>
              <span className="lp-key">{"ABCD"[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {!answered ? (
        <button
          className="btn btn-primary lp-check"
          disabled={selected === null}
          onClick={() => selected !== null && onAnswer(selected)}
        >
          Check Answer
        </button>
      ) : (
        <div className={`lp-feedback${picked === q.correct ? " good" : " bad"}`}>
          <strong>{picked === q.correct ? "Correct!" : "Not quite."}</strong> {q.explanation}
        </div>
      )}
    </div>
  );
}

/* ---------- results + celebration ---------- */
function ResultsSlide({
  correct, total, xp, bestStreak, recordPass, onRetry, onExit, nextHref,
}: {
  correct: number; total: number; xp: number; bestStreak: number;
  recordPass: () => void; onRetry: () => void; onExit: () => void; nextHref: string;
}) {
  // A lesson with no check questions passes by reaching the end.
  const pct = total === 0 ? 100 : Math.round((correct / total) * 100);
  const passed = pct >= PASS_PCT;
  const stars = pct === 100 ? 3 : passed ? 2 : pct >= 60 ? 1 : 0;

  useEffect(() => {
    if (passed) recordPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lp-slide lp-results">
      {passed && (
        <div className="lp-confetti" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>
      )}
      <div className="lp-stars" aria-label={`${stars} of 3 stars`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`lp-star${i < stars ? " lit" : ""}`} style={{ animationDelay: `${i * 200}ms` }}>★</span>
        ))}
      </div>
      <h2>{passed ? "Lesson complete!" : "So close — run it back"}</h2>
      <p className="lp-results-line">
        {correct} / {total} correct ({pct}%) · ⚡ {xp} XP{bestStreak >= 2 ? ` · best streak ${bestStreak}` : ""}
      </p>
      <p className="lp-results-sub">
        {passed
          ? "Knowledge check passed and logged — this lesson now counts toward your training record."
          : `You need ${PASS_PCT}% to log this lesson. Review the misses above and retake the check.`}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
        {passed ? (
          <>
            <a className="btn btn-primary" href={nextHref}>Next Lesson →</a>
            <button className="btn btn-ghost" onClick={onExit}>Back to Page</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onRetry}>Retake Check</button>
            <button className="btn btn-ghost" onClick={onExit}>Exit</button>
          </>
        )}
      </div>
    </div>
  );
}
