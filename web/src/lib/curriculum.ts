// Curriculum catalog — single source of truth for marketing + learn pages.
// Loaded from JSON at build time (mirrors what's seeded into Postgres).
import ut from "@/data/curriculum/ut.json";
import rt from "@/data/curriculum/rt.json";
import mt from "@/data/curriculum/mt.json";
import pt from "@/data/curriculum/pt.json";
import et from "@/data/curriculum/et.json";
import vt from "@/data/curriculum/vt.json";
import basic from "@/data/curriculum/basic.json";
import rad from "@/data/curriculum/rad.json";

export interface MediaItem { type: string; title: string; duration?: string; status?: string }
export interface Lesson {
  id: string; title: string; minutes: number;
  objectives: string[]; topics: string[]; media: MediaItem[];
  check?: { questions: number; passingScore?: number } | null;
}
export interface CourseModule {
  id: string; title: string; cpSection?: string; hours: number;
  lessons: Lesson[]; moduleQuiz?: { questions: number; passingScore: number } | null;
}
export interface CourseLevel {
  level: string; targetHours: number; description?: string;
  finalExam?: { questions: number; passingScore: number; bank?: string; bankLevel?: number } | null;
  modules: CourseModule[];
}
export interface Course {
  id: string; code: string; name: string; cp105?: string;
  hours: {
    snt_tc_1a?: { l1: number | null; l2: number | null } | null;
    nas410?: { l1: number | null; l2: number | null } | null;
    directToL2?: number | null;
  };
  jurisdictionNote?: string;
  futureTechniques?: string[];
  levels: CourseLevel[];
}

export const COURSES: Course[] = [ut, rt, mt, pt, et, vt, basic, rad] as unknown as Course[];

/** SEO-friendly slugs for /courses/[slug]; learn routes reuse the same slugs. */
export const COURSE_SLUGS: Record<string, string> = {
  ut: "ultrasonic-testing",
  rt: "radiographic-testing",
  mt: "magnetic-particle-testing",
  pt: "liquid-penetrant-testing",
  et: "eddy-current-testing",
  vt: "visual-testing",
  basic: "ndt-basic",
  rad: "radiation-safety",
};
export const SLUG_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(COURSE_SLUGS).map(([id, slug]) => [slug, id]),
);

/** Question-bank key per course (null = no bank yet). */
export const COURSE_EXAM_METHOD: Record<string, string | null> = {
  ut: "UT", rt: "RT", mt: "MPI", pt: "LPI", et: "ECT",
  vt: null, basic: null, rad: null,
};

export const courseById = (id: string): Course | undefined => COURSES.find((c) => c.id === id);
export const courseBySlug = (slug: string): Course | undefined => courseById(SLUG_TO_ID[slug]);
export const slugForCourse = (id: string): string => COURSE_SLUGS[id] ?? id;

export function courseLessonStats(course: Course) {
  let lessons = 0, minutes = 0, modules = 0;
  for (const level of course.levels) {
    modules += level.modules.length;
    for (const m of level.modules) {
      lessons += m.lessons.length;
      for (const l of m.lessons) minutes += l.minutes;
    }
  }
  return { lessons, modules, hours: Math.round((minutes / 60) * 10) / 10 };
}

export function levelLessonIds(level: CourseLevel): string[] {
  return level.modules.flatMap((m) => m.lessons.map((l) => l.id));
}

export function courseLessonIds(course: Course): string[] {
  return course.levels.flatMap(levelLessonIds);
}

export function findLesson(course: Course, lessonId: string) {
  for (let li = 0; li < course.levels.length; li++) {
    const level = course.levels[li];
    for (let mi = 0; mi < level.modules.length; mi++) {
      const mod = level.modules[mi];
      const idx = mod.lessons.findIndex((l) => l.id === lessonId);
      if (idx >= 0) return { level, levelIdx: li, module: mod, moduleIdx: mi, lesson: mod.lessons[idx], lessonIdx: idx };
    }
  }
  return null;
}

/** Flattened ordered lesson list for prev/next navigation within a level. */
export function flatLessons(level: CourseLevel) {
  return level.modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ lesson: l, moduleIdx: mi, lessonIdx: li, module: m })));
}

export const fmtHours = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ""));
