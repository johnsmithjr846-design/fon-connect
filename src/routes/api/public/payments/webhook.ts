import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { PLAN_BY_PRICE } from "@/lib/billing/prices";
import { getPlan, expiresAtFor } from "@/lib/billing/plans";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

function planIdFrom(metadata: Record<string, string> | undefined, priceLookup?: string | null) {
  const fromMeta = metadata?.["planId"];
  if (fromMeta && getPlan(fromMeta)) return fromMeta;
  if (priceLookup && PLAN_BY_PRICE[priceLookup]) return PLAN_BY_PRICE[priceLookup];
  return null;
}

function isoOrNull(seconds?: number | null): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

const GRACE_DAYS = 7;
const PURCHASE_XP_BONUS = 100;

/** Récompenses du premier achat : badge « Soutien » + bonus d'XP, une seule fois. */
async function grantPurchaseRewards(userId: string) {
  const db = getSupabase();
  const { data: existing } = await db
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId)
    .eq("badge_id", "supporter")
    .maybeSingle();
  if (existing) return;

  await db.from("user_badges").insert({ user_id: userId, badge_id: "supporter" } as never);

  const { data: stats } = await db
    .from("user_stats")
    .select("xp_total")
    .eq("user_id", userId)
    .maybeSingle();
  const xpTotal = ((stats as { xp_total?: number } | null)?.xp_total ?? 0) + PURCHASE_XP_BONUS;
  await db
    .from("user_stats")
    .upsert({ user_id: userId, xp_total: xpTotal } as never, { onConflict: "user_id" });
}

async function upsertSubscription(row: Record<string, unknown>) {
  await getSupabase()
    .from("subscriptions")
    .upsert(row as never, { onConflict: "provider_ref" });
}

async function handleSubscriptionEvent(subscription: any, canceled = false) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  const item = subscription.items?.data?.[0];
  const lookup = item?.price?.lookup_key ?? item?.price?.metadata?.lovable_external_id ?? null;
  const planId = planIdFrom(subscription.metadata, lookup);
  if (!planId) return;

  const now = new Date();
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const pastDue = ["past_due", "unpaid"].includes(subscription.status);
  const stopped =
    canceled || ["canceled", "incomplete_expired"].includes(subscription.status);

  // Résiliation : coupure immédiate des droits.
  const expiresAt = stopped ? now.toISOString() : isoOrNull(periodEnd);

  await upsertSubscription({
    user_id: userId,
    plan_id: planId,
    provider: "stripe",
    provider_ref: subscription.id,
    status: stopped ? "CANCELLED" : "ACTIVE",
    start_at: isoOrNull(subscription.start_date) ?? now.toISOString(),
    expires_at: expiresAt,
    auto_renew: !stopped && !subscription.cancel_at_period_end,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    payment_state: stopped ? "cancelled" : pastDue ? "past_due" : "ok",
    grace_until: pastDue
      ? new Date(now.getTime() + GRACE_DAYS * 86_400_000).toISOString()
      : null,
    updated_at: now.toISOString(),
  });

  if (!stopped && !pastDue) await grantPurchaseRewards(userId);
}

async function handleCheckoutCompleted(session: any) {
  if (session.payment_status === "unpaid") return;
  if (session.mode !== "payment") return; // les abonnements arrivent par customer.subscription.*
  const userId = session.metadata?.userId;
  const planId = planIdFrom(session.metadata, session.metadata?.priceId ?? null);
  if (!userId || !planId) return;
  const plan = getPlan(planId);
  if (!plan) return;
  const now = new Date();
  await upsertSubscription({
    user_id: userId,
    plan_id: planId,
    provider: "stripe",
    provider_ref: session.id,
    status: "ACTIVE",
    start_at: now.toISOString(),
    expires_at: expiresAtFor(plan, now)?.toISOString() ?? null,
    auto_renew: false,
    cancel_at_period_end: true,
    payment_state: "ok",
    grace_until: null,
    updated_at: now.toISOString(),
  });
  await grantPurchaseRewards(userId);
}

/** Échec de prélèvement : 7 jours de grâce, l'accès reste ouvert. */
async function handlePaymentFailed(invoice: any) {
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionId) return;
  const now = new Date();
  await getSupabase()
    .from("subscriptions")
    .update({
      payment_state: "past_due",
      grace_until: new Date(now.getTime() + GRACE_DAYS * 86_400_000).toISOString(),
      updated_at: now.toISOString(),
    } as never)
    .eq("provider_ref", subscriptionId);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionEvent(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event.data.object, true);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(event.data.object);
      break;
    default:
      console.log("Unhandled payment event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
