import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { listAdminUsers } from "@/lib/admin.functions";
import { listAdminSubscriptions, sendPromotionNotifications } from "@/lib/promotions.functions";
import { PLANS, getPlan } from "@/lib/billing/plans";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="admin-prompt text-sm font-semibold uppercase tracking-[0.14em] text-primary">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const PAID_PLANS = PLANS.filter((p) => p.id !== "FREE");

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

type PromotionRow = {
  id: string;
  title: string;
  description: string;
  plan_ids: string[];
  discount_type: string;
  discount_value: number;
  code: string | null;
  audience: string;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
};

const EMPTY_DRAFT = {
  title: "",
  description: "",
  plan_ids: [] as string[],
  discount_type: "percent",
  discount_value: 10,
  code: "",
  audience: "all",
  starts_at: "",
  ends_at: "",
  active: true,
};

/* ------------------------------- Promotions ------------------------------ */

export function PromotionsPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [targets, setTargets] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const promotions = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select(
          "id, title, description, plan_ids, discount_type, discount_value, code, audience, starts_at, ends_at, active",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PromotionRow[];
    },
  });

  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => await listAdminUsers(),
  });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = users.data ?? [];
    if (!q) return rows.slice(0, 30);
    return rows
      .filter(
        (u) =>
          (u.email ?? "").toLowerCase().includes(q) || (u.pseudo ?? "").toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [users.data, search]);

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        title: draft.title,
        description: draft.description,
        plan_ids: draft.plan_ids,
        discount_type: draft.discount_type,
        discount_value: Number(draft.discount_value) || 0,
        code: draft.code.trim() || null,
        audience: draft.audience,
        starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : new Date().toISOString(),
        ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
        active: draft.active,
      };
      const { data, error } = await supabase
        .from("promotions")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      if (draft.audience === "selected" && targets.length > 0) {
        const { error: tErr } = await supabase
          .from("promotion_targets")
          .insert(targets.map((user_id) => ({ promotion_id: data.id, user_id })));
        if (tErr) throw tErr;
      }
    },
    onSuccess: async () => {
      setDraft(EMPTY_DRAFT);
      setTargets([]);
      setStatus("Promotion créée.");
      await qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      await qc.invalidateQueries({ queryKey: ["promotions", "public"] });
    },
    onError: (e: Error) => setStatus(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("promotions").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      await qc.invalidateQueries({ queryKey: ["promotions", "public"] });
    },
    onError: (e: Error) => setStatus(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setStatus("Promotion supprimée.");
      await qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      await qc.invalidateQueries({ queryKey: ["promotions", "public"] });
    },
    onError: (e: Error) => setStatus(e.message),
  });

  const notify = useMutation({
    mutationFn: async (id: string) => await sendPromotionNotifications({ data: { promotionId: id } }),
    onSuccess: (res) => setStatus(`${res.sent} notification(s) envoyée(s).`),
    onError: (e: Error) => setStatus(e.message),
  });

  return (
    <div className="space-y-5">
      <Panel title="nouvelle promotion">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Titre</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="-30 % sur Premium GOLD"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Message</Label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Profitez de 30 % de réduction jusqu'à dimanche."
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Offres concernées</Label>
            <div className="flex flex-wrap gap-2">
              {PAID_PLANS.map((plan) => {
                const selected = draft.plan_ids.includes(plan.id);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        plan_ids: selected
                          ? draft.plan_ids.filter((p) => p !== plan.id)
                          : [...draft.plan_ids, plan.id],
                      })
                    }
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      selected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/60"
                    }`}
                  >
                    {plan.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Type de remise</Label>
              <select
                value={draft.discount_type}
                onChange={(e) => setDraft({ ...draft, discount_type: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="amount">Montant (€)</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Valeur</Label>
              <Input
                type="number"
                min={0}
                value={draft.discount_value}
                onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Code promo (option)</Label>
              <Input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="FON30"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Début</Label>
              <Input
                type="datetime-local"
                value={draft.starts_at}
                onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Fin</Label>
              <Input
                type="datetime-local"
                value={draft.ends_at}
                onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Destinataires</Label>
            <select
              value={draft.audience}
              onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="selected">Utilisateurs précis</option>
            </select>
          </div>

          {draft.audience === "selected" && (
            <div className="grid gap-2 rounded-md border border-border p-3">
              <Input
                placeholder="Rechercher un e-mail ou un pseudo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{targets.length} sélectionné(s)</p>
              <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
                {filteredUsers.map((u) => (
                  <li key={u.user_id}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={targets.includes(u.user_id)}
                        onChange={(e) =>
                          setTargets(
                            e.target.checked
                              ? [...targets, u.user_id]
                              : targets.filter((id) => id !== u.user_id),
                          )
                        }
                      />
                      <span className="truncate">
                        {u.email ?? u.user_id} {u.pseudo ? `(${u.pseudo})` : ""}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="flex items-center gap-3">
            <Switch
              checked={draft.active}
              onCheckedChange={(v) => setDraft({ ...draft, active: v })}
            />
            <span className="text-sm text-muted-foreground">Promotion active</span>
          </label>

          <Button
            onClick={() => create.mutate()}
            disabled={create.isPending || !draft.title.trim()}
          >
            Créer la promotion
          </Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
      </Panel>

      <Panel title="promotions existantes">
        {promotions.isLoading ? (
          <p className="text-sm text-muted-foreground">chargement…</p>
        ) : (promotions.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune promotion.</p>
        ) : (
          <ul className="space-y-3">
            {(promotions.data ?? []).map((p) => (
              <li key={p.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {p.title}{" "}
                      <span className="text-primary">
                        −{p.discount_value}
                        {p.discount_type === "percent" ? " %" : " €"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.audience === "all" ? "Tous les utilisateurs" : "Utilisateurs ciblés"} ·{" "}
                      {fmt(p.starts_at)} → {fmt(p.ends_at)}
                      {p.code ? ` · code ${p.code}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Offres :{" "}
                      {p.plan_ids.length === 0
                        ? "toutes"
                        : p.plan_ids.map((id) => getPlan(id)?.name ?? id).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: p.id, active: v })}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => notify.mutate(p.id)}
                      disabled={notify.isPending}
                    >
                      <Send className="mr-1.5 size-3.5" aria-hidden />
                      Notifier
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}>
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------ Abonnements ------------------------------ */

export function SubscriptionsPanel() {
  const subs = useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: async () => await listAdminSubscriptions(),
  });

  const rows = subs.data ?? [];
  const activeCount = rows.filter(
    (r) => r.status === "ACTIVE" && (!r.expires_at || Date.parse(r.expires_at) > Date.now()),
  ).length;

  function exportCsv() {
    const header = [
      "email",
      "pseudo",
      "offre",
      "statut",
      "souscrit_le",
      "expire_le",
      "resilie",
      "renouvellement",
      "paiement",
    ];
    const lines = rows.map((r) =>
      [
        r.email ?? "",
        r.pseudo ?? "",
        getPlan(r.plan_id)?.name ?? r.plan_id,
        r.status,
        r.start_at ?? "",
        r.expires_at ?? "",
        r.status === "CANCELLED" ? (r.updated_at ?? "") : "",
        r.cancel_at_period_end ? "arrêt à échéance" : r.auto_renew ? "auto" : "non",
        r.payment_state ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "abonnements-fonconnect.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel title="abonnements des utilisateurs">
      {subs.isLoading ? (
        <p className="text-sm text-muted-foreground">chargement…</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {rows.length} abonnement(s) · {activeCount} actif(s)
            </p>
            <Button variant="outline" onClick={exportCsv}>
              Exporter en CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Utilisateur</th>
                  <th className="py-2 pr-3">Offre</th>
                  <th className="py-2 pr-3">Statut</th>
                  <th className="py-2 pr-3">Souscrit le</th>
                  <th className="py-2 pr-3">Expire le</th>
                  <th className="py-2 pr-3">Résilié le</th>
                  <th className="py-2 pr-3">Renouvellement</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 pr-3">{r.email ?? r.user_id}</td>
                    <td className="py-2 pr-3">{getPlan(r.plan_id)?.name ?? r.plan_id}</td>
                    <td className="py-2 pr-3">
                      {r.status}
                      {r.payment_state === "past_due" ? " (impayé)" : ""}
                    </td>
                    <td className="py-2 pr-3">{fmt(r.start_at)}</td>
                    <td className="py-2 pr-3">{fmt(r.expires_at)}</td>
                    <td className="py-2 pr-3">
                      {r.status === "CANCELLED" ? fmt(r.updated_at) : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {r.cancel_at_period_end
                        ? "arrêt à échéance"
                        : r.auto_renew
                          ? "automatique"
                          : "non"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}
