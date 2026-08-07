import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — FonConnect" },
      {
        name: "description",
        content: "Choisissez un nouveau mot de passe pour votre compte FonConnect.",
      },
      { property: "og:title", content: "Nouveau mot de passe — FonConnect" },
      { property: "og:description", content: "Choisissez un nouveau mot de passe FonConnect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => void navigate({ to: "/lecons", replace: true }), 1200);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nouveau mot de passe</h1>
        {!ready && (
          <p className="mt-4 text-sm text-muted-foreground">
            Ouvrez cette page depuis le lien reçu par e-mail pour définir un nouveau mot de passe.
          </p>
        )}
        {done ? (
          <p className="mt-4 text-sm text-primary">Mot de passe mis à jour. Redirection…</p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !ready}>
              {busy ? "Mise à jour…" : "Enregistrer"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
