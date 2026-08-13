/** Promotions applicables côté client et côté serveur (calcul identique). */
export type PublicPromotion = {
  id: string;
  title: string;
  description: string;
  plan_ids: string[];
  discount_type: string;
  discount_value: number;
  code: string | null;
  ends_at: string | null;
};

/** Une promo sans offre précisée s'applique à toutes les offres payantes. */
export function promoAppliesTo(promo: PublicPromotion, planId: string): boolean {
  if (planId === "FREE") return false;
  return promo.plan_ids.length === 0 || promo.plan_ids.includes(planId);
}

export function discountedCents(promo: PublicPromotion, priceCents: number): number {
  const off =
    promo.discount_type === "percent"
      ? Math.round((priceCents * promo.discount_value) / 100)
      : Math.round(promo.discount_value * 100);
  return Math.max(0, priceCents - Math.max(0, off));
}

/** Meilleure remise pour une offre donnée (la moins chère pour le client). */
export function bestPromoFor(
  promos: PublicPromotion[],
  planId: string,
  priceCents: number,
): { promo: PublicPromotion; finalCents: number } | null {
  let best: { promo: PublicPromotion; finalCents: number } | null = null;
  for (const promo of promos) {
    if (!promoAppliesTo(promo, planId)) continue;
    const finalCents = discountedCents(promo, priceCents);
    if (finalCents >= priceCents) continue;
    if (!best || finalCents < best.finalCents) best = { promo, finalCents };
  }
  return best;
}
