import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Flag, X } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { submitReport } from "@/lib/reports.functions";
import { searchMembers } from "@/lib/social.functions";

const CATEGORIES = [
  { id: "bug", label: "Bug" },
  { id: "malfunction", label: "Dysfonctionnement" },
  { id: "user", label: "Signaler un utilisateur" },
  { id: "other", label: "Autre" },
] as const;
type Cat = (typeof CATEGORIES)[number]["id"];

export function ReportButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="flex justify-center border-t border-border bg-background py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Flag className="size-3.5" aria-hidden /> Signaler
        </button>
      </div>
      {open && <ReportDialog page={location.pathname} onClose={() => setOpen(false)} />}
    </>
  );
}

function ReportDialog({ page, onClose }: { page: string; onClose: () => void }) {
  const { user, loading } = useAuthUser();
  const send = useServerFn(submitReport);
  const search = useServerFn(searchMembers);
  const [category, setCategory] = useState<Cat>("bug");
  const [problem, setProblem] = useState("");
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ userId: string; pseudo: string | null }[]>([]);
  const [target, setTarget] = useState<{ userId: string; pseudo: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (category !== "user" || target || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      search({ data: { q: q.trim() } })
        .then((r) => setResults(r.filter((m) => m.userId !== user?.id)))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q, category, target, search, user?.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (problem.trim().length < 3) return setError("Décrivez le problème (3 caractères minimum).");
    if (category === "user" && !target) return setError("Choisissez l'utilisateur à signaler.");
    setBusy(true);
    try {
      await send({
        data: {
          category,
          reportedUserId: target?.userId ?? null,
          reportedPseudo: target?.pseudo ?? null,
          problem,
          message,
          page,
        },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Signaler un problème"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Signaler un problème</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {loading ? null : !user ? (
          <p className="text-sm text-muted-foreground">
            Connectez-vous pour envoyer un signalement.{" "}
            <Link to="/auth" onClick={onClose} className="font-medium text-primary underline">
              Se connecter
            </Link>
          </p>
        ) : done ? (
          <div className="space-y-4">
            <p className="text-sm">Merci ! Votre signalement a bien été envoyé à l'équipe FonConnect.</p>
            <button type="button" onClick={onClose} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">
              Objet
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Cat);
                  setTarget(null);
                  setQ("");
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>

            {category === "user" && (
              <div className="text-sm">
                <span className="font-medium">Utilisateur concerné</span>
                {target ? (
                  <div className="mt-1 flex items-center justify-between rounded-md border border-input bg-secondary px-3 py-2">
                    <span>{target.pseudo ?? "Membre"}</span>
                    <button type="button" onClick={() => setTarget(null)} className="text-xs text-primary underline">
                      Changer
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Tapez un pseudonyme…"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                    {results.length > 0 && (
                      <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-background">
                        {results.map((r) => (
                          <li key={r.userId}>
                            <button
                              type="button"
                              onClick={() => setTarget(r)}
                              className="w-full px-3 py-2 text-left hover:bg-accent"
                            >
                              {r.pseudo ?? "Membre"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            <label className="block text-sm font-medium">
              Problème
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Décrivez ce qui ne va pas"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium">
              Message <span className="font-normal text-muted-foreground">(facultatif)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Envoi…" : "Envoyer le signalement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
