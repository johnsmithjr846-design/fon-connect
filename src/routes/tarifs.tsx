import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Crown, GraduationCap, Languages, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { CheckoutDialog, type CheckoutRequest } from "@/components/payments/CheckoutDialog";
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
  const { entitlements } = useEntitlements();
  const [autoRenew, setAutoRenew] = useState(true);
  const [checkout, setCheckout] = useState<CheckoutRequest | null>(null);
  usePageView("/tarifs");

  const free = PLANS.find((p) => p.id === "FREE")!;

  const start = (plan: Plan) => {
    const priceId = priceIdFor(plan.id, plan.renewalOptional ? autoRenew : true);
    if (!priceId) return;
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {en ? "FonConnect plans and pricing" : "Offres et tarifs FonConnect"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {en
            ? "Prices include VAT. Every detail below is shown before payment: what is included, how long it lasts and whether it renews."
            : "Prix TTC. Tout est indiqué avant le paiement : ce qui est inclus, la durée et la reconduction éventuelle."}
        </p>

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
                    <Button className="w-full" onClick={() => start(plan)}>
                      {en ? "Choose this plan" : "Choisir cette offre"}
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
                ? "Monthly and yearly plans renew automatically until you cancel; you keep access until the end of the paid period."
                : "Les offres mensuelles et annuelles se renouvellent jusqu'à résiliation ; l'accès reste actif jusqu'à la fin de la période payée."}
            </li>
            <li>
              {en
                ? "Manage, change or cancel your plan any time from your subscription page."
                : "Gérez, changez ou résiliez votre offre à tout moment depuis votre page abonnement."}
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
}: {
  plan: Plan;
  en: boolean;
  current?: boolean;
  action?: React.ReactNode;
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
