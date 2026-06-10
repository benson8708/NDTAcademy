#!/usr/bin/env node
/**
 * Idempotent Stripe catalog bootstrap. Creates/updates the products and
 * prices defined in src/data/stripe-catalog.json, keyed by price lookup_key
 * (the app resolves prices the same way, so no IDs are stored anywhere).
 *
 *   node scripts/stripe-bootstrap.mjs                 # sync catalog (test mode)
 *   node scripts/stripe-bootstrap.mjs --webhook https://ndtacademy.com/api/stripe/webhook
 *                                                     # + create/update webhook endpoint,
 *                                                     #   prints STRIPE_WEBHOOK_SECRET once
 *
 * Reads STRIPE_SECRET_KEY from the environment or ../.env.local.
 * Refuses live-mode keys unless --allow-live is passed.
 *
 * Safe to re-run any time: price changes in the JSON create a new price and
 * move the lookup_key to it (transfer_lookup_key); the old price is
 * deactivated so history/receipts stay intact.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const here = path.dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(path.join(here, "..", "src", "data", "stripe-catalog.json"), "utf8"));
const args = process.argv.slice(2);
const allowLive = args.includes("--allow-live");
const webhookUrl = args.includes("--webhook") ? args[args.indexOf("--webhook") + 1] : null;

function loadKey() {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  const envPath = path.join(here, "..", ".env.local");
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, "utf8")
      .split("\n")
      .find((l) => l.startsWith("STRIPE_SECRET_KEY=") && l.split("=")[1]?.trim());
    if (line) return line.slice("STRIPE_SECRET_KEY=".length).trim();
  }
  console.error("STRIPE_SECRET_KEY not set (env or web/.env.local). Get a test key: https://dashboard.stripe.com/test/apikeys");
  process.exit(1);
}

const key = loadKey();
if (/_live_/.test(key) && !allowLive) {
  console.error("Refusing to run against LIVE mode without --allow-live.");
  process.exit(1);
}
const stripe = new Stripe(key, { appInfo: { name: "ndtacademy-bootstrap" } });

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "charge.refunded",
];

async function ensureItem({ lookupKey, name, description, amount }, itemId) {
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1, expand: ["data.product"] });
  const existing = data[0];

  if (!existing) {
    const product = await stripe.products.create({
      name,
      description,
      metadata: { app: "ndtacademy", item: itemId },
      default_price_data: { currency: catalog.currency, unit_amount: amount, lookup_key: lookupKey },
    });
    return { itemId, action: "created", amount, priceId: product.default_price };
  }

  const product = existing.product;
  if (existing.unit_amount === amount && existing.currency === catalog.currency && existing.active) {
    if (product.name !== name) await stripe.products.update(product.id, { name, description });
    return { itemId, action: "ok", amount, priceId: existing.id };
  }

  // Price changed: new price takes over the lookup_key, old one is retired.
  const fresh = await stripe.prices.create({
    product: product.id,
    currency: catalog.currency,
    unit_amount: amount,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
  });
  await stripe.prices.update(existing.id, { active: false });
  await stripe.products.update(product.id, { name, description, default_price: fresh.id });
  return { itemId, action: `repriced ${existing.unit_amount}→${amount}`, amount, priceId: fresh.id };
}

async function ensureWebhook(url) {
  const { data } = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = data.find((w) => w.url === url);
  if (existing) {
    await stripe.webhookEndpoints.update(existing.id, { enabled_events: WEBHOOK_EVENTS });
    return { id: existing.id, secret: null }; // secret only shown at creation
  }
  const created = await stripe.webhookEndpoints.create({
    url,
    enabled_events: WEBHOOK_EVENTS,
    description: "NDT Academy entitlements (created by stripe-bootstrap.mjs)",
  });
  return { id: created.id, secret: created.secret };
}

const mode = /_test_/.test(key) ? "TEST" : "LIVE";
console.log(`Stripe bootstrap — ${mode} mode\n`);

const results = [];
for (const [courseId, item] of Object.entries(catalog.courses)) {
  results.push(await ensureItem(item, `course_${courseId}`));
}
results.push(await ensureItem(catalog.seat, "seat"));

for (const r of results) {
  console.log(`${r.action.padEnd(12)} ${r.itemId.padEnd(14)} $${(r.amount / 100).toFixed(2).padStart(8)}  ${r.priceId}`);
}

if (webhookUrl) {
  const w = await ensureWebhook(webhookUrl);
  console.log(`\nwebhook ${w.id} → ${webhookUrl}`);
  if (w.secret) {
    console.log(`STRIPE_WEBHOOK_SECRET=${w.secret}`);
    console.log("^ shown only once — put it in the deployment env now.");
  } else {
    console.log("endpoint already existed — signing secret unchanged (roll it in the Dashboard if lost).");
  }
}

console.log(`\nDone. ${results.filter((r) => r.action !== "ok").length} change(s).`);
console.log("Local webhook testing: stripe listen --forward-to localhost:3000/api/stripe/webhook");
