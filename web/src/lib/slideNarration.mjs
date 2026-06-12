// Shared slide-narration text + key derivation, used by BOTH the player
// (to look up a slide's pre-rendered Titan audio) and the generator (to
// produce it). Keeping this single source of truth guarantees the keys match.

export const stripMd = (s) => (s || "").replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim();

// Stable content hash for a spoken string (djb2 -> base36). Identical output
// in Node and the browser.
export function djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// The exact text spoken on a given player Step (null when a step isn't narrated).
export function narrationText(step) {
  switch (step.kind) {
    case "intro":
      return [step.title, ...(step.objectives || [])].filter(Boolean).join(". ");
    case "concept": {
      const parts = [step.heading, stripMd(step.body)];
      const cb = step.callout ? stripMd(step.callout.body) : "";
      if (cb && cb !== stripMd(step.body)) parts.push(cb);
      return parts.filter(Boolean).join(". ");
    }
    case "table":
      return [step.caption || "Reference table", (step.headers && step.headers.length) ? `Columns: ${step.headers.join(", ")}` : ""].filter(Boolean).join(". ");
    case "quizIntro":
      return `Knowledge check. ${step.questionCount} questions, ${step.passPct} percent to pass.`;
    case "question":
      return step.question.question;
    case "trainer": {
      const c = step.config || {};
      return [c.title, c.intro].filter(Boolean).join(". ");
    }
    default:
      return null;
  }
}

export function narrationKey(step) {
  const t = narrationText(step);
  return t ? djb2(t) : null;
}
