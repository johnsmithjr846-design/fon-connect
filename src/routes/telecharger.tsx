import { createFileRoute } from "@tanstack/react-router";
import { Apple, Download, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { usePageView, usePublishedReleases, useSiteSettings } from "@/hooks/useSiteData";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/telecharger")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Télécharger l'application FonConnect — Android et iOS" },
      {
        name: "description",
        content:
          "Téléchargez FonConnect sur Android (APK ou Play Store) et iOS, ou utilisez le site directement depuis votre navigateur.",
      },
      { property: "og:title", content: "Télécharger l'application FonConnect" },
      {
        property: "og:description",
        content: "L'app de traduction et d'apprentissage du fon, sur Android et iOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/telecharger" }],
  }),
});

function DownloadPage() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { settings } = useSiteSettings();
  const { data } = usePublishedReleases();
  usePageView("/telecharger");

  const releases = data ?? [];
  const android = releases.filter((r) => r.platform === "android");
  const ios = releases.filter((r) => r.platform === "ios");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {en ? "Download the FonConnect app" : "Télécharger l'application FonConnect"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {settings["download_intro"] ||
            (en
              ? "Install FonConnect on your phone to translate and learn Fon anywhere."
              : "Installez FonConnect sur votre téléphone pour traduire et apprendre le fon partout.")}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <PlatformCard
            icon={<Smartphone className="size-5" aria-hidden />}
            name="Android"
            releases={android}
            platform="android"
            cta={en ? "Download" : "Télécharger"}
            latestLabel={en ? "Latest" : "Dernière version"}
            olderLabel={en ? "Previous versions" : "Versions précédentes"}
            soon={en ? "Coming soon on Android" : "Bientôt disponible sur Android"}
          />
          <PlatformCard
            icon={<Apple className="size-5" aria-hidden />}
            name="iOS"
            releases={ios}
            platform="ios"
            cta={en ? "Download" : "Télécharger"}
            latestLabel={en ? "Latest" : "Dernière version"}
            olderLabel={en ? "Previous versions" : "Versions précédentes"}
            soon={en ? "Coming soon on iOS" : "Bientôt disponible sur iOS"}
          />
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-border bg-card/60 p-5">
          <p className="text-sm font-semibold text-card-foreground">
            {en ? "No installation needed" : "Sans installation"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? "FonConnect works directly in your browser. On mobile, use “Add to home screen” to keep it one tap away."
              : "FonConnect fonctionne directement dans votre navigateur. Sur mobile, utilisez « Ajouter à l'écran d'accueil » pour le garder à portée de main."}
          </p>
        </div>
      </main>
    </div>
  );
}

function PlatformCard({
  icon,
  name,
  releases,
  platform,
  cta,
  latestLabel,
  olderLabel,
  soon,
}: {
  icon: React.ReactNode;
  name: string;
  releases: { id: string; version: string; size_label: string; notes: string }[];
  platform: string;
  cta: string;
  latestLabel: string;
  olderLabel: string;
  soon: string;
}) {
  const [latest, ...older] = releases;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-card-foreground">
        {icon}
        <h2 className="text-base font-semibold">{name}</h2>
      </div>

      {!latest ? (
        <>
          <p className="mt-2 text-xs text-muted-foreground">{soon}</p>
          <Button disabled className="mt-4 w-full">
            {soon}
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {latestLabel}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[latest.version && `v${latest.version}`, latest.size_label].filter(Boolean).join(" · ") ||
              "—"}
          </p>
          {latest.notes && <p className="mt-2 text-sm text-muted-foreground">{latest.notes}</p>}
          <Button asChild className="mt-4 w-full">
            <a href={`/api/public/telechargement/${platform}?id=${latest.id}`}>
              <Download className="mr-2 size-4" aria-hidden />
              {cta}
            </a>
          </Button>

          {older.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {olderLabel}
              </p>
              <ul className="mt-2 space-y-2">
                {older.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {[r.version && `v${r.version}`, r.size_label].filter(Boolean).join(" · ") ||
                        "—"}
                    </span>
                    <a
                      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      href={`/api/public/telechargement/${platform}?id=${r.id}`}
                    >
                      <Download className="size-3.5" aria-hidden />
                      {cta}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
