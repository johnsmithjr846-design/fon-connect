import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Check, Heart, Languages, PartyPopper } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getPlan } from "@/lib/billing/plans";
import { usePageView } from "@/hooks/useSiteData";

export const Route = createFileRoute("/merci")({
  component: ThankYouPage,
  head: () => ({
    meta: [
      { title: "Merci — votre offre FonConnect est active" },
      {
        name: "description",
        content:
          "Votre paiement est confirmé : découvrez tout ce que votre offre FonConnect débloque, des cœurs illimités à la traduction premium.",
      },
      { property: "og:title", content: "Votre offre FonConnect est active" },
      {
        property: "og:description",
        content: "Cœurs illimités, leçons Pro et traduction premium : c'est parti.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/merci" }],
  }),
});

function ThankYouPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { entitlements, isLoading, refetch } = useEntitlements();
  usePageView("/merci");

  // Le paiement est confirmé par le prestataire quelques secondes après le retour.
  useEffect(() => {
    const id = setInterval(() => void refetch(), 3000);
    const stop = setTimeout(() => clearInterval(id), 30_000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [refetch]);

  const plan = entitlements.plans.map(getPlan).find(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 text-center">
        <PartyPopper className="mx-auto size-10 text-primary" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          {en ? "Thank you, welcome aboard!" : "Merci, bienvenue à bord !"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {plan
            ? en
              ? `Your plan ${plan.nameEn} is active.`
              : `Votre offre ${plan.name} est active.`
            : isLoading
              ? en
                ? "Confirming your payment…"
                : "Confirmation du paiement en cours…"
              : en
                ? "Your payment is being confirmed, this only takes a moment."
                : "Votre paiement est en cours de confirmation, cela prend quelques instants."}
        </p>

        <ul className="mx-auto mt-8 grid max-w-md gap-3 text-left">
          <Perk
            icon={<Heart className="size-4" aria-hidden />}
            label={en ? "Unlimited hearts in lessons" : "Cœurs illimités dans les leçons"}
            on={entitlements.unlimitedHearts}
          />
          <Perk
            icon={<BookOpen className="size-4" aria-hidden />}
            label={en ? "All Pro lessons unlocked" : "Toutes les leçons Pro débloquées"}
            on={entitlements.lessonsPro}
          />
          <Perk
            icon={<Languages className="size-4" aria-hidden />}
            label={en ? "Premium translation and voice" : "Traduction et voix premium"}
            on={entitlements.translationPremium}
          />
          <Perk
            icon={<span aria-hidden>💚</span>}
            label={en ? "“Supporter” badge + 100 XP" : "Badge « Soutien » + 100 XP"}
            on
          />
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/lecons">{en ? "Start a lesson" : "Commencer une leçon"}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/mon-abonnement">{en ? "My subscription" : "Mon abonnement"}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function Perk({
  icon,
  label,
  on,
}: {
  icon: React.ReactNode;
  label: string;
  on: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
        on ? "border-primary/40 bg-primary/5 text-foreground" : "border-border text-muted-foreground"
      }`}
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1">{label}</span>
      {on ? <Check className="size-4 text-primary" aria-hidden /> : null}
    </li>
  );
}
