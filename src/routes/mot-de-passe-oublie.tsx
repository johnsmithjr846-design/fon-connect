import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/mot-de-passe-oublie")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — FonConnect" },
      {
        name: "description",
        content:
          "Recevez un lien par e-mail pour réinitialiser le mot de passe de votre compte FonConnect.",
      },
      { property: "og:title", content: "Mot de passe oublié — FonConnect" },
      { property: "og:description", content: "Réinitialisez le mot de passe de votre compte FonConnect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mot-de-passe-oublie" }],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mot de passe oublié</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé.
          </p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Envoi…" : "Envoyer le lien"}
            </Button>
          </form>
        )}
        <Link
          to="/auth"
          className="mt-6 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Retour à la connexion
        </Link>
      </main>
    </div>
  );
}
