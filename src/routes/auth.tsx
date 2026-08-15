import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { UI_LANGS, type UiLang } from "@/lib/i18n/dictionary";

function safeNext(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : undefined;
}

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s["next"]) }),
  head: () => ({
    meta: [
      { title: "Connexion à FonConnect — sauvegardez votre progression" },
      {
        name: "description",
        content:
          "Créez un compte FonConnect pour suivre vos leçons de fon, vos quiz et votre progression sur tous vos appareils.",
      },
      { property: "og:title", content: "Connexion à FonConnect" },
      {
        property: "og:description",
        content: "Créez un compte pour sauvegarder votre progression dans les leçons de fon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const returnTo = () => {
    if (next) {
      window.location.href = next;
      return true;
    }
    return false;
  };
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [appLang, setAppLang] = useState<UiLang>(lang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (!returnTo()) void navigate({ to: "/lecons", replace: true });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        if (!returnTo()) void navigate({ to: "/lecons", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: next ? `${window.location.origin}${next}` : window.location.origin,
            data: { pseudo: pseudo.trim() || undefined },
          },
        });
        if (err) throw err;
        if (!data.session) {
          setInfo("Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "La connexion a échoué.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: next ? `${window.location.origin}${next}` : window.location.origin,
    });
    if (result.error) {
      setError("La connexion Google a échoué.");
      return;
    }
    if (result.redirected) return;
    if (!returnTo()) void navigate({ to: "/lecons", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {mode === "signin" ? "Se connecter" : "Créer un compte"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre progression dans les leçons de fon est sauvegardée sur votre compte.
        </p>

        <Button type="button" variant="outline" className="mt-6 w-full" onClick={() => void onGoogle()}>
          Continuer avec Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Kokou"
                  autoComplete="nickname"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-language">{t("auth.language")}</Label>
                <select
                  id="app-language"
                  value={appLang}
                  onChange={(e) => {
                    const next = e.target.value as UiLang;
                    setAppLang(next);
                    setLang(next);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {UI_LANGS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{t("auth.languageHint")}</p>
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Un instant…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm">
          <button
            type="button"
            className="text-left text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Pas encore de compte ? Créer un compte" : "J'ai déjà un compte"}
          </button>
          <Link
            to="/mot-de-passe-oublie"
            className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </main>
    </div>
  );
}
