import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

const KEY = "fonconnect_consent";

type Consent = { accepted: boolean; analytics: boolean; ads: boolean; date: string };

function save(c: Consent) {
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("fonconnect-consent"));
}

export function ConsentGate() {
  const [step, setStep] = useState<"hidden" | "logo" | "consent" | "refused">("hidden");
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    let stored: Consent | null = null;
    try {
      stored = JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
      stored = null;
    }
    if (stored?.accepted) return;
    setStep("logo");
    const t = setTimeout(() => setStep("consent"), 1600);
    return () => clearTimeout(t);
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const legal = ["/conditions-utilisation", "/politique-confidentialite", "/cookies", "/mentions-legales"].includes(pathname);
  if (step === "hidden" || legal) return null;

  const finish = (a: boolean, d: boolean) => {
    save({ accepted: true, analytics: a, ads: d, date: new Date().toISOString() });
    setStep("hidden");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 p-4 backdrop-blur-md">
      {step === "logo" && (
        <p className="animate-pulse text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Fon<span className="text-primary">Connect</span>
        </p>
      )}

      {step === "consent" && (
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-primary/40 bg-card p-5 text-card-foreground shadow-2xl">
          <div className="mb-3 h-1.5 w-full rounded-full bg-gradient-to-r from-primary via-[var(--brand-yellow)] to-destructive" />
          <p className="text-center text-2xl font-bold">
            Fon<span className="text-primary">Connect</span>
          </p>
          <h2 className="mt-3 text-base font-semibold">Bienvenue !</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pour utiliser FonConnect, merci d'accepter nos{" "}
            <Link to="/conditions-utilisation" className="text-primary underline">conditions d'utilisation</Link>, notre{" "}
            <Link to="/politique-confidentialite" className="text-primary underline">politique de confidentialité</Link> et notre{" "}
            <Link to="/cookies" className="text-primary underline">politique de cookies</Link>.
          </p>

          {custom && (
            <div className="mt-4 space-y-3 rounded-lg border border-border p-3 text-sm">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked disabled className="mt-1" />
                <span><b>Essentiels</b> — connexion, préférences, sécurité. Toujours actifs.</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1" />
                <span><b>Mesure d'audience</b> — nous aide à améliorer le site.</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} className="mt-1" />
                <span><b>Publicité</b> — annonces plus pertinentes.</span>
              </label>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2">
            {custom ? (
              <button type="button" onClick={() => finish(analytics, ads)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Enregistrer mes choix et accepter
              </button>
            ) : (
              <>
                <button type="button" onClick={() => finish(true, true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Tout accepter
                </button>
                <button type="button" onClick={() => finish(false, false)} className="rounded-lg border border-input px-4 py-2 text-sm font-medium">
                  Accepter uniquement l'essentiel
                </button>
                <button type="button" onClick={() => setCustom(true)} className="text-sm text-primary underline">
                  Choisir mes cookies
                </button>
              </>
            )}
            <button type="button" onClick={() => setStep("refused")} className="text-xs text-muted-foreground underline">
              Refuser
            </button>
          </div>
        </div>
      )}

      {step === "refused" && (
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-center shadow-2xl">
          <p className="text-sm">
            Sans acceptation des conditions d'utilisation et de la politique de confidentialité, vous ne pouvez pas utiliser FonConnect.
          </p>
          <button type="button" onClick={() => setStep("consent")} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Revenir en arrière
          </button>
        </div>
      )}
    </div>
  );
}
