"use server";
// Level completion: called after a passing final-exam attempt. Verifies the
// whole level server-side (every lesson complete + passing final on record)
// and issues the certificate with the service role — clients cannot insert
// certificates directly.
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getIdentityStatus } from "@/lib/identity";
import { courseBySlug, levelLessonIds, fmtHours } from "@/lib/curriculum";

export interface FinalizeResult {
  certificateIssued: boolean;
  verificationCode?: string;
  reason?: string;
}

export async function finalizeLevel(courseSlug: string, levelKey: string): Promise<FinalizeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { certificateIssued: false, reason: "Not signed in." };

  // Certificates are only issued to identity-verified students.
  const identity = await getIdentityStatus(supabase, user.id);
  if (!identity.verified) {
    return { certificateIssued: false, reason: "Identity verification is required before a certificate can be issued." };
  }

  const course = courseBySlug(courseSlug);
  const level = course?.levels.find((l) => `${course.id}-${l.level}` === levelKey);
  if (!course || !level) return { certificateIssued: false, reason: "Unknown level." };

  const lessonIds = levelLessonIds(level);
  const [{ data: progress }, { data: finalAttempt }, { data: levelSeconds }] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).in("lesson_id", lessonIds),
    supabase
      .from("quiz_attempts")
      .select("id")
      .eq("user_id", user.id)
      .eq("scope", "final")
      .eq("scope_id", levelKey)
      .eq("passed", true)
      .limit(1),
    supabase.rpc("lesson_seconds", { p_lesson_ids: lessonIds }),
  ]);

  const doneCount = progress?.length ?? 0;
  if (!finalAttempt?.length) {
    return { certificateIssued: false, reason: "No passing final exam on record yet." };
  }
  if (doneCount < lessonIds.length) {
    return {
      certificateIssued: false,
      reason: `Final passed and recorded. Certificate unlocks when all lessons are complete (${doneCount}/${lessonIds.length} done).`,
    };
  }

  // Auditable-hours gate: the certificate requires the level's full formal
  // training time as actively-engaged, logged hours on this level's lessons.
  const loggedLevelHours = Number(levelSeconds ?? 0) / 3600;
  const requiredHours = level.targetHours;
  if (loggedLevelHours < requiredHours) {
    return {
      certificateIssued: false,
      reason:
        `Final passed and recorded. Your certificate unlocks at ${fmtHours(requiredHours)} h of logged training time on Level ${level.level} lessons — ` +
        `you have ${loggedLevelHours.toFixed(1)} h. Keep working through the material; engaged time logs automatically.`,
    };
  }

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const levelId = `${course.id}-${level.level}`;
  const { data: existing } = await svc
    .from("certificates")
    .select("verification_code")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("level_id", levelId)
    .maybeSingle();
  if (existing) {
    return { certificateIssued: true, verificationCode: existing.verification_code };
  }

  const loggedHours = Math.round(loggedLevelHours * 100) / 100;
  const { data: cert, error } = await svc
    .from("certificates")
    .insert({
      user_id: user.id,
      course_id: course.id,
      level_id: levelId,
      title: `${course.code} Level ${level.level} — Formal Training (${fmtHours(level.targetHours)} h design)`,
      hours: loggedHours,
    })
    .select("verification_code")
    .single();
  if (error || !cert) {
    return { certificateIssued: false, reason: "Could not issue certificate — try again from your dashboard." };
  }
  return { certificateIssued: true, verificationCode: cert.verification_code };
}
