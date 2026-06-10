"use server";
// Billing server actions — create hosted Checkout Sessions and Customer
// Portal sessions, then redirect. The browser never sees a Stripe key; the
// only client surface is a <form> post.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { courseCatalogItem, priceIdForLookupKey, SEAT_ITEM } from "@/lib/stripe/catalog";
import { getCourseAccess } from "@/lib/billing/access";
import { getOrCreateStripeCustomer, APP_METADATA_TAG } from "@/lib/billing/fulfill";
import { courseById, slugForCourse } from "@/lib/curriculum";

const MAX_SEATS_PER_CHECKOUT = 500;

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function requireUser(nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return { supabase, user };
}

export async function startCourseCheckout(courseId: string): Promise<void> {
  const course = courseById(courseId);
  const item = courseCatalogItem(courseId);
  if (!course || !item) redirect("/courses");
  const slug = slugForCourse(course.id);
  const { supabase, user } = await requireUser(`/learn/${slug}`);

  if (!isStripeConfigured()) redirect(`/learn/${slug}?billing=unconfigured`);

  const access = await getCourseAccess(supabase, user.id, course.id);
  if (access.ok) redirect(`/learn/${slug}`); // nothing to buy

  let checkoutUrl: string;
  try {
    const [{ data: profile }, priceId] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      priceIdForLookupKey(item.lookupKey),
    ]);
    const customer = await getOrCreateStripeCustomer(user.id, user.email, profile?.full_name);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { app: APP_METADATA_TAG, kind: "course", user_id: user.id, course_id: course.id },
      success_url: `${siteUrl()}/learn/${slug}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/courses/${slug}?billing=cancelled`,
    });
    if (!session.url) throw new Error("checkout session has no url");
    checkoutUrl = session.url;
  } catch (err) {
    console.error("startCourseCheckout failed", err);
    redirect(`/learn/${slug}?billing=error`);
  }
  redirect(checkoutUrl);
}

export async function startSeatCheckout(formData: FormData): Promise<void> {
  const orgId = String(formData.get("org_id") ?? "");
  const seats = Math.min(
    Math.max(Math.round(Number(formData.get("seats")) || 0), 1),
    MAX_SEATS_PER_CHECKOUT,
  );
  if (!orgId) redirect("/dashboard/company");
  const { supabase, user } = await requireUser("/dashboard/company");

  if (!isStripeConfigured()) redirect("/dashboard/company?billing=unconfigured");

  // Caller must be an admin of this org (RLS-scoped read proves it).
  const { data: adminRow } = await supabase
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!adminRow) redirect("/dashboard/company");

  let checkoutUrl: string;
  try {
    const [{ data: profile }, priceId] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      priceIdForLookupKey(SEAT_ITEM.lookupKey),
    ]);
    const customer = await getOrCreateStripeCustomer(user.id, user.email, profile?.full_name);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: seats }],
      allow_promotion_codes: true,
      metadata: {
        app: APP_METADATA_TAG,
        kind: "seat_pack",
        user_id: user.id,
        org_id: orgId,
        seats: String(seats),
      },
      success_url: `${siteUrl()}/dashboard/company?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/dashboard/company?billing=cancelled`,
    });
    if (!session.url) throw new Error("checkout session has no url");
    checkoutUrl = session.url;
  } catch (err) {
    console.error("startSeatCheckout failed", err);
    redirect("/dashboard/company?billing=error");
  }
  redirect(checkoutUrl);
}

/** Stripe Customer Portal — receipts, payment methods, billing details. */
export async function openBillingPortal(returnPath: string): Promise<void> {
  const safeReturn = returnPath.startsWith("/") ? returnPath : "/dashboard";
  const { supabase, user } = await requireUser(safeReturn);

  if (!isStripeConfigured()) redirect(`${safeReturn}?billing=unconfigured`);

  // RLS lets users read their own customer mapping; no purchases yet → no portal.
  const { data: customerRow } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!customerRow) redirect(`${safeReturn}?billing=nocustomer`);

  let portalUrl: string;
  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerRow.stripe_customer_id,
      return_url: `${siteUrl()}${safeReturn}`,
    });
    portalUrl = portal.url;
  } catch (err) {
    console.error("openBillingPortal failed", err);
    redirect(`${safeReturn}?billing=error`);
  }
  redirect(portalUrl);
}
