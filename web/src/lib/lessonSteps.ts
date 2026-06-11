// Derives the full-screen lesson player's step sequence from authored lesson
// content. Pure data — usable from client and server. Every step carries its
// own gate so the player can enforce pacing:
//   video/explainer  -> must be watched to the end
//   concept/table    -> minimum dwell (reading time at ~210 wpm, clamped)
//   interactive/sim  -> must be completed
//   question         -> must be answered
import type { LessonContent, ContentSection, Interactive, Simulator, QuizQuestion } from "@/lib/vtContent";
import type { Lesson } from "@/lib/curriculum";

export type Step =
  | { kind: "intro"; title: string; minutes: number; objectives: string[]; hero: string | null; dwellSec: number }
  | { kind: "video"; title: string; src: string; poster: string | null }
  | { kind: "explainer"; title: string; src: string }
  | { kind: "concept"; heading: string; body: string; figure: { src: string; caption: string } | null; callout: { variant: string; title: string; body: string } | null; dwellSec: number }
  | { kind: "table"; caption: string; headers: string[]; rows: string[][]; dwellSec: number }
  | { kind: "interactive"; interactive: Interactive }
  | { kind: "simulator"; simulator: Simulator }
  | { kind: "quizIntro"; questionCount: number; passPct: number; dwellSec: number }
  | { kind: "question"; question: QuizQuestion; index: number; total: number }
  | { kind: "results" };

export interface ExplainerEntry { uuid: string; url: string; title: string; afterSection: number }

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
/** Reading dwell: ~210 wpm with floor/ceiling so screens are never skippable-instant. */
const readingDwell = (text: string, extra = 0) =>
  Math.min(Math.max(Math.round((words(text) / 210) * 60) + extra, 12), 75);

export function buildSteps(opts: {
  lesson: Lesson;
  content: LessonContent;
  heroUrl: string | null;
  videoUrl: string | null;
  explainers: ExplainerEntry[];
  figureBase: string; // e.g. /content/vt/figures
}): Step[] {
  const { lesson, content, heroUrl, videoUrl, explainers, figureBase } = opts;
  const steps: Step[] = [];
  const figureById = new Map(content.figures.map((f) => [f.id, f]));

  steps.push({
    kind: "intro",
    title: content.title,
    minutes: lesson.minutes,
    objectives: lesson.objectives,
    hero: heroUrl,
    dwellSec: 8,
  });

  // The AI explainer is the lesson's lead video — a full glassmorphism overview
  // of the lesson. It replaces the old slideshow teaching video; we only fall
  // back to that legacy video when no explainer has been produced for a lesson.
  if (explainers.length > 0) {
    for (const e of explainers) {
      steps.push({ kind: "explainer", title: e.title, src: e.url });
    }
  } else if (videoUrl) {
    steps.push({ kind: "video", title: `Watch: ${content.title}`, src: videoUrl, poster: heroUrl });
  }

  // Concept slides: pair each text section with an adjacent figure/callout so
  // every screen is one focused idea, not a wall.
  const sections = content.sections;
  const used = new Set<number>();
  // Explainers now lead the lesson (above), so they are no longer spliced
  // mid-lesson by section anchor.
  const pushExplainers = (_idx: number) => {};

  for (let i = 0; i < sections.length; i++) {
    if (used.has(i)) {
      // section was folded into the previous concept slide, but an explainer
      // anchored to it must still play
      pushExplainers(i);
      continue;
    }
    const s = sections[i];
    if (s.type === "text") {
      // look ahead for a figure or callout to pair with
      let figure: { src: string; caption: string } | null = null;
      let callout: { variant: string; title: string; body: string } | null = null;
      const nxt: ContentSection | undefined = sections[i + 1];
      if (nxt?.type === "figure" && nxt.figureId && figureById.has(nxt.figureId)) {
        figure = { src: `${figureBase}/${figureById.get(nxt.figureId)!.file}`, caption: nxt.caption ?? "" };
        used.add(i + 1);
      } else if (nxt?.type === "callout") {
        callout = { variant: nxt.variant ?? "standard", title: nxt.title ?? "", body: nxt.body ?? "" };
        used.add(i + 1);
      }
      steps.push({
        kind: "concept",
        heading: s.heading ?? "",
        body: s.body ?? "",
        figure,
        callout,
        dwellSec: readingDwell((s.body ?? "") + (callout?.body ?? ""), figure ? 4 : 0),
      });
    } else if (s.type === "figure" && s.figureId && figureById.has(s.figureId)) {
      steps.push({
        kind: "concept",
        heading: figureById.get(s.figureId)!.title,
        body: s.caption ?? "",
        figure: { src: `${figureBase}/${figureById.get(s.figureId)!.file}`, caption: s.caption ?? "" },
        callout: null,
        dwellSec: 14,
      });
    } else if (s.type === "callout") {
      steps.push({
        kind: "concept",
        heading: s.title ?? "Key point",
        body: s.body ?? "",
        figure: null,
        callout: { variant: s.variant ?? "standard", title: s.title ?? "", body: s.body ?? "" },
        dwellSec: readingDwell(s.body ?? ""),
      });
    } else if (s.type === "table") {
      steps.push({
        kind: "table",
        caption: s.caption ?? "",
        headers: s.headers ?? [],
        rows: s.rows ?? [],
        dwellSec: Math.min(12 + (s.rows?.length ?? 0) * 4, 60),
      });
    }
    pushExplainers(i);
  }

  if (content.interactive) steps.push({ kind: "interactive", interactive: content.interactive });
  if (content.simulator) steps.push({ kind: "simulator", simulator: content.simulator });

  if (content.checkQuestions.length > 0) {
    steps.push({
      kind: "quizIntro",
      questionCount: content.checkQuestions.length,
      passPct: 80,
      dwellSec: 5,
    });
    content.checkQuestions.forEach((q, i) =>
      steps.push({ kind: "question", question: q, index: i, total: content.checkQuestions.length }),
    );
  }
  steps.push({ kind: "results" });
  return steps;
}
