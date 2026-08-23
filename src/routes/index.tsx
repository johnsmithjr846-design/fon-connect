import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Terminal } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { LEGAL_LINKS } from "@/components/legal/LegalLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { usePageView, useSiteSettings } from "@/hooks/useSiteData";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "FonConnect — Traduire et apprendre le fon du Bénin" },
      {
        name: "description",
        content:
          "FonConnect supprime la barrière de la langue : traduction instantanée français ↔ fon, assistant IA, leçons et guide de conversation.",
      },
      { property: "og:title", content: "FonConnect — Traduire et apprendre le fon du Bénin" },
      {
        property: "og:description",
        content: "FonConnect supprime la barrière de la langue : traduction instantanée français ↔ fon, assistant IA, leçons et guide de conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

type Feature = {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  to: "/traducteur" | "/assistant" | "/lecons" | "/explorer" | "/phrasebook";
};

const FEATURES: Feature[] = [
  {
    titleKey: "home.feature.translation.title",
    descKey: "home.feature.translation.desc",
    to: "/traducteur",
  },
  { titleKey: "home.feature.assistant.title", descKey: "home.feature.assistant.desc", to: "/assistant" },
  { titleKey: "home.feature.lessons.title", descKey: "home.feature.lessons.desc", to: "/lecons" },
  // Carte « Explorer » masquée temporairement (réintégration prévue).
  { titleKey: "home.feature.phrasebook.title", descKey: "home.feature.phrasebook.desc", to: "/phrasebook" },
];

const LEGAL_KEYS: Record<string, TranslationKey> = {
  "/conditions-utilisation": "legal.terms",
  "/politique-confidentialite": "legal.privacy",
  "/cookies": "legal.cookies",
  "/mentions-legales": "legal.notice",
};

function Index() {
  const { t } = useI18n();
  const { contactEmail, companyName, announcement } = useSiteSettings();
  usePageView("/");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {announcement && (
        <p className="bg-primary/10 px-5 py-2 text-center text-sm text-primary">{announcement}</p>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t("home.eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Fon<span className="text-primary">Connect</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("home.intro")}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/traducteur"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("home.ctaTranslator")}
          </Link>
          <Link
            to="/assistant"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("home.ctaAssistant")}
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <h2 className="text-base font-semibold text-card-foreground">{t(f.titleKey)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(f.descKey)}</p>
            </Link>
          ))}
        </div>

        <Link
          to="/telecharger"
          className="mt-8 flex items-center gap-4 rounded-xl border border-primary/40 bg-secondary p-5 transition-colors hover:bg-accent"
        >
          <Smartphone className="size-6 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="text-base font-semibold text-secondary-foreground">
              {t("home.download.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("home.download.desc")}</p>
          </div>
        </Link>

        <AdSlot placement="home" />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 py-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {LEGAL_KEYS[l.to] ? t(LEGAL_KEYS[l.to]!) : l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/telecharger"
                className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {t("home.download.title")}
              </Link>
            </li>
          </ul>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} {companyName} ·{" "}
              <a href={`mailto:${contactEmail}`} className="hover:text-primary">
                {contactEmail}
              </a>
            </span>
            <Link
              to="/admin"
              rel="nofollow"
              title="Console admin"
              aria-label="Console d'administration"
              className="inline-flex items-center gap-1 rounded border border-transparent px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Terminal className="size-3" aria-hidden />
              admin
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

