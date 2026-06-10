import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizRunner from "@/components/lesson/QuizRunner";
import { createClient } from "@/lib/supabase/server";
import { courseBySlug } from "@/lib/curriculum";
import { drawRandom, loadModuleQuiz } from "@/lib/vtContent";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ModuleQuizPage({
  params,
}: { params: Promise<{ slug: string; moduleId: string }> }) {
  const { slug, moduleId } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  let moduleTitle = "";
  let passingScore = 80;
  let questionCount = 10;
  let moduleIdx = 0;
  let found = false;
  for (const level of course.levels) {
    const idx = level.modules.findIndex((m) => m.id === moduleId);
    if (idx >= 0) {
      const m = level.modules[idx];
      moduleTitle = m.title;
      moduleIdx = idx;
      passingScore = m.moduleQuiz?.passingScore ?? 80;
      questionCount = m.moduleQuiz?.questions ?? 10;
      found = true;
      break;
    }
  }
  if (!found) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${slug}/quiz/${moduleId}`);

  const quiz = await loadModuleQuiz(course.id, moduleId);
  const questions = quiz ? drawRandom(quiz.questions, questionCount) : [];

  return (
    <>
      <Header />
      <main>
        <section className="page-hero on-dark">
          <div className="wrap">
            <span className="kicker">{course.code} · Module {moduleIdx + 1} Quiz</span>
            <h1>{moduleTitle}</h1>
            <p className="lede">
              {questionCount} questions · {passingScore}% to pass · instant feedback with
              explanations. Attempts are saved to your record.
            </p>
          </div>
        </section>
        <section className="block">
          <div className="wrap">
            {questions.length === 0 ? (
              <div className="proto-note">
                This module quiz is still being authored — check back shortly.{" "}
                <Link href={`/learn/${slug}`}>Back to curriculum</Link>
              </div>
            ) : (
              <QuizRunner
                scope="module"
                scopeId={moduleId}
                courseSlug={slug}
                questions={questions}
                passingScore={passingScore}
                title={`Module Quiz — ${moduleTitle}`}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
