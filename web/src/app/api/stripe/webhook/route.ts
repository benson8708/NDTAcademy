// Stripe webhook — the authoritative fulfillment path. Signature-verified
// against STRIPE_WEBHOOK_SECRET (raw body, constant-time HMAC check inside
// the SDK). Returns 500 on handler errors so Stripe retries; fulfillment is
// idempotent so retries and replays are harmless.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import {
  fulfillCheckoutSession,
  handleChargeRefunded,
  recordStripeEvent,
} from "@/lib/billing/fulfill";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return new Response("stripe is not configured", { status: 503 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing stripe-signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return new Response("signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const result = await fulfillCheckoutSession(event.data.object);
        if (!result.ok) console.warn(`stripe webhook: ${event.type} skipped — ${result.reason}`);
        break;
      }
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        // Nothing was granted at session creation; no entitlement to unwind.
        console.warn(`stripe webhook: async payment failed for ${event.data.object.id}`);
        break;
      default:
        break;
    }
    await recordStripeEvent(event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`stripe webhook error (${event.type} ${event.id})`, err);
    return new Response("webhook handler error", { status: 500 });
  }
}
