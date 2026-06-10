import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizRunner from "@/components/lesson/QuizRunner";
import ClaimCertificate from "./ClaimCertificate";
import { createClient } from "@/lib/supabase/server";
import { getIdentityStatus, hasFreshVerification, EXAM_CHECK_WINDOW_MIN } from "@/lib/identity";
import { courseBySlug, fmtHours, levelLessonIds } from "@/lib/curriculum";
import { drawRandom, loadFinalPool } from "@/lib/vtContent";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function FinalExamPage({
  params,
}: { params: Promise<{ slug: string; levelKey: string }> }) {
  const { slug, levelKey } = await params;
  const course = courseBySlug(slug);
  const level = course?.levels.find((l) => `${course.id}-${l.level}` === levelKey);
  if (!course || !level || !level.finalExam) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${slug}/exam/${levelKey}`);

  // Identity proofing required before any certification exam.
  const identity = await getIdentityStatus(supabase, user.id);
  if (!identity.verified) redirect(`/verify?next=/learn/${slug}/exam/${levelKey}`);
  // Exams require a FRESH check-in: the person sitting the exam re-verifies
  // within the last {EXAM_CHECK_WINDOW_MIN} minutes — not a one-time badge.
  const fresh = await hasFreshVerification(supabase, user.id, EXAM_CHECK_WINDOW_MIN);
  if (!fresh) redirect(`/verify?next=/learn/${slug}/exam/${levelKey}&recheck=exam`);

  const pool = await loadFinalPool(course.id, level);
  const questions = drawRandom(pool, level.finalExam.questions);

  // Readiness signals — the certificate requires every lesson complete AND the
  // level's full formal training hours logged as active engagement.
  const lessonIds = levelLessonIds(level);
  const [{ data: progress }, { data: levelSeconds }, { data: passingFinal }, { data: existingCert }] =
    await Promise.all([
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds),
      supabase.rpc("lesson_seconds", { p_lesson_ids: lessonIds }),
      supabase
        .from("quiz_attempts")
        .select("id")
        .eq("user_id", user.id)
        .eq("scope", "final")
        .eq("scope_id", levelKey)
        .eq("passed", true)
        .limit(1),
      supabase
        .from("certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("level_id", levelKey)
        .limit(1),
    ]);
  const doneCount = progress?.length ?? 0;
  const loggedHours = Number(levelSeconds ?? 0) / 3600;
  const hoursMet = loggedHours >= level.targetHours;
  const canClaim = !!passingFinal?.length && !existingCert?.length;

  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">{course.code} · Level {level.level} · Final Exam</span>
            <h1>{course.name} Level {level.level} Final</h1>
            <p className="lede">
              {level.finalExam.questions} questions drawn at random from the level&apos;s full
              question pool ({pool.length} questions) · {level.finalExam.passingScore}% to pass.
              Certificate requirements: every lesson complete ({doneCount}/{lessonIds.length}),
              the full {fmtHours(level.targetHours)} h of logged training time on this level
              ({loggedHours.toFixed(1)} h logged{hoursMet ? " — met" : " so far"}), and a passing
              final. Meet all three and your certificate is issued automatically.
            </p>
          </div>
        </section>
        <section className="block">
          <div className="wrap">
            {canClaim && <ClaimCertificate courseSlug={slug} levelKey={levelKey} />}
            {questions.length < level.finalExam.questions ? (
              <div className="proto-note">
                The final exam pool is still being authored ({pool.length} questions available so
                far). Check back shortly. <Link href={`/learn/${slug}`}>Back to curriculum</Link>
              </div>
            ) : (
              <QuizRunner
                scope="final"
                scopeId={levelKey}
                courseSlug={slug}
                questions={questions}
                passingScore={level.finalExam.passingScore}
                title={`${course.code} Level ${level.level} Final`}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
