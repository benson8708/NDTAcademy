// Server-only Stripe client. The secret key never ships to the browser —
// hosted Checkout means the client needs no Stripe JS or publishable key.
import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return /^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY ?? "");
}

/** True while STRIPE_SECRET_KEY / FREE_BETA leave the catalog free. */
export function isFreeBeta(): boolean {
  return process.env.FREE_BETA === "true";
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      appInfo: { name: "ndtacademy-web", url: process.env.NEXT_PUBLIC_SITE_URL },
    });
  }
  return cached;
}
