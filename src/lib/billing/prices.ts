import type { PlanId } from "./plans";

/** Identifiants de prix (lookup keys) du système de paiement. */
export const PRICE_BY_PLAN: Record<Exclude<PlanId, "FREE">, string> = {
  LESSONS_PRO_MONTHLY: "lessons_pro_monthly",
  PRO_TRANSLATION_LESSONS_MONTHLY: "pro_translation_lessons_monthly",
  TRAVEL_24H: "travel_24h",
  TRAVEL_7D: "travel_7d",
  TRANSLATION_PREMIUM_YEARLY: "translation_premium_yearly",
  GOLD_MONTHLY: "gold_monthly",
  GOLD_YEARLY: "gold_yearly",
};

/** Variante sans reconduction automatique (Traduc Premium). */
export const ONE_OFF_PRICE_BY_PLAN: Partial<Record<PlanId, string>> = {
  TRANSLATION_PREMIUM_YEARLY: "translation_premium_yearly_once",
};

export const PLAN_BY_PRICE: Record<string, PlanId> = {
  lessons_pro_monthly: "LESSONS_PRO_MONTHLY",
  pro_translation_lessons_monthly: "PRO_TRANSLATION_LESSONS_MONTHLY",
  travel_24h: "TRAVEL_24H",
  travel_7d: "TRAVEL_7D",
  translation_premium_yearly: "TRANSLATION_PREMIUM_YEARLY",
  translation_premium_yearly_once: "TRANSLATION_PREMIUM_YEARLY",
  gold_monthly: "GOLD_MONTHLY",
  gold_yearly: "GOLD_YEARLY",
};

export function priceIdFor(planId: PlanId, autoRenew = true): string | undefined {
  if (planId === "FREE") return undefined;
  if (!autoRenew && ONE_OFF_PRICE_BY_PLAN[planId]) return ONE_OFF_PRICE_BY_PLAN[planId];
  return PRICE_BY_PLAN[planId];
}
