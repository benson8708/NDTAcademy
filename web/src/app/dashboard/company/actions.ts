"use server";
// Company-admin actions. The service-role client is used ONLY after verifying
// the caller's session and org-admin role; it never reaches the browser.
import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function addTechnician(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const orgId = String(formData.get("org_id") ?? "");
  if (!email || !orgId) return { ok: false, message: "Email is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  // Caller must be an admin of this org (RLS-scoped read proves membership)
  const { data: adminRow } = await supabase
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!adminRow) return { ok: false, message: "You are not an admin of this organization." };

  const svc = serviceClient();

  // Seat limit
  const [{ data: org }, { count: used }] = await Promise.all([
    svc.from("organizations").select("seat_limit").eq("id", orgId).single(),
    svc.from("org_memberships").select("*", { count: "exact", head: true }).eq("org_id", orgId),
  ]);
  if (org && used != null && used >= org.seat_limit) {
    return { ok: false, message: `All ${org.seat_limit} seats are in use. Buy more seats from the Seats panel.` };
  }

  // Find the auth user by email
  const { data: found, error: lookupError } = await svc.rpc("get_user_id_by_email", { p_email: email });
  if (lookupError || !found) {
    return {
      ok: false,
      message: "No account found for that email. Ask them to create a free account at /signup first, then add them here.",
    };
  }

  const { error: insertError } = await svc
    .from("org_memberships")
    .upsert({ org_id: orgId, user_id: found as string, role: "member" }, { onConflict: "org_id,user_id", ignoreDuplicates: true });
  if (insertError) return { ok: false, message: insertError.message };

  revalidatePath("/dashboard/company");
  return { ok: true, message: `${email} added to your roster.` };
}
