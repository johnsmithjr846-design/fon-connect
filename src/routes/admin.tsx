import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Terminal, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { claimFirstAdmin, getAdminAccess, verifyAdminCode } from "@/lib/admin.functions";
import {
  AdsPanel,
  ContentPanel,
  DashboardPanel,
  DownloadsPanel,
  SecurityPanel,
  UsersPanel,
} from "@/components/admin/AdminPanels";
import { PromotionsPanel, SubscriptionsPanel } from "@/components/admin/PromotionsPanel";
import { HeartsPanel } from "@/components/admin/HeartsPanel";

export const Route = createFileRoute("/admin")({
  head: () => {
    const title = "Console d'administration — FonConnect";
    const description =
      "Espace réservé à l'équipe FonConnect : statistiques, gestion des téléchargements, contenus et encarts.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: AdminConsole,
});

const TABS = [
  { id: "dashboard", label: "dashboard" },
  { id: "users", label: "utilisateurs" },
  { id: "hearts", label: "cœurs" },
  { id: "subscriptions", label: "abonnements" },
  { id: "promotions", label: "promotions" },
  { id: "downloads", label: "téléchargements" },
  { id: "content", label: "contenu" },
  { id: "ads", label: "publicités" },
  { id: "security", label: "sécurité" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminConsole() {
  const { user, loading } = useAuthUser();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [unlocked, setUnlocked] = useState(false);

  const access = useQuery({
    queryKey: ["admin", "access", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      return await getAdminAccess();
    },
  });

  return (
    <div className="admin-shell min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-primary" aria-hidden />
            <span className="text-sm font-bold tracking-[0.2em] text-primary">
              FONCONNECT://ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">retour au site</Link>
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUnlocked(false);
                }}
              >
                <LogOut className="mr-1.5 size-4" aria-hidden />
                quitter
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        {loading || (user && access.isLoading) ? (
          <p className="admin-prompt text-sm text-muted-foreground">initialisation…</p>
        ) : !user ? (
          <SignInGate />
        ) : !access.data?.isAdmin ? (
          <ClaimGate
            adminExists={access.data?.adminExists ?? true}
            onClaimed={() => void access.refetch()}
          />
        ) : access.data.codeSet && !unlocked ? (
          <CodeGate onUnlock={() => setUnlocked(true)} />
        ) : (
          <>
            <nav className="mb-6 flex flex-wrap gap-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                    tab === item.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            {tab === "dashboard" && <DashboardPanel />}
            {tab === "users" && <UsersPanel />}
            {tab === "subscriptions" && <SubscriptionsPanel />}
            {tab === "promotions" && <PromotionsPanel />}
            {tab === "downloads" && <DownloadsPanel />}
            {tab === "content" && <ContentPanel />}
            {tab === "ads" && <AdsPanel />}
            {tab === "security" && <SecurityPanel />}
          </>
        )}
      </main>
    </div>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6">
      <h1 className="admin-prompt text-sm font-semibold text-primary">{title}</h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SignInGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  }

  return (
    <Shell title="authentification requise">
      <form className="grid gap-3" onSubmit={submit}>
        <div className="grid gap-1.5">
          <Label>E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Mot de passe</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" disabled={busy}>
          Se connecter
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </Shell>
  );
}

function ClaimGate({ adminExists, onClaimed }: { adminExists: boolean; onClaimed: () => void }) {
  const [error, setError] = useState<string | null>(null);

  if (adminExists) {
    return (
      <Shell title="accès refusé">
        <p className="text-sm text-muted-foreground">
          Ce compte n'a pas les droits d'administration. Demandez à un administrateur existant de
          vous promouvoir.
        </p>
      </Shell>
    );
  }

  return (
    <Shell title="initialisation de la console">
      <p className="text-sm text-muted-foreground">
        Aucun administrateur n'est encore défini. Le premier compte connecté peut prendre le
        contrôle de la console.
      </p>
      <Button
        className="mt-4"
        onClick={async () => {
          try {
            await claimFirstAdmin();
            onClaimed();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Un administrateur existe déjà.");
          }
        }}
      >
        <ShieldCheck className="mr-1.5 size-4" aria-hidden />
        Devenir administrateur
      </Button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </Shell>
  );
}

function CodeGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { valid } = await verifyAdminCode({ data: { code } });
      if (valid) onUnlock();
      else setError("Code incorrect.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de vérification.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="code d'accès">
      <form className="grid gap-3" onSubmit={submit}>
        <Label>Code de la console</Label>
        <Input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="one-time-code"
          required
        />
        <Button type="submit" disabled={busy}>
          Déverrouiller
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </Shell>
  );
}
