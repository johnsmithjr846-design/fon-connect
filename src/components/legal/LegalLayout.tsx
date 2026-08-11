import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSiteSettings } from "@/hooks/useSiteData";


export const LEGAL_LINKS = [
  { to: "/conditions-utilisation", label: "Conditions d'utilisation" },
  { to: "/politique-confidentialite", label: "Politique de confidentialité" },
  { to: "/cookies", label: "Cookies" },
  { to: "/mentions-legales", label: "Mentions légales" },
] as const;

export const LAST_UPDATED = "3 août 2026";

export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const { contactEmail } = useSiteSettings();
  return (

    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-semibold tracking-tight text-foreground">
            Fon<span className="text-primary">Connect</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Retour à l'accueil
          </Link>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-primary via-[var(--brand-yellow)] to-destructive" />
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dernière mise à jour : {LAST_UPDATED}
        </p>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-8 space-y-8">{children}</div>

        <nav className="mt-14 border-t border-border pt-6">
          <p className="text-sm font-medium text-foreground">Autres documents</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
