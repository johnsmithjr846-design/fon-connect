import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEARNING_PATHS } from "@/lib/lessons";
import { PAID_PLANS, expiresAtFor, getPlan } from "@/lib/billing/plans";
import {
  adminGrantSubscription,
  adminRemoveUnlock,
  adminRevokeSubscription,
  adminSetBan,
  adminUnlockLesson,
  getAdminUserDetail,
} from "@/lib/admin-users.functions";

const selectCls =
  "h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground";

function toLocalInput(d: Date | null) {
  if (!d) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export function UserManager({
  userId,
  label,
  onChanged,
}: {
  userId: string;
  label: string;
  onChanged: () => void;
}) {
  const detail = useQuery({
    queryKey: ["admin", "user-detail", userId],
    queryFn: () => getAdminUserDetail({ data: { userId } }),
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pathId, setPathId] = useState(LEARNING_PATHS[0]?.id ?? "");
  const [lessonId, setLessonId] = useState<string>("");
  const [planId, setPlanId] = useState<string>(PAID_PLANS[0]?.id ?? "");
  const [kind, setKind] = useState<"free" | "paid">("free");
  const [expires, setExpires] = useState(() => {
    const p = PAID_PLANS[0];
    return p ? toLocalInput(defaultExpiry(p.id)) : "";
  });
  const [reason, setReason] = useState("");

  const path = LEARNING_PATHS.find((p) => p.id === pathId);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setMsg(null);
    try {
      await fn();
      setMsg(ok);
      await detail.refetch();
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    }
  }

  const d = detail.data;

  return (
    <div className="grid gap-5 rounded-lg border border-primary/40 bg-background/60 p-4 text-sm">
      <p className="font-semibold text-primary">Gérer : {label}</p>

      {/* Leçons */}
      <div className="grid gap-2">
        <Label>Débloquer une leçon ou un parcours</Label>
        <div className="flex flex-wrap gap-2">
          <select
            className={selectCls}
            value={pathId}
            onChange={(e) => {
              setPathId(e.target.value);
              setLessonId("");
            }}
          >
            {LEARNING_PATHS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <select className={selectCls} value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
            <option value="">Tout le parcours</option>
            {path?.lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() =>
              run(
                () =>
                  adminUnlockLesson({
                    data: { userId, pathId, lessonId: lessonId || null },
                  }),
                "Débloqué.",
              )
            }
          >
            Débloquer
          </Button>
        </div>
        {d && d.unlocks.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {d.unlocks.map((u) => {
              const p = LEARNING_PATHS.find((x) => x.id === u.path_id);
              const l = p?.lessons.find((x) => x.id === u.lesson_id);
              return (
                <li
                  key={u.id}
                  className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
                >
                  {p?.title ?? u.path_id}
                  {u.lesson_id ? ` · ${l?.title ?? u.lesson_id}` : " (tout)"}
                  <button
                    type="button"
                    aria-label="Retirer"
                    className="ml-1 text-destructive"
                    onClick={() => run(() => adminRemoveUnlock({ data: { id: u.id } }), "Retiré.")}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Abonnements */}
      <div className="grid gap-2">
        <Label>Attribuer un abonnement</Label>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={selectCls}
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              setExpires(toLocalInput(defaultExpiry(e.target.value)));
            }}
          >
            {PAID_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={kind}
            onChange={(e) => setKind(e.target.value as "free" | "paid")}
          >
            <option value="free">Offert (gratuit)</option>
            <option value="paid">Payé (hors site)</option>
          </select>
          <Input
            type="datetime-local"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="w-auto"
            title="Fin (vide = sans limite)"
          />
          <Button
            size="sm"
            onClick={() =>
              run(
                () =>
                  adminGrantSubscription({
                    data: {
                      userId,
                      planId,
                      kind,
                      expiresAt: expires ? new Date(expires).toISOString() : null,
                    },
                  }),
                "Abonnement activé sur le compte.",
              )
            }
          >
            Attribuer
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Laissez la date vide pour un accès sans limite.</p>
        {d && d.subscriptions.length > 0 && (
          <ul className="grid gap-1">
            {d.subscriptions.map((s) => {
              const expired = s.expires_at && Date.parse(s.expires_at) < Date.now();
              const active = !expired && s.status !== "EXPIRED";
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={active ? "text-primary" : "text-muted-foreground line-through"}>
                    {getPlan(s.plan_id)?.name ?? s.plan_id}
                  </span>
                  <span className="text-muted-foreground">
                    {s.provider === "admin_free"
                      ? "offert"
                      : s.provider === "admin_paid"
                        ? "payé hors site"
                        : s.provider}
                    {" · "}
                    {s.expires_at ? `jusqu'au ${s.expires_at.slice(0, 10)}` : "sans limite"}
                  </span>
                  {active && s.provider.startsWith("admin") && (
                    <button
                      type="button"
                      className="text-destructive underline"
                      onClick={() =>
                        run(() => adminRevokeSubscription({ data: { id: s.id } }), "Retiré.")
                      }
                    >
                      retirer
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bannissement */}
      <div className="grid gap-2">
        <Label>Bannissement</Label>
        {d?.banned ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-destructive">
              Banni{d.banned.reason ? ` — ${d.banned.reason}` : ""}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                run(
                  () => adminSetBan({ data: { userId, ban: false, reason: "" } }),
                  "Bannissement levé.",
                )
              }
            >
              Lever le bannissement
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison (facultatif)"
              className="max-w-xs"
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (!window.confirm(`Bannir ${label} ?`)) return;
                void run(
                  () => adminSetBan({ data: { userId, ban: true, reason } }),
                  "Compte banni.",
                );
              }}
            >
              Bannir
            </Button>
          </div>
        )}
      </div>

      {msg && <p className="text-xs text-primary">{msg}</p>}
    </div>
  );
}

function defaultExpiry(planId: string): Date | null {
  const p = getPlan(planId);
  if (!p) return null;
  if (p.interval === "month") return new Date(Date.now() + 30 * 86400000);
  if (p.interval === "year") return new Date(Date.now() + 365 * 86400000);
  return expiresAtFor(p);
}
