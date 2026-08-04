import { createFileRoute, Link } from "@tanstack/react-router";
import { LEGAL_LINKS } from "@/components/legal/LegalLayout";
import { SiteHeader } from "@/components/SiteHeader";

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
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const FEATURES = [
  { title: "Traduction instantanée", desc: "Français ↔ fon, en un instant." },
  { title: "Assistant IA", desc: "Posez vos questions et pratiquez la conversation." },
  { title: "Leçons", desc: "Apprenez pas à pas, de manière interactive." },
  { title: "Phrasebook", desc: "Les phrases essentielles du quotidien au Bénin." },
];

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bénin · Fon</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Fon<span className="text-primary">Connect</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Supprimez la barrière de la langue : traduisez instantanément entre le français et le fon,
          et apprenez la langue de façon simple, interactive et immersive.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/traducteur"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ouvrir le traducteur
          </Link>
          <Link
            to="/assistant"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Parler à l'assistant IA
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-card-foreground">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
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
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FonConnect · contact@fonconnect.app
          </p>
        </div>
      </footer>
    </div>
  );
}
