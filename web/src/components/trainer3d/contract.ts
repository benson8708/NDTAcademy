// Trainer3D contract — the interface every method engine implements and every
// per-lesson config conforms to. Engines are three.js mini-apps that let the
// student PERFORM a sample task that teaches the method's theory; the lesson
// player gates Continue on all tasks completing.
//
// Engines live in ./engines/<engine>.ts and export default mount().
// Per-lesson configs live in src/data/content/<courseId>/trainers.json:
//   { "<lessonId>": TrainerConfig, ... }

export type EngineId = "ut" | "mt" | "et" | "rt" | "pt" | "rs";

export interface TrainerTask {
  id: string;            // engine-reported completion key
  label: string;         // shown in the checklist (player UI)
  hint?: string;         // revealed after 45s stuck (player UI)
}

export interface TrainerConfig {
  engine: EngineId;
  mode: string;          // engine-specific (validated against engine's MODES)
  title: string;         // "Hands-on: find the flaw with the angle beam"
  intro: string;         // 1-2 sentences telling the student what to do
  params?: Record<string, unknown>; // engine/mode-specific tuning (see engine docs)
  tasks: TrainerTask[];  // 2-4 tasks; ALL must complete to unlock Continue
}

export interface TrainerCtx {
  // Engine calls these; the player owns the checklist UI + gating.
  onTaskDone(id: string): void;   // idempotent per id
  onAllDone(): void;              // optional convenience; player also tracks ids
  reducedMotion: boolean;         // true -> no idle animation; interactions still work
  width: number;                  // initial container size (engine should also observe resizes)
  height: number;
}

export interface TrainerHandle {
  dispose(): void;                // MUST free GL context, listeners, RAF
}

export type TrainerMount = (
  container: HTMLElement,
  config: TrainerConfig,
  ctx: TrainerCtx,
) => TrainerHandle;

// Engine self-description for validation + config authoring.
export interface EngineManifest {
  engine: EngineId;
  modes: Record<string, {
    description: string;
    params: Record<string, string>;   // param -> human description w/ ranges
    taskIds: string[];                // task ids this mode can emit
  }>;
}
