// Loader for authored lesson content (any course). Files live in
// src/data/content/<courseId>/ and are read with fs at request time so the app
// builds and runs even while content is still being authored
// (missing lesson -> null -> placeholder UI).
import "server-only";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { courseById, levelLessonIds, type CourseLevel } from "@/lib/curriculum";

export interface ContentSection {
  type: "text" | "callout" | "figure" | "table";
  heading?: string;
  body?: string;
  variant?: "key" | "standard" | "safety";
  title?: string;
  figureId?: string;
  caption?: string;
  headers?: string[];
  rows?: string[][];
}
export interface ContentFigure { id: string; title: string; file: string }
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
export type Interactive =
  | { type: "scenario"; title: string; intro: string; steps: { prompt: string; options: string[]; correct: number; feedback: string }[] }
  | { type: "hotspot"; title: string; intro: string; figureId: string; regions: { x: number; y: number; w: number; h: number; label: string; isTarget: boolean; feedback: string }[] }
  | { type: "sort"; title: string; intro: string; buckets: string[]; items: { label: string; bucket: number; why: string }[] }
  | { type: "calculator"; preset: "lighting"; title: string; intro: string };

export interface SimTarget { x: number; y: number; label: string; feedback: string }
export interface Simulator {
  type: "borescope" | "lighting";
  title: string;
  intro: string;
  scene: string;
  targets: SimTarget[];
  minLux?: number;
}

export interface LessonContent {
  lessonId: string;
  title: string;
  narrationScript: string;
  sections: ContentSection[];
  figures: ContentFigure[];
  interactive: Interactive | null;
  simulator?: Simulator | null;
  checkQuestions: QuizQuestion[];
  references: string[];
}
export interface ModuleQuiz { moduleId: string; questions: QuizQuestion[] }

const contentDir = (courseId: string) =>
  path.join(process.cwd(), "src", "data", "content", courseId);

async function readJson<T>(courseId: string, file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(contentDir(courseId), file), "utf8")) as T;
  } catch {
    return null;
  }
}

export const loadLessonContent = (courseId: string, lessonId: string) =>
  readJson<LessonContent>(courseId, `${lessonId}.json`);

export const loadModuleQuiz = (courseId: string, moduleId: string) =>
  readJson<ModuleQuiz>(courseId, `quiz-${moduleId}.json`);

/**
 * Final-exam pool for a level = every lesson check question + every module
 * quiz question in that level. With 5 checks/lesson and 10 per module quiz,
 * Level I yields 75 questions and Level II 165 — the 50-question final draws
 * randomly from the pool so retakes differ.
 */
export async function loadFinalPool(courseId: string, level: CourseLevel): Promise<QuizQuestion[]> {
  const course = courseById(courseId);
  if (!course) return [];
  const pool: QuizQuestion[] = [];
  for (const lessonId of levelLessonIds(level)) {
    const c = await loadLessonContent(course.id, lessonId);
    if (c?.checkQuestions) pool.push(...c.checkQuestions);
  }
  for (const m of level.modules) {
    const q = await loadModuleQuiz(course.id, m.id);
    if (q?.questions) pool.push(...q.questions);
  }
  return pool;
}

export function drawRandom<T>(pool: T[], n: number): T[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

/** Photorealistic hero image URL if one has been generated for the lesson. */
export function lessonHeroUrl(courseId: string, lessonId: string): string | null {
  const p = path.join(process.cwd(), "public", "content", courseId, "photos", `${lessonId}-hero.jpg`);
  return existsSync(p) ? `/content/${courseId}/photos/${lessonId}-hero.jpg` : null;
}

/** Teaching-video URL from the upload manifest (Supabase Storage public URLs). */
export function lessonVideoUrl(courseId: string, lessonId: string): string | null {
  try {
    const manifest = JSON.parse(
      readFileSync(path.join(contentDir(courseId), "videos.json"), "utf8"),
    ) as Record<string, string>;
    return manifest[lessonId] ?? null;
  } catch {
    return null;
  }
}

/**
 * AI-explainer videos for a lesson, from the Knowlify upload manifest
 * (explainers.json: lessonId -> [{uuid,url,title,afterSection}]). Missing
 * manifest or lesson entry just means no explainer steps.
 */
export function lessonExplainers(
  courseId: string,
  lessonId: string,
): { uuid: string; url: string; title: string; afterSection: number }[] {
  try {
    const manifest = JSON.parse(
      readFileSync(path.join(contentDir(courseId), "explainers.json"), "utf8"),
    ) as Record<string, { uuid: string; url: string; title: string; afterSection: number }[]>;
    return manifest[lessonId] ?? [];
  } catch {
    return [];
  }
}

/**
 * Pre-rendered slide-narration audio (Titan voice), content-addressed:
 * slide-audio.json maps a stable text hash -> Supabase URL. The lesson player
 * derives the same hash per slide and plays the matching clip, gating Continue
 * on its end. Missing manifest -> player falls back to the browser voice.
 */
export function slideAudioManifest(courseId: string): Record<string, string> {
  try {
    return JSON.parse(readFileSync(path.join(contentDir(courseId), "slide-audio.json"), "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Per-lesson 3-D trainer configs (trainers.json: lessonId -> TrainerConfig).
 * Missing manifest/entry -> no trainer step for that lesson.
 */
export function trainersManifest(courseId: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path.join(contentDir(courseId), "trainers.json"), "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Which lessons in a level have authored content (for progress/QA surfaces). */
export async function authoredLessonIds(courseId: string, level: CourseLevel): Promise<Set<string>> {
  const ids = levelLessonIds(level);
  const results = await Promise.all(
    ids.map(async (id) => ((await loadLessonContent(courseId, id)) ? id : null)),
  );
  return new Set(results.filter((x): x is string => x !== null));
}
