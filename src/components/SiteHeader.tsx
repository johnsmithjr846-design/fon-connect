import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/traducteur", label: "Traducteur" },
  { to: "/lecons", label: "Leçons" },
  { to: "/phrasebook", label: "Phrasebook" },
  { to: "/assistant", label: "Assistant IA" },
] as const;

export function SiteHeader() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-[var(--brand-yellow)] to-destructive" />
      <nav className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3">
        <Link to="/" className="text-base font-bold tracking-tight text-foreground">
          Fon<span className="text-primary">Connect</span>
        </Link>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
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
          <li>
            {loading ? null : user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Déconnexion
              </button>
            ) : (
              <Link
                to="/auth"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Se connecter
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
