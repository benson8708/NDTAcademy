import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { courseById } from "@/lib/curriculum";
import { getIdentityStatus } from "@/lib/identity";
import { getCourseAccess } from "@/lib/billing/access";

/**
 * Active-engagement heartbeat. The lesson player POSTs a short slice of
 * verified-engaged time (default 30 s) only while the tab is visible and the
 * user has been active. RLS restricts inserts to the caller's own rows and
 * the schema caps any one slice at 120 s.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Training time only accrues for identity-verified students.
  const identity = await getIdentityStatus(supabase, user.id);
  if (!identity.verified) {
    return NextResponse.json({ error: "identity verification required" }, { status: 403 });
  }

  let body: { courseId?: string; lessonId?: string; seconds?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const course = courseById(String(body.courseId ?? ""));
  if (!course) return NextResponse.json({ error: "unknown course" }, { status: 400 });

  // Formal training hours only accrue while the course is entitled.
  const access = await getCourseAccess(supabase, user.id, course.id);
  if (!access.ok) return NextResponse.json({ error: "course not entitled" }, { status: 403 });

  const seconds = Math.min(Math.max(Math.round(Number(body.seconds) || 0), 1), 60);
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : null;

  const { error } = await supabase.from("time_logs").insert({
    user_id: user.id,
    course_id: course.id,
    lesson_id: lessonId,
    seconds,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
