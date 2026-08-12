import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlan } from "@/lib/billing/plans";

export type ActiveSubscription = {
  id: string;
  plan_id: string;
  status: string;
  start_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
};

export type Entitlements = {
  lessonsPro: boolean;
  translationPremium: boolean;
  unlimitedHearts: boolean;
  plans: string[];
  subscriptions: ActiveSubscription[];
};

export const FREE_ENTITLEMENTS: Entitlements = {
  lessonsPro: false,
  translationPremium: false,
  unlimitedHearts: false,
  plans: [],
  subscriptions: [],
};

/** Agrège les droits de tous les achats valides, sans double comptage. */
export async function computeEntitlements(
  supabase: SupabaseClient<never>,
  userId: string,
): Promise<Entitlements> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, plan_id, status, start_at, expires_at, auto_renew, cancel_at_period_end")
    .eq("user_id", userId)
    .in("status", ["ACTIVE", "CANCELLED"])
    .order("created_at", { ascending: false });
  if (error) return FREE_ENTITLEMENTS;

  const now = Date.now();
  const active = ((data ?? []) as ActiveSubscription[]).filter(
    (s) => !s.expires_at || Date.parse(s.expires_at) > now,
  );

  const result: Entitlements = {
    lessonsPro: false,
    translationPremium: false,
    unlimitedHearts: false,
    plans: [],
    subscriptions: active,
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
