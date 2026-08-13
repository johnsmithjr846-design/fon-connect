import type Stripe from "stripe";
import { PLAN_BY_PRICE } from "@/lib/billing/prices";
import { getPlan } from "@/lib/billing/plans";

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

/**
 * Recopie immédiatement l'état Stripe dans la base, sans attendre le webhook :
 * indispensable après un changement d'offre ou un retour de paiement.
 */
export async function syncStripeSubscriptions(
  stripe: Stripe,
  userId: string,
): Promise<string[]> {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const found = await stripe.subscriptions.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 100,
  });

  const activePlans: string[] = [];
  for (const subscription of found.data) {
    const row = subscriptionRow(subscription, userId);
    if (!row) continue;
    await supabaseAdmin
      .from("subscriptions")
      .upsert(row as never, { onConflict: "provider_ref" });
    if (row.status === "ACTIVE") activePlans.push(row.plan_id);
  }
  return activePlans;
}
