import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeartbeatTracker from "@/components/HeartbeatTracker";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import CompleteButton from "./CompleteButton";
import { createClient } from "@/lib/supabase/server";
import { courseBySlug, findLesson, flatLessons, levelLessonIds } from "@/lib/curriculum";
import { getCourseAccess } from "@/lib/billing/access";
import { getIdentityStatus } from "@/lib/identity";
import {
  loadLessonContent,
  lessonHeroUrl,
  lessonVideoUrl,
  lessonExplainers,
} from "@/lib/vtContent";
import { buildSteps } from "@/lib/lessonSteps";

export const metadata: Metadata = { robots: { index: false } };

const ICONS: Record<string, React.ReactNode> = {
  video: <path d="M8 5v14l11-7z" />,
  narration: <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z" />,
  diagram: <path d="M3 3h8v8H3zm10 0h8v5h-8zM3 13h8v8H3zm10-3h8v11h-8z" transform="scale(.9) translate(1.3,1.3)" />,
  interactive: <path d="M13 2 3 14h6l-2 8L19 10h-6l2-8z" />,
  simulation: (
    <>
      <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  reference: <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v2h8V6H8zm0 4v2h8v-2H8zm0 4v2h5v-2H8z" />,
};
const MEDIA_NOTE: Record<string, string> = {
  video: "Video placeholder — production footage to be added",
  narration: "Voiceover placeholder — narration script and audio to be recorded",
  diagram: "Diagram placeholder — illustration to be produced",
  interactive: "Interactive placeholder — exercise to be built",
  simulation: "Simulation placeholder — virtual practice environment to be built",
  reference: "Reference placeholder — standards/excerpt library to be attached",
};

export default async function LessonPage({
  params,
}: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  const found = findLesson(course, lessonId);
  if (!found) notFound();
  const { level, module: mod, moduleIdx, lesson } = found;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${slug}/${lessonId}`);

  // Paywall: deep links can't bypass the course page's entitlement check.
  const access = await getCourseAccess(supabase, user.id, course.id);
  if (!access.ok) redirect(`/learn/${slug}`);

  // Identity proofing required before any coursework.
  const identity = await getIdentityStatus(supabase, user.id);
  if (!identity.verified) redirect(`/verify?next=/learn/${slug}/${lessonId}`);

  const content = await loadLessonContent(course.id, lessonId);

  const ids = levelLessonIds(level);
  const [{ data: progressRows }, { data: checkAttempts }] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .in("lesson_id", ids),
    content
      ? supabase
          .from("quiz_attempts")
          .select("id")
          .eq("user_id", user.id)
          .eq("scope", "check")
          .eq("scope_id", lessonId)
          .eq("passed", true)
          .limit(1)
      : Promise.resolve({ data: null }),
  ]);
  const done = new Set((progressRows ?? []).map((r) => r.lesson_id));
  const checkPassed = !!checkAttempts?.length;
  const completionLocked = !!content && content.checkQuestions.length > 0 && !checkPassed;

  const flat = flatLessons(level);
  const flatIdx = flat.findIndex((f) => f.lesson.id === lessonId);
  const prev = flatIdx > 0 ? flat[flatIdx - 1].lesson : null;
  const next = flatIdx < flat.length - 1 ? flat[flatIdx + 1].lesson : null;
  const figureFileById = Object.fromEntries((content?.figures ?? []).map((f) => [f.id, f.file]));

  // Build the full-screen player's step sequence server-side.
  const steps = content
    ? buildSteps({
        lesson,
        content,
        heroUrl: lessonHeroUrl(course.id, lessonId),
        videoUrl: lessonVideoUrl(course.id, lessonId),
        explainers: lessonExplainers(course.id, lessonId),
        figureBase: `/content/${course.id}/figures`,
      })
    : null;

  return (
    <>
      <Header />
      <main>
        <section className="block tight">
          <div className="wrap">
            <div className="player-layout">
              <aside className="player-side">
                <div className="ps-head">
                  {course.code}{" "}
                  {level.level === "I" || level.level === "II" || level.level === "III" ? `Level ${level.level}` : level.level}{" "}
                  Curriculum
                </div>
                {level.modules.map((m, mi) => (
                  <div key={m.id} className="ps-mod">
                    <div className="ps-mtitle">{String(mi + 1).padStart(2, "0")} · {m.title}</div>
                    {m.lessons.map((l) => (
                      <Link
                        key={l.id}
                        href={`/learn/${slug}/${l.id}`}
                        className={`ps-lesson${l.id === lessonId ? " cur" : ""}${done.has(l.id) ? " done" : ""}`}
                      >
                        <span className="dot"></span>
                        <span>{l.title}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </aside>

              <div className="lesson-main">
                <div className="crumb">
                  <Link href={`/learn/${slug}`}>Curriculum</Link> / Module {moduleIdx + 1}: {mod.title}
                </div>
                <h1>{lesson.title}</h1>
                <div className="lesson-stats">
                  {lesson.minutes} minutes of formal training · counts toward {level.targetHours} h requirement
                </div>

                {content && steps ? (
                  <>
                    <LessonPlayer
                      steps={steps}
                      lessonId={lessonId}
                      courseId={course.id}
                      courseSlug={slug}
                      nextLessonId={next?.id ?? null}
                      alreadyPassed={checkPassed}
                      figureFileById={figureFileById}
                    />
                    <div className="objectives">
                      <h4>Learning objectives</h4>
                      <ul>
                        {lesson.objectives.map((o) => <li key={o}>{o}</li>)}
                      </ul>
                    </div>
                    <div className="topics-panel">
                      <h4>CP-105 topics covered in this lesson</h4>
                      <ul>
                        {lesson.topics.map((t) => <li key={t}>{t}</li>)}
                      </ul>
                    </div>
                    {content.references.length > 0 && (
                      <div className="lc-refs">
                        <h4>References</h4>
                        <ul>
                          {content.references.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="objectives">
                      <h4>Learning objectives</h4>
                      <ul>
                        {lesson.objectives.map((o) => <li key={o}>{o}</li>)}
                      </ul>
                    </div>
                    {lesson.media.map((m, idx) => (
                      <div key={idx} className="media-block">
                        <div className="mb-head">
                          <span className={`mtag ${m.type}`}>{m.type}</span>
                          <span className="t">{m.title}</span>
                          {m.duration && <span className="dur">{m.duration}</span>}
                        </div>
                        <div className={`media-stage ${m.type === "video" ? "video" : ""}`}>
                          <div className="ph">
                            <div className="ph-icon">
                              <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[m.type] ?? ICONS.reference}</svg>
                            </div>
                            <div className="ph-label">{m.type} · placeholder</div>
                            <div className="ph-note">{MEDIA_NOTE[m.type] ?? ""}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="topics-panel">
                      <h4>CP-105 topics covered in this lesson</h4>
                      <ul>
                        {lesson.topics.map((t) => <li key={t}>{t}</li>)}
                      </ul>
                    </div>
                    {lesson.check && (
                      <div className="check-block">
                        <div>
                          <div className="t">Knowledge check</div>
                          <div className="d">
                            {lesson.check.questions} questions — will be required to log this lesson&apos;s training time
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" disabled>Start (coming soon)</button>
                      </div>
                    )}
                  </>
                )}

                <div className="lesson-nav">
                  {prev ? (
                    <Link className="btn btn-ghost" href={`/learn/${slug}/${prev.id}`}>Previous</Link>
                  ) : (
                    <Link className="btn btn-ghost" href={`/learn/${slug}`}>Curriculum</Link>
                  )}
                  <CompleteButton
                    lessonId={lesson.id}
                    initialDone={done.has(lesson.id)}
                    locked={completionLocked}
                    lockReason="Pass the lesson's knowledge check to mark it complete"
                  />
                  {next ? (
                    <Link className="btn btn-primary" href={`/learn/${slug}/${next.id}`}>Next Lesson</Link>
                  ) : (
                    <Link className="btn btn-primary" href={`/learn/${slug}`}>Finish Level</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <HeartbeatTracker courseId={course.id} lessonId={lesson.id} />
    </>
  );
}
