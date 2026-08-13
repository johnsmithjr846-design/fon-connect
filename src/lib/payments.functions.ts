import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

import { bestPromoFor } from "@/lib/billing/promo";
import { getPlan } from "@/lib/billing/plans";

type CheckoutSessionResult = { clientSecret: string } | { error: string };
type PortalSessionResult = { url: string } | { error: string };

/**
 * Traduit une promotion FonConnect en bon de réduction chez le prestataire.
 * L'identifiant est déterministe : la même promo réutilise le même bon.
 */
async function couponForPlan(
  stripe: ReturnType<typeof createStripeClient>,
  options: { userId: string; planId: string; recurring: boolean },
): Promise<string | null> {
  const plan = getPlan(options.planId);
  if (!plan || plan.priceCents <= 0) return null;

  const { fetchUserPromotions } = await import("@/lib/promotions.server");
  const promos = await fetchUserPromotions(options.userId);
  const best = bestPromoFor(promos, options.planId, plan.priceCents);
  if (!best) return null;

  const { promo } = best;
  const duration = options.recurring ? "forever" : "once";
  const couponId = `fc_${promo.id.replace(/-/g, "").slice(0, 24)}_${promo.discount_type}_${promo.discount_value}_${duration}`;

  try {
    const existing = await stripe.coupons.retrieve(couponId);
    if (existing && !existing.deleted) return couponId;
  } catch {
    // Le bon n'existe pas encore : on le crée ci-dessous.
  }

  try {
    await stripe.coupons.create({
      id: couponId,
      name: (promo.title || "Promotion FonConnect").slice(0, 40),
      duration,
      ...(promo.discount_type === "percent"
        ? { percent_off: Math.min(100, Math.max(1, promo.discount_value)) }
        : { amount_off: Math.round(promo.discount_value * 100), currency: "eur" }),
      metadata: { promotionId: promo.id },
    });
    return couponId;
  } catch {
    return null;
  }
}

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0]!.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0]!;
      if (options.userId && customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { priceId: string; planId: string; returnUrl: string; environment: StripeEnv }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
      if (!/^[A-Z0-9_]+$/.test(data.planId)) throw new Error("Invalid planId");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    try {
      const { supabase, userId } = context;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      if (!prices.data.length) throw new Error("Offre introuvable");
      const stripePrice = prices.data[0]!;
      const isRecurring = stripePrice.type === "recurring";

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId,
      });

      let productDescription: string | undefined;
      if (!isRecurring) {
        const productId =
          typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
        const product = await stripe.products.retrieve(productId);
        productDescription = (product as { name?: string }).name;
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        managed_payments: { enabled: true },
        ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
        metadata: {
          userId,
          planId: data.planId,
          priceId: data.priceId,
          managed_payments: "true",
        },
        ...(isRecurring && {
          subscription_data: { metadata: { userId, planId: data.planId, priceId: data.priceId } },
        }),
      } as Parameters<typeof stripe.checkout.sessions.create>[0]);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PortalSessionResult> => {
    const { supabase, userId } = context;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    try {
      const stripe = createStripeClient(data.environment);
      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId,
      });
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type ActionResult = { ok: true } | { error: string };

/** Recherche l'abonnement Stripe en cours de l'utilisateur. */
async function findActiveSubscription(
  stripe: ReturnType<typeof createStripeClient>,
  userId: string,
) {
  const found = await stripe.subscriptions.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 20,
  });
  return (
    found.data.find((s) => ["active", "trialing", "past_due"].includes(s.status)) ?? null
  );
}

/** Résiliation : coupure immédiate, sans attendre la fin de la période. */
export const cancelSubscriptionNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<ActionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const subscription = await findActiveSubscription(stripe, context.userId);
      if (!subscription) throw new Error("Aucun abonnement en cours");
      await stripe.subscriptions.cancel(subscription.id, { prorate: true });
      return { ok: true };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Changement d'offre immédiat, montant ajusté au prorata. */
export const changePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; planId: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    if (!/^[A-Z0-9_]+$/.test(data.planId)) throw new Error("Invalid planId");
    return data;
  })
  .handler(async ({ data, context }): Promise<ActionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const subscription = await findActiveSubscription(stripe, context.userId);
      if (!subscription) throw new Error("Aucun abonnement en cours");

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const price = prices.data[0];
      if (!price || price.type !== "recurring") throw new Error("Offre non compatible");

      const item = subscription.items.data[0]!;
      if (item.price.id === price.id) return { ok: true };

      await stripe.subscriptions.update(subscription.id, {
        items: [{ id: item.id, price: price.id }],
        proration_behavior: "create_prorations",
        payment_behavior: "pending_if_incomplete",
        metadata: {
          ...subscription.metadata,
          planId: data.planId,
          priceId: data.priceId,
        },
      });
      return { ok: true };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
