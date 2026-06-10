// Course access = the paywall decision, checked by /learn pages and the
// heartbeat API. Grants, in order of precedence:
//   beta        — FREE_BETA=true keeps the whole catalog free (current state)
//   entitlement — an un-revoked course_entitlements row (individual purchase)
//   org         — membership in any organization (company seats are
//                 all-catalog; seat_limit caps roster size at add time)
//   admin       — profiles.role = 'platform_admin'
import type { SupabaseClient } from "@supabase/supabase-js";
import { isFreeBeta } from "@/lib/stripe/server";

export type CourseAccess =
  | { ok: true; via: "beta" | "free" | "entitlement" | "org" | "admin" }
  | { ok: false };

/**
 * Promotional free courses — open to any signed-in account regardless of the
 * paywall. Drives the "VT Level I & II free for a limited time" launch offer;
 * end the promo by setting FREE_COURSES="" (rebuild required: course-page CTAs
 * are static).
 */
export const FREE_COURSE_IDS: ReadonlySet<string> = new Set(
  (process.env.FREE_COURSES ?? "vt").split(",").map((s) => s.trim()).filter(Boolean),
);

export async function getCourseAccess(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<CourseAccess> {
  if (isFreeBeta()) return { ok: true, via: "beta" };
  if (FREE_COURSE_IDS.has(courseId)) return { ok: true, via: "free" };

  const [{ data: entitlement }, { data: memberships }, { data: profile }] = await Promise.all([
    supabase
      .from("course_entitlements")
      .select("course_id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .is("revoked_at", null)
      .maybeSingle(),
    supabase.from("org_memberships").select("org_id").eq("user_id", userId).limit(1),
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
  ]);

  if (entitlement) return { ok: true, via: "entitlement" };
  if (memberships && memberships.length > 0) return { ok: true, via: "org" };
  if (profile?.role === "platform_admin") return { ok: true, via: "admin" };
  return { ok: false };
}
