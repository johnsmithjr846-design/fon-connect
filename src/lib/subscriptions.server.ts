import type Stripe from "stripe";
import { PLAN_BY_PRICE } from "@/lib/billing/prices";
import { getPlan, expiresAtFor } from "@/lib/billing/plans";

const GRACE_DAYS = 7;

function isoOrNull(seconds?: number | null): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

export function planIdFromSubscription(subscription: Stripe.Subscription): string | null {
  const meta = subscription.metadata?.["planId"];
  if (meta && getPlan(meta)) return meta;
  const item = subscription.items?.data?.[0];
  const lookup =
    (item?.price as { lookup_key?: string } | undefined)?.lookup_key ??
    item?.price?.metadata?.["lovable_external_id"] ??
    null;
  return lookup ? (PLAN_BY_PRICE[lookup] ?? null) : null;
}

export function subscriptionRow(subscription: Stripe.Subscription, userId: string) {
  const planId = planIdFromSubscription(subscription);
  if (!planId) return null;
  const now = new Date();
  const item = subscription.items?.data?.[0];
  const periodEnd =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (subscription as unknown as { current_period_end?: number }).current_period_end;
  const pastDue = ["past_due", "unpaid"].includes(subscription.status);
  const stopped = ["canceled", "incomplete_expired"].includes(subscription.status);

  return {
    user_id: userId,
    plan_id: planId,
    provider: "stripe",
    provider_ref: subscription.id,
    status: stopped ? "CANCELLED" : "ACTIVE",
    start_at: isoOrNull(subscription.start_date) ?? now.toISOString(),
    expires_at: stopped ? now.toISOString() : isoOrNull(periodEnd),
    auto_renew: !stopped && !subscription.cancel_at_period_end,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    payment_state: stopped ? "cancelled" : pastDue ? "past_due" : "ok",
    grace_until: pastDue
      ? new Date(now.getTime() + GRACE_DAYS * 86_400_000).toISOString()
      : null,
    updated_at: now.toISOString(),
  };
}

/** Retrouve le client du prestataire lié à l'utilisateur (index de recherche + e-mail). */
async function findCustomerIds(stripe: Stripe, userId: string): Promise<string[]> {
  try {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 10,
    });
    return found.data.map((c) => c.id);
  } catch {
    return [];
  }
}

/**
 * Recopie immédiatement l'état Stripe dans la base, sans attendre le webhook :
 * indispensable après un achat en mode test, un changement d'offre ou un retour de paiement.
 * Couvre les abonnements ET les achats ponctuels (pass 24 h / 7 jours, achat unique).
 */
export async function syncStripeSubscriptions(
  stripe: Stripe,
  userId: string,
): Promise<string[]> {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const activePlans: string[] = [];
  const seen = new Set<string>();

  const upsert = async (row: { provider_ref: string; status: string; plan_id: string } | null) => {
    if (!row || seen.has(row.provider_ref)) return;
    seen.add(row.provider_ref);
    await supabaseAdmin
      .from("subscriptions")
      .upsert(row as never, { onConflict: "provider_ref" });
    if (row.status === "ACTIVE") activePlans.push(row.plan_id);
  };

  const customerIds = await findCustomerIds(stripe, userId);

  // 1) Abonnements listés par client : disponibles immédiatement (l'index de recherche, lui, est différé).
  const subscriptions: Stripe.Subscription[] = [];
  for (const customer of customerIds) {
    const list = await stripe.subscriptions.list({ customer, status: "all", limit: 100 });
    subscriptions.push(...list.data);
  }
  try {
    const found = await stripe.subscriptions.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 100,
    });
    for (const sub of found.data) {
      if (!subscriptions.some((s) => s.id === sub.id)) subscriptions.push(sub);
    }
  } catch {
    // L'index de recherche peut être indisponible : la liste par client suffit.
  }

  for (const subscription of subscriptions) {
    await upsert(subscriptionRow(subscription, userId));
  }

  // 2) Achats ponctuels : sessions de paiement réglées, non reconductibles.
  for (const customer of customerIds) {
    const sessions = await stripe.checkout.sessions.list({ customer, limit: 50 });
    for (const session of sessions.data) {
      if (session.mode !== "payment") continue;
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        continue;
      }
      const row = oneTimeRow(session, userId);
      await upsert(row);
    }
  }

  return activePlans;
}

/** Ligne de droits issue d'un achat ponctuel (pass 24 h, pass 7 jours, achat unique). */
function oneTimeRow(session: Stripe.Checkout.Session, userId: string) {
  const meta = session.metadata ?? {};
  const planId =
    (meta["planId"] && getPlan(meta["planId"]) ? meta["planId"] : null) ??
    (meta["priceId"] ? (PLAN_BY_PRICE[meta["priceId"]] ?? null) : null);
  if (!planId) return null;
  const plan = getPlan(planId);
  if (!plan) return null;

  const start = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000);
  const expires = expiresAtFor(plan, start);
  const now = new Date();

  return {
    user_id: userId,
    plan_id: planId,
    provider: "stripe",
    provider_ref: session.id,
    status: "ACTIVE" as const,
    start_at: start.toISOString(),
    expires_at: expires?.toISOString() ?? null,
    auto_renew: false,
    cancel_at_period_end: true,
    payment_state: "ok",
    grace_until: null,
    updated_at: now.toISOString(),
  };
}

