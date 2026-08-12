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

  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const status = canceled
    ? "CANCELLED"
    : ["active", "trialing", "past_due"].includes(subscription.status)
      ? "ACTIVE"
      : "CANCELLED";

  await upsertSubscription({
    user_id: userId,
    plan_id: planId,
    provider: "stripe",
    provider_ref: subscription.id,
    status,
    start_at: isoOrNull(subscription.start_date) ?? new Date().toISOString(),
    expires_at: isoOrNull(periodEnd),
    auto_renew: !subscription.cancel_at_period_end,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  });
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
    updated_at: now.toISOString(),
  });
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
