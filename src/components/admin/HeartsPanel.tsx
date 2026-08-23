import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listAdminUsers } from "@/lib/admin.functions";
import { grantHearts, listHeartGrants, revokeHeartGrant } from "@/lib/admin-hearts.functions";
import { GRANT_STATUS_LABEL, grantStatus, type HeartGrantKind } from "@/lib/hearts";

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const DURATIONS = [
  { label: "24 h", hours: 24 },
  { label: "7 jours", hours: 24 * 7 },
  { label: "30 jours", hours: 24 * 30 },
] as const;

export function HeartsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("1");
  const [kind, setKind] = useState<HeartGrantKind>("free");
  const [startsAt, setStartsAt] = useState(() => toLocalInput(new Date()));
  const [expiresAt, setExpiresAt] = useState(() =>
    toLocalInput(new Date(Date.now() + 24 * 3600 * 1000)),
  );
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => listAdminUsers() });
  const grants = useQuery({ queryKey: ["admin", "heart-grants"], queryFn: () => listHeartGrants() });

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users.data ?? [])
      .filter(
        (u) =>
          !q ||
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.pseudo ?? "").toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [users.data, search]);

  const emailById = useMemo(
    () => new Map((users.data ?? []).map((u) => [u.user_id, u.email])),
    [users.data],
  );

  function applyDuration(hours: number) {
    const base = new Date(startsAt);
    if (Number.isNaN(base.getTime())) return;
    setExpiresAt(toLocalInput(new Date(base.getTime() + hours * 3600 * 1000)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const n = Number(amount);
    if (!userId) return setStatus("Sélectionnez un utilisateur.");
    if (!Number.isInteger(n) || n < 1) return setStatus("Le nombre de cœurs doit être ≥ 1.");
    if (new Date(expiresAt) <= new Date(startsAt))
      return setStatus("L'expiration doit être après le début.");
    setBusy(true);
    try {
      await grantHearts({
        data: {
          userId,
          amount: n,
          kind,
          startsAt: new Date(startsAt).toISOString(),
          expiresAt: new Date(expiresAt).toISOString(),
          reason,
        },
      });
      setStatus("Cœurs attribués.");
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin", "heart-grants"] });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="admin-prompt text-sm font-semibold text-primary">
          <Heart className="mr-1.5 inline size-4" aria-hidden />
          attribuer des cœurs
        </h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Rechercher un utilisateur</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="E-mail ou pseudo…"
            />
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">— Sélectionner —</option>
              {options.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.pseudo ?? "sans pseudo"} — {u.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label>Nombre de cœurs</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Type</Label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as HeartGrantKind)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="free">Gratuit</option>
              <option value="paid">Payant</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label>Début</Label>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Expiration</Label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {DURATIONS.map((d) => (
                <Button
                  key={d.label}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyDuration(d.hours)}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <Label>Message / motif</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              placeholder="Ex. compensation, cadeau de bienvenue…"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>
              Ajouter les cœurs
            </Button>
            {status && <span className="ml-3 text-sm text-muted-foreground">{status}</span>}
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="admin-prompt text-sm font-semibold text-primary">historique</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="py-2">Utilisateur</th>
                <th className="py-2 text-right">Cœurs</th>
                <th className="py-2 text-right">Restants</th>
                <th className="py-2">Type</th>
                <th className="py-2">Début</th>
                <th className="py-2">Expiration</th>
                <th className="py-2">Motif</th>
                <th className="py-2">Statut</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {(grants.data ?? []).map((g) => {
                const st = grantStatus(g);
                return (
                  <tr key={g.id} className="border-t border-border">
                    <td className="py-2 pr-3">
                      {g.pseudo ?? emailById.get(g.user_id) ?? g.user_id.slice(0, 8)}
                    </td>
                    <td className="py-2 text-right">{g.amount}</td>
                    <td className="py-2 text-right">{g.hearts_remaining}</td>
                    <td className="py-2 pr-3">{g.kind === "paid" ? "Payant" : "Gratuit"}</td>
                    <td className="py-2 pr-3">{new Date(g.starts_at).toLocaleString("fr-FR")}</td>
                    <td className="py-2 pr-3">{new Date(g.expires_at).toLocaleString("fr-FR")}</td>
                    <td className="py-2 pr-3">{g.reason || "—"}</td>
                    <td className="py-2 pr-3">{GRANT_STATUS_LABEL[st]}</td>
                    <td className="py-2 text-right">
                      {(st === "active" || st === "scheduled") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await revokeHeartGrant({ data: { grantId: g.id } });
                            await qc.invalidateQueries({ queryKey: ["admin", "heart-grants"] });
                          }}
                        >
                          Révoquer
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {grants.isLoading && <p className="mt-3 text-sm text-muted-foreground">Chargement…</p>}
          {grants.error && (
            <p className="mt-3 text-sm text-destructive">Accès refusé ou erreur de lecture.</p>
          )}
        </div>
      </section>
    </div>
  );
}
