import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlan } from "@/lib/billing/plans";
import {
  FREE_ENTITLEMENTS,
  type ActiveSubscription,
  type Entitlements,
} from "@/lib/billing/entitlements";

export type { ActiveSubscription, Entitlements };
export { FREE_ENTITLEMENTS };

/** Agrège les droits de tous les achats valides, sans double comptage. */
export async function computeEntitlements(
  supabase: SupabaseClient<never>,
  userId: string,
): Promise<Entitlements> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, plan_id, status, start_at, expires_at, auto_renew, cancel_at_period_end, payment_state, grace_until")
    .eq("user_id", userId)
    .in("status", ["ACTIVE", "CANCELLED"])
    .order("created_at", { ascending: false });
  if (error) return FREE_ENTITLEMENTS;

  const now = Date.now();
  const active = ((data ?? []) as ActiveSubscription[]).filter((s) => {
    // Incident de paiement : l'accès reste ouvert jusqu'à la fin du délai de grâce.
    if (s.payment_state === "past_due") {
      return Boolean(s.grace_until) && Date.parse(s.grace_until!) > now;
    }
    return !s.expires_at || Date.parse(s.expires_at) > now;
  });

  const result: Entitlements = {
    lessonsPro: false,
    translationPremium: false,
    unlimitedHearts: false,
    arNavigation: false,
    plans: [],
    subscriptions: active,
    paymentIssue: active.some((s) => s.payment_state === "past_due"),
    graceUntil:
      active
        .filter((s) => s.payment_state === "past_due" && s.grace_until)
        .map((s) => s.grace_until!)
        .sort()
        .at(-1) ?? null,
  };
  for (const sub of active) {
    const plan = getPlan(sub.plan_id);
    if (!plan) continue;
    result.plans.push(plan.id);
    result.lessonsPro ||= plan.entitlements.lessonsPro;
    result.translationPremium ||= plan.entitlements.translationPremium;
    result.unlimitedHearts ||= plan.unlimitedHearts;
  }
  return result;
}
