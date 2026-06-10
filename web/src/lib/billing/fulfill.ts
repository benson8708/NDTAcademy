// Checkout fulfillment — shared by the webhook handler and the success-URL
// redirect (Stripe's recommended belt-and-braces pattern). Designed to be
// safely re-run at any point: webhook retries, replays, the success page
// racing the webhook, or a crash mid-fulfillment all converge on the same
// final state. Entitlement/enrollment upserts are naturally idempotent;
// seat changes are exactly-once via apply_seat_change's ledger gate.
//
// This Stripe account hosts other apps, so every session we create carries
// metadata.app = "ndtacademy" and everything else is ignored here.
import "server-only";
import type Stripe from "stripe";
import { createClient as createServiceClient, type SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/server";

export const APP_METADATA_TAG = "ndtacademy";

/** Service-role client — server only, bypasses RLS for fulfillment writes. */
export function billingServiceClient(): SupabaseClient {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email?: string,
  name?: string,
): Promise<string> {
  const svc = billingServiceClient();
  const { data: existing } = await svc
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    name,
    metadata: { app: APP_METADATA_TAG, supabase_user_id: userId },
  });
  const { error } = await svc
    .from("stripe_customers")
    .insert({ user_id: userId, stripe_customer_id: customer.id });
  if (error) {
    // Lost a concurrent race — keep the stored mapping (the extra Stripe
    // customer object is inert).
    const { data: winner } = await svc
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (winner) return winner.stripe_customer_id;
    throw new Error(`failed to store stripe customer: ${error.message}`);
  }
  return customer.id;
}

export type FulfillResult =
  | { ok: true; kind: "course" | "seat_pack" }
  | { ok: false; reason: string };

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<FulfillResult> {
  const md = session.metadata ?? {};
  if (md.app !== APP_METADATA_TAG) return { ok: false, reason: "not an ndtacademy session" };
  if (session.payment_status !== "paid") return { ok: false, reason: "not paid" };

  const kind = md.kind;
  const userId = md.user_id;
  if ((kind !== "course" && kind !== "seat_pack") || !userId) {
    return { ok: false, reason: "missing metadata" };
  }
  const courseId = kind === "course" ? md.course_id : undefined;
  const orgId = kind === "seat_pack" ? md.org_id : undefined;
  const seats = kind === "seat_pack" ? Math.max(parseInt(md.seats ?? "0", 10) || 0, 0) : undefined;
  if (kind === "course" && !courseId) return { ok: false, reason: "missing course_id" };
  if (kind === "seat_pack" && (!orgId || !seats)) return { ok: false, reason: "missing org/seats" };

  const svc = billingServiceClient();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // One purchase row per Checkout Session (unique stripe_checkout_session_id).
  const { error: purchaseError } = await svc.from("purchases").upsert(
    {
      user_id: userId,
      org_id: orgId ?? null,
      kind,
      course_id: courseId ?? null,
      seats: seats ?? null,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    },
    { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true },
  );
  if (purchaseError) throw new Error(`purchase insert failed: ${purchaseError.message}`);
  const { data: purchase, error: fetchError } = await svc
    .from("purchases")
    .select("id, status")
    .eq("stripe_checkout_session_id", session.id)
    .single();
  if (fetchError) throw new Error(`purchase fetch failed: ${fetchError.message}`);

  if (kind === "course") {
    if (purchase.status === "paid") {
      const { error: entError } = await svc.from("course_entitlements").upsert(
        {
          user_id: userId,
          course_id: courseId!,
          source: "purchase",
          purchase_id: purchase.id,
          revoked_at: null, // re-purchase after refund restores access
        },
        { onConflict: "user_id,course_id" },
      );
      if (entError) throw new Error(`entitlement upsert failed: ${entError.message}`);
      const { error: enrollError } = await svc
        .from("enrollments")
        .upsert(
          { user_id: userId, course_id: courseId!, status: "active" },
          { onConflict: "user_id,course_id" },
        );
      if (enrollError) throw new Error(`enrollment upsert failed: ${enrollError.message}`);
    }
  } else {
    // Atomic + exactly-once: ledger row and seat_limit move in one transaction.
    const { error: seatError } = await svc.rpc("apply_seat_change", {
      p_org: orgId!,
      p_delta: seats!,
      p_reason: "purchase",
      p_purchase: purchase.id,
    });
    if (seatError) throw new Error(`apply_seat_change failed: ${seatError.message}`);
  }

  return { ok: true, kind };
}

/** Success-URL path: retrieve the session ourselves, then fulfill. */
export async function retrieveAndFulfillSession(
  sessionId: string,
  expectedUserId: string,
): Promise<FulfillResult> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.metadata?.user_id !== expectedUserId) {
    return { ok: false, reason: "session belongs to a different user" };
  }
  return fulfillCheckoutSession(session);
}

/** Full refunds revoke what the purchase granted. Partial refunds keep access. */
export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  if (!charge.refunded) return; // fires for partial refunds too — act only on full
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const svc = billingServiceClient();
  const { data: purchase } = await svc
    .from("purchases")
    .select()
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (!purchase || purchase.status === "refunded") return; // not ours / already handled

  // Side effects first (each idempotent), status flip last as the done-marker.
  if (purchase.kind === "course" && purchase.course_id) {
    // Revoke only if this purchase is still what grants the course (a newer
    // re-purchase points the entitlement at a different purchase_id).
    const { data: revoked, error: revokeError } = await svc
      .from("course_entitlements")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", purchase.user_id)
      .eq("course_id", purchase.course_id)
      .eq("purchase_id", purchase.id)
      .is("revoked_at", null)
      .select();
    if (revokeError) throw new Error(`entitlement revoke failed: ${revokeError.message}`);
    if (revoked && revoked.length > 0) {
      await svc
        .from("enrollments")
        .update({ status: "cancelled" })
        .eq("user_id", purchase.user_id)
        .eq("course_id", purchase.course_id);
    }
  } else if (purchase.kind === "seat_pack" && purchase.org_id && purchase.seats) {
    // Ledger-gated exactly-once; floor prevents dropping below the roster.
    const { error: seatError } = await svc.rpc("apply_seat_change", {
      p_org: purchase.org_id,
      p_delta: -purchase.seats,
      p_reason: "refund",
      p_purchase: purchase.id,
    });
    if (seatError) throw new Error(`apply_seat_change failed: ${seatError.message}`);
  }

  const { error: statusError } = await svc
    .from("purchases")
    .update({ status: "refunded" })
    .eq("id", purchase.id);
  if (statusError) throw new Error(`purchase refund update failed: ${statusError.message}`);
}

/**
 * Webhook replay ledger (audit + fast skip). Returns true if this event id
 * was already recorded. Call AFTER successful fulfillment — fulfillment is
 * idempotent, so the worst case of a crash in between is one harmless redo.
 */
export async function recordStripeEvent(eventId: string, type: string): Promise<boolean> {
  const svc = billingServiceClient();
  const { data, error } = await svc
    .from("stripe_events")
    .upsert({ id: eventId, type }, { onConflict: "id", ignoreDuplicates: true })
    .select();
  if (error) throw new Error(`stripe_events insert failed: ${error.message}`);
  return !data || data.length === 0;
}
