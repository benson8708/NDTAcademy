// Identity verification (Persona). The client widget runs the document +
// selfie flow; the SERVER decides what counts: it fetches the inquiry from
// Persona's API, requires the inquiry's reference-id to equal the user's id,
// and records the outcome with the service role. Clients can never write
// their own verification row.
import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const PERSONA_API = "https://api.withpersona.com/api/v1";
// Sandbox inquiries finish as "completed"; production decisioning yields "approved".
const PASSING_STATUSES = new Set(["completed", "approved"]);

export interface IdentityStatus {
  verified: boolean;
  status: string | null;
  inquiryId: string | null;
}

/**
 * Exams require a FRESH identity check-in, not just a historical one — the
 * person sitting the exam must be re-verified within this window (minutes).
 */
export const EXAM_CHECK_WINDOW_MIN = Number(process.env.IDENTITY_EXAM_WINDOW_MIN ?? 15);

/**
 * True when the user completed a passing identity check within the last
 * `windowMin` minutes — the clearance required to sit an exam.
 */
export async function hasFreshVerification(
  supabase: SupabaseClient,
  userId: string,
  windowMin: number = EXAM_CHECK_WINDOW_MIN,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMin * 60_000).toISOString();
  const { data } = await supabase
    .from("identity_checks")
    .select("id")
    .eq("user_id", userId)
    .eq("verified", true)
    .gte("created_at", since)
    .limit(1);
  return !!data?.length;
}

export async function getIdentityStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<IdentityStatus> {
  const { data } = await supabase
    .from("identity_verifications")
    .select("inquiry_id, status, verified")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    verified: !!data?.verified,
    status: data?.status ?? null,
    inquiryId: data?.inquiry_id ?? null,
  };
}

interface PersonaInquiry {
  id: string;
  attributes: { status: string; "reference-id": string | null };
}

async function personaFetch(path: string): Promise<Response> {
  return fetch(`${PERSONA_API}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
      "Persona-Version": "2023-01-05",
    },
    cache: "no-store",
  });
}

/**
 * Verify an inquiry against Persona and record the result for the user.
 * If inquiryId is omitted, looks up the user's most recent inquiry by
 * reference-id (recovery for closed-tab flows).
 */
export async function completeInquiry(
  userId: string,
  inquiryId?: string,
): Promise<IdentityStatus> {
  let inquiry: PersonaInquiry | null = null;

  if (inquiryId) {
    const resp = await personaFetch(`/inquiries/${encodeURIComponent(inquiryId)}`);
    if (resp.ok) inquiry = (await resp.json()).data as PersonaInquiry;
  } else {
    const resp = await personaFetch(
      `/inquiries?filter%5Breference-id%5D=${encodeURIComponent(userId)}&page%5Bsize%5D=10`,
    );
    if (resp.ok) {
      const list = ((await resp.json()).data ?? []) as PersonaInquiry[];
      inquiry =
        list.find((i) => PASSING_STATUSES.has(i.attributes.status)) ?? list[0] ?? null;
    }
  }

  if (!inquiry) return { verified: false, status: null, inquiryId: null };

  // The inquiry must belong to this user — reference-id is set by our widget.
  if (inquiry.attributes["reference-id"] !== userId) {
    return { verified: false, status: "reference_mismatch", inquiryId: inquiry.id };
  }

  const status = inquiry.attributes.status;
  const verified = PASSING_STATUSES.has(status);

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  await svc.from("identity_verifications").upsert(
    {
      user_id: userId,
      inquiry_id: inquiry.id,
      status,
      verified,
      verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  // Append-only audit trail — each exam session ties back to one of these.
  // Skip duplicate rows for the same inquiry+status (recovery-path re-checks).
  const { data: existingCheck } = await svc
    .from("identity_checks")
    .select("id")
    .eq("user_id", userId)
    .eq("inquiry_id", inquiry.id)
    .eq("status", status)
    .limit(1);
  if (!existingCheck?.length) {
    await svc.from("identity_checks").insert({
      user_id: userId,
      inquiry_id: inquiry.id,
      status,
      verified,
    });
  }

  return { verified, status, inquiryId: inquiry.id };
}
