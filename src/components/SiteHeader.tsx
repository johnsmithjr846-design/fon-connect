import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/traducteur", label: "Traducteur" },
  { to: "/assistant", label: "Assistant IA" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-[var(--brand-yellow)] to-destructive" />
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="text-base font-bold tracking-tight text-foreground">
          Fon<span className="text-primary">Connect</span>
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="text-muted-foreground transition-colors hover:text-primary [&.active]:font-semibold [&.active]:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
