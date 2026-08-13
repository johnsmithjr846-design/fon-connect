import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  createPortalSession,
  cancelSubscriptionNow,
  syncMySubscriptions,
} from "@/lib/payments.functions";
import { PaymentIssueBanner } from "@/components/payments/PaymentIssueBanner";
import { getStripeEnvironment } from "@/lib/stripe";
import { getPlan, formatPrice, planDuration } from "@/lib/billing/plans";

export const Route = createFileRoute("/mon-abonnement")({
  component: SubscriptionPage,
  head: () => ({
    meta: [
      { title: "Mon abonnement FonConnect — gérer mon offre" },
      {
        name: "description",
        content:
          "Consultez votre offre FonConnect en cours, sa date d'expiration, et gérez le renouvellement ou la résiliation.",
      },
      { property: "og:title", content: "Mon abonnement FonConnect" },
      {
        property: "og:description",
        content: "Gérez votre offre FonConnect : renouvellement, résiliation, factures.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mon-abonnement" }],
  }),
});

function SubscriptionPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { user } = useAuthUser();
  const { entitlements, isLoading, refetch } = useEntitlements();
  const [busy, setBusy] = useState(false);

  // Recale l'offre affichée sur l'état réel chez le prestataire de paiement.
  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        await syncMySubscriptions({ data: { environment: getStripeEnvironment() } });
        await refetch();
      } catch {
        // L'affichage reste sur les données déjà connues.
      }
    })();
  }, [user, refetch]);

  const cancelNow = async () => {
    const ok = window.confirm(
      en
        ? "Cancel now? Access stops immediately, with a prorated refund of the unused time."
        : "Résilier maintenant ? L'accès est coupé immédiatement, avec remboursement au prorata du temps non utilisé.",
    );
    if (!ok) return;
    setBusy(true);
    try {
      const result = await cancelSubscriptionNow({
        data: { environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      toast.success(en ? "Subscription cancelled." : "Abonnement résilié.");
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const openPortal = async () => {
    setBusy(true);
    try {
      const result = await createPortalSession({
        data: {
          returnUrl: `${window.location.origin}/mon-abonnement`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PaymentTestModeBanner />
      <SiteHeader />
      <PaymentIssueBanner />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {en ? "My subscription" : "Mon abonnement"}
        </h1>

        {!user ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {en ? "Sign in to see your plan." : "Connectez-vous pour voir votre offre."}{" "}
            <Link to="/auth" className="font-semibold text-primary underline">
              {en ? "Sign in" : "Se connecter"}
            </Link>
          </p>
        ) : isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">…</p>
        ) : entitlements.subscriptions.length === 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              {en
                ? "You are on the free plan: 4 hearts a day and basic translation."
                : "Vous êtes sur l'offre gratuite : 4 cœurs par jour et la traduction de base."}
            </p>
            <Button asChild className="mt-4">
              <Link to="/tarifs">{en ? "See the plans" : "Voir les offres"}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {entitlements.subscriptions.map((sub) => {
              const plan = getPlan(sub.plan_id);
              return (
                <article key={sub.id} className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold text-foreground">
                    {plan ? (en ? plan.nameEn : plan.name) : sub.plan_id}
                  </h2>
                  {plan ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(plan.priceCents, en ? "en" : "fr")}{" "}
                      {planDuration(plan, en ? "en" : "fr")}
                    </p>
                  ) : null}
                  <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <dt>{en ? "Status" : "Statut"}</dt>
                      <dd className="font-medium text-foreground">
                        {sub.status === "ACTIVE"
                          ? en
                            ? "Active"
                            : "Actif"
                          : en
                            ? "Ends at period end"
                            : "Se termine à échéance"}
                      </dd>
                    </div>
                    {sub.expires_at ? (
                      <div className="flex justify-between">
                        <dt>{en ? "Access until" : "Accès jusqu'au"}</dt>
                        <dd className="font-medium text-foreground">
                          {new Date(sub.expires_at).toLocaleString(en ? "en-GB" : "fr-FR")}
                        </dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <dt>{en ? "Automatic renewal" : "Reconduction automatique"}</dt>
                      <dd className="font-medium text-foreground">
                        {sub.auto_renew ? (en ? "Yes" : "Oui") : en ? "No" : "Non"}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
            <div className="flex flex-wrap gap-3">
              <Button onClick={openPortal} disabled={busy}>
                <ExternalLink className="mr-2 size-4" aria-hidden />
                {en ? "Manage billing" : "Gérer mon paiement"}
              </Button>
              {entitlements.subscriptions.some((s) => s.auto_renew) ? (
                <Button variant="destructive" onClick={() => void cancelNow()} disabled={busy}>
                  {en ? "Cancel now" : "Résilier maintenant"}
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => refetch()}>
                {en ? "Refresh" : "Actualiser"}
              </Button>
              <Button asChild variant="ghost">
                <Link to="/tarifs">{en ? "See all plans" : "Voir toutes les offres"}</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {en
                ? "Cancelling stops access immediately, with a prorated refund of the unused time. Changing plan also applies immediately with a prorated amount."
                : "La résiliation coupe l'accès immédiatement, avec remboursement au prorata du temps non utilisé. Un changement d'offre s'applique aussi immédiatement, au prorata."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
