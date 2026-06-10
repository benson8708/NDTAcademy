import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeInquiry } from "@/lib/identity";

/**
 * Called by the verification page after the Persona widget completes (or via
 * "check my status" recovery with no inquiryId). The server re-fetches the
 * inquiry from Persona and records the outcome — client claims are never
 * trusted directly.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let inquiryId: string | undefined;
  try {
    const body = await request.json();
    if (typeof body.inquiryId === "string" && body.inquiryId.startsWith("inq_")) {
      inquiryId = body.inquiryId;
    }
  } catch {
    /* empty body = recovery lookup by reference-id */
  }

  const result = await completeInquiry(user.id, inquiryId);
  return NextResponse.json(result);
}
