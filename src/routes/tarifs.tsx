import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Crown, GraduationCap, Languages, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { CheckoutDialog, type CheckoutRequest } from "@/components/payments/CheckoutDialog";
import { PaymentIssueBanner } from "@/components/payments/PaymentIssueBanner";
import { PromoBanner } from "@/components/payments/PromoBanner";
import { changePlan } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usePageView } from "@/hooks/useSiteData";
import {
  PAID_PLANS,
  PLANS,
  formatPrice,
  planDuration,
  type Plan,
} from "@/lib/billing/plans";
import { priceIdFor } from "@/lib/billing/prices";

export const Route = createFileRoute("/tarifs")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Tarifs FonConnect — offres, pass voyage et Premium GOLD" },
      {
        name: "description",
        content:
          "Comparez les offres FonConnect : gratuit, Leçons Pro, Pro Traduction, pass voyage 24 h et 7 jours, Traduc Premium et Premium GOLD.",
      },
      { property: "og:title", content: "Tarifs et abonnements FonConnect" },
      {
        property: "og:description",
        content:
          "Toutes les offres FonConnect pour apprendre le fon et traduire sans limite, avec le détail des prix et des droits inclus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/tarifs" }],
  }),
});

const FAMILY_ICON = {
  free: Sparkles,
  learning: GraduationCap,
  translation: Languages,
  gold: Crown,
} as const;

function PricingPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { user } = useAuthUser();
  const { entitlements, refetch } = useEntitlements();
  const [autoRenew, setAutoRenew] = useState(true);
  const [checkout, setCheckout] = useState<CheckoutRequest | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  usePageView("/tarifs");

  const free = PLANS.find((p) => p.id === "FREE")!;

  // Un abonnement récurrent est déjà en cours : le changement se fait au prorata.
  const currentRecurring = entitlements.subscriptions.find((s) => s.auto_renew);

  const start = async (plan: Plan) => {
    const priceId = priceIdFor(plan.id, plan.renewalOptional ? autoRenew : true);
    if (!priceId) return;

    if (currentRecurring && plan.recurring && currentRecurring.plan_id !== plan.id) {
      setSwitching(plan.id);
      try {
        const result = await changePlan({
          data: { priceId, planId: plan.id, environment: getStripeEnvironment() },
        });
        if ("error" in result) throw new Error(result.error);
        toast.success(
          en
            ? "Plan changed. The amount is adjusted automatically."
            : "Offre modifiée. Le montant est ajusté au prorata.",
        );
        await refetch();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erreur");
      } finally {
        setSwitching(null);
      }
      return;
    }

    setCheckout({
      priceId,
      planId: plan.id,
      title: en ? plan.nameEn : plan.name,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PaymentTestModeBanner />
      <SiteHeader />
      <PaymentIssueBanner />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {en ? "FonConnect plans and pricing" : "Offres et tarifs FonConnect"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {en
            ? "Prices include VAT. Every detail below is shown before payment: what is included, how long it lasts and whether it renews."
            : "Prix TTC. Tout est indiqué avant le paiement : ce qui est inclus, la durée et la reconduction éventuelle."}
        </p>

        <PromoBanner />

        <PlanCard plan={free} en={en} current={!entitlements.plans.length} />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {PAID_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              en={en}
              current={entitlements.plans.includes(plan.id)}
              action={
                <div className="mt-4 space-y-3">
                  {plan.renewalOptional ? (
                    <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
                      <span>
                        {en ? "Automatic renewal each year" : "Renouvellement automatique chaque année"}
                      </span>
                      <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                    </label>
                  ) : null}
                  {user ? (
                    <Button
                      className="w-full"
                      disabled={switching !== null || entitlements.plans.includes(plan.id)}
                      onClick={() => void start(plan)}
                    >
                      {entitlements.plans.includes(plan.id)
                        ? en
                          ? "Your current plan"
                          : "Votre offre actuelle"
                        : currentRecurring && plan.recurring
                          ? en
                            ? "Switch to this plan"
                            : "Passer à cette offre"
                          : en
                            ? "Choose this plan"
                            : "Choisir cette offre"}
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant="secondary">
                      <Link to="/auth">
                        {en ? "Sign in to subscribe" : "Se connecter pour souscrire"}
                      </Link>
                    </Button>
                  )}
                </div>
              }
            />
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {en ? "Good to know before paying" : "À savoir avant de payer"}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              {en
                ? "Travel passes are one-off purchases: they expire automatically and never renew."
                : "Les pass voyage sont des achats ponctuels : ils expirent automatiquement, sans reconduction."}
            </li>
            <li>
              {en
                ? "Monthly and yearly plans renew automatically until you cancel. Cancelling stops access immediately, with a prorated refund of the unused time."
                : "Les offres mensuelles et annuelles se renouvellent jusqu'à résiliation. La résiliation coupe l'accès immédiatement, avec remboursement au prorata du temps non utilisé."}
            </li>
            <li>
              {en
                ? "Changing plan takes effect immediately and the amount is adjusted automatically. If a renewal payment fails, you keep access for 7 more days."
                : "Un changement d'offre prend effet immédiatement, le montant est ajusté au prorata. Si un renouvellement échoue, l'accès reste ouvert 7 jours."}
            </li>
          </ul>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/mon-abonnement">{en ? "My subscription" : "Mon abonnement"}</Link>
          </Button>
        </section>
      </main>
      <CheckoutDialog request={checkout} onClose={() => setCheckout(null)} />
    </div>
  );
}

function PlanCard({
  plan,
  en,
  current,
  action,
  promo,
}: {
  plan: Plan;
  en: boolean;
  current?: boolean;
  action?: React.ReactNode;
  promo?: { promo: PublicPromotion; finalCents: number } | null;
}) {
  const Icon = FAMILY_ICON[plan.family];
  return (
    <article
      className={`mt-6 rounded-xl border bg-card p-5 ${
        plan.highlight ? "border-primary shadow-sm" : "border-border"
      } ${action ? "mt-0" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Icon className="size-5 text-primary" aria-hidden />
            {en ? plan.nameEn : plan.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{en ? plan.taglineEn : plan.tagline}</p>
        </div>
        {current ? (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {en ? "Current" : "En cours"}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground">
        {plan.priceCents === 0
          ? en
            ? "Free"
            : "Gratuit"
          : formatPrice(plan.priceCents, en ? "en" : "fr")}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          {planDuration(plan, en ? "en" : "fr")}
        </span>
      </p>
      <ul className="mt-4 space-y-2">
        {(en ? plan.featuresEn : plan.features).map((f) => (
          <li key={f} className="flex gap-2 text-sm text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {action}
    </article>
  );
}
