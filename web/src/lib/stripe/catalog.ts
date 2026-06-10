// Pricing catalog — mirrors web/src/data/stripe-catalog.json (single source of
// truth shared with scripts/stripe-bootstrap.mjs, which creates the Stripe
// products/prices). Prices are resolved at checkout time by lookup_key, so no
// Stripe IDs live in code or env.
import "server-only";
import catalog from "@/data/stripe-catalog.json";
import { getStripe } from "./server";

interface CatalogEntry {
  lookupKey: string;
  name: string;
  amount: number; // cents
}

export const CURRENCY: string = catalog.currency;
export const SEAT_ITEM: CatalogEntry = catalog.seat;

export function courseCatalogItem(courseId: string): CatalogEntry | null {
  const entry = (catalog.courses as Record<string, CatalogEntry>)[courseId];
  return entry ?? null;
}

export const fmtUsd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });

// lookup_key → price id, cached per server process.
const priceIdCache = new Map<string, string>();

export async function priceIdForLookupKey(lookupKey: string): Promise<string> {
  const hit = priceIdCache.get(lookupKey);
  if (hit) return hit;
  const stripe = getStripe();
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = data[0];
  if (!price) {
    throw new Error(
      `No active Stripe price with lookup_key "${lookupKey}" — run \`node scripts/stripe-bootstrap.mjs\``,
    );
  }
  priceIdCache.set(lookupKey, price.id);
  return price.id;
}
