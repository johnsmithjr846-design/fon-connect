import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  listAdminUsers,
  setAdminCode,
  setAdminRoleByEmail,
} from "@/lib/admin.functions";

const CHART_COLORS = ["#22c55e", "#06b6d4", "#eab308", "#f97316", "#a855f7"];

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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

/* ------------------------------- Dashboard ------------------------------- */

export function DashboardPanel() {
  const views = useQuery({
    queryKey: ["admin", "page-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("path, day, views, visitors")
        .order("day", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      return await listAdminUsers();
    },
  });

  const lessons = useQuery({
    queryKey: ["admin", "lesson-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const byDay = useMemo(() => {
    const map = new Map<string, { day: string; views: number; visitors: number }>();
    for (const row of views.data ?? []) {
      const entry = map.get(row.day) ?? { day: row.day, views: 0, visitors: 0 };
      entry.views += row.views;
      entry.visitors += row.visitors;
      map.set(row.day, entry);
    }
    return [...map.values()].slice(-30);
  }, [views.data]);

  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of views.data ?? []) map.set(row.path, (map.get(row.path) ?? 0) + row.views);
    return [...map.entries()]
      .map(([path, total]) => ({ path, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [views.data]);

  const signupsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users.data ?? []) {
      const day = String(u.created_at).slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-30);
  }, [users.data]);

  const byLanguage = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users.data ?? [])
      map.set(u.preferred_language ?? "fr", (map.get(u.preferred_language ?? "fr") ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [users.data]);

  const totalViews = (views.data ?? []).reduce((n, r) => n + r.views, 0);
  const totalVisitors = (views.data ?? []).reduce((n, r) => n + r.visitors, 0);
  const totalXp = (users.data ?? []).reduce((n, u) => n + (u.xp_total ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Pages vues" value={totalViews} />
        <Metric label="Visiteurs uniques" value={totalVisitors} />
        <Metric label="Comptes inscrits" value={(users.data ?? []).length} />
        <Metric label="Leçons terminées" value={lessons.data ?? 0} />
      </div>

      <Panel title="trafic (30 derniers jours)">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.15)" />
              <XAxis dataKey="day" stroke="#4ade80" fontSize={11} />
              <YAxis stroke="#4ade80" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b1710", border: "1px solid #22c55e" }} />
              <Line type="monotone" dataKey="views" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="inscriptions par jour">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.15)" />
                <XAxis dataKey="day" stroke="#4ade80" fontSize={11} />
                <YAxis stroke="#4ade80" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b1710", border: "1px solid #22c55e" }} />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="langue d'interface">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byLanguage} dataKey="value" nameKey="name" outerRadius={80} label>
                  {byLanguage.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0b1710", border: "1px solid #22c55e" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="pages les plus vues">
        <ul className="space-y-2 text-sm">
          {topPages.map((p) => (
            <li key={p.path} className="flex justify-between gap-4">
              <span className="truncate text-muted-foreground">{p.path}</span>
              <span className="font-semibold text-primary">{p.total}</span>
            </li>
          ))}
          {topPages.length === 0 && <li className="text-muted-foreground">Aucune donnée.</li>}
        </ul>
      </Panel>

      <p className="text-xs text-muted-foreground">XP distribué au total : {totalXp}</p>
    </div>
  );
}

/* --------------------------------- Users --------------------------------- */

export function UsersPanel() {
  const [search, setSearch] = useState("");
  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      return await listAdminUsers();
    },
  });

  const rows = (users.data ?? []).filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (u.email ?? "").toLowerCase().includes(q) || (u.pseudo ?? "").toLowerCase().includes(q);
  });

  function exportCsv() {
    const header = ["email", "pseudo", "langue", "inscription", "derniere_connexion", "xp", "serie"];
    const lines = rows.map((u) =>
      [
        u.email ?? "",
        u.pseudo ?? "",
        u.preferred_language ?? "",
        u.created_at ?? "",
        u.last_sign_in_at ?? "",
        u.xp_total ?? 0,
        u.current_streak ?? 0,
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
    a.download = "fonconnect-utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel title={`utilisateurs (${rows.length})`}>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un e-mail ou un pseudo…"
          className="max-w-xs"
        />
        <Button variant="outline" onClick={exportCsv}>
          Exporter en CSV
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="py-2">E-mail</th>
              <th className="py-2">Pseudo</th>
              <th className="py-2">Langue</th>
              <th className="py-2">Inscription</th>
              <th className="py-2">Dernière connexion</th>
              <th className="py-2 text-right">XP</th>
              <th className="py-2 text-right">Série</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.user_id} className="border-t border-border">
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3">{u.pseudo ?? "—"}</td>
                <td className="py-2 pr-3 uppercase">{u.preferred_language}</td>
                <td className="py-2 pr-3">{String(u.created_at).slice(0, 10)}</td>
                <td className="py-2 pr-3">
                  {u.last_sign_in_at ? String(u.last_sign_in_at).slice(0, 10) : "—"}
                </td>
                <td className="py-2 text-right text-primary">{u.xp_total}</td>
                <td className="py-2 text-right">{u.current_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.isLoading && <p className="mt-3 text-sm text-muted-foreground">Chargement…</p>}
        {users.error && (
          <p className="mt-3 text-sm text-destructive">Accès refusé ou erreur de lecture.</p>
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------- Downloads -------------------------------- */

type ReleaseForm = {
  id?: string;
  platform: "android" | "ios";
  version: string;
  download_url: string;
  notes: string;
  size_label: string;
  published: boolean;
};

function emptyRelease(platform: "android" | "ios"): ReleaseForm {
  return {
    platform,
    version: "",
    download_url: "",
    notes: "",
    size_label: "",
    published: false,
  };
}

export function DownloadsPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState<ReleaseForm | null>(null);

  const releases = useQuery({
    queryKey: ["admin", "releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_releases")
        .select("*")
        .order("released_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (form: ReleaseForm) => {
      const payload = {
        platform: form.platform,
        version: form.version,
        download_url: form.download_url,
        notes: form.notes,
        size_label: form.size_label,
        published: form.published,
      };
      if (form.id) {
        const { error } = await supabase.from("app_releases").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("app_releases").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      setStatus("Enregistré.");
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["admin", "releases"] });
      await qc.invalidateQueries({ queryKey: ["app-releases"] });
    },
    onError: (e: Error) => setStatus(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("app_releases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setStatus("Version supprimée.");
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["admin", "releases"] });
      await qc.invalidateQueries({ queryKey: ["app-releases"] });
    },
    onError: (e: Error) => setStatus(e.message),
  });

  async function upload(file: File, form: ReleaseForm) {
    setStatus("Téléversement en cours…");
    const path = `${form.platform}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("app-downloads").upload(path, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    setEditing({ ...form, download_url: `storage:${path}`, size_label: `${mb} Mo` });
    setStatus("Fichier téléversé. Pensez à enregistrer.");
  }

  function platformList(platform: "android" | "ios", title: string) {
    const rows = (releases.data ?? []).filter((r) => r.platform === platform);
    return (
      <Panel title={title}>
        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={() => setEditing(emptyRelease(platform))}
            disabled={editing?.platform === platform && !editing.id}
          >
            + Nouvelle version
          </Button>

          {editing && editing.platform === platform && !editing.id && releaseForm(editing)}

          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune version enregistrée.</p>
          )}

          {rows.map((r) => {
            const isEditing = editing?.id === r.id;
            return (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-semibold">v{r.version || "—"}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {r.size_label || "—"} · {r.published ? "visible" : "masquée"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditing(
                          isEditing
                            ? null
                            : ({ ...(r as unknown as ReleaseForm), platform } as ReleaseForm),
                        )
                      }
                    >
                      {isEditing ? "Fermer" : "Modifier"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove.mutate(r.id as string)}
                      disabled={remove.isPending}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
                {isEditing && editing && <div className="mt-3">{releaseForm(editing)}</div>}
              </div>
            );
          })}
        </div>
      </Panel>
    );
  }

  function releaseForm(f: ReleaseForm) {
    const set = (v: ReleaseForm) => setEditing(v);
    return (
      <div className="grid gap-3 rounded-lg border border-dashed border-border p-3">
        <div className="grid gap-1.5">
          <Label>Version</Label>
          <Input value={f.version} onChange={(e) => set({ ...f, version: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Lien de téléchargement (ou fichier téléversé)</Label>
          <Input
            value={f.download_url}
            onChange={(e) => set({ ...f, download_url: e.target.value })}
            placeholder="https://… ou storage:android/app.apk"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Téléverser un fichier</Label>
          <input
            type="file"
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-secondary-foreground"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file, f);
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Taille affichée</Label>
          <Input value={f.size_label} onChange={(e) => set({ ...f, size_label: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Notes de version</Label>
          <Textarea rows={3} value={f.notes} onChange={(e) => set({ ...f, notes: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={f.published}
            onCheckedChange={(v) => set({ ...f, published: v })}
            id={`pub-${f.platform}-${f.id ?? "new"}`}
          />
          <Label htmlFor={`pub-${f.platform}-${f.id ?? "new"}`}>
            Visible sur la page de téléchargement
          </Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => save.mutate(f)} disabled={save.isPending}>
            Enregistrer
          </Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {status && <p className="text-sm text-primary">{status}</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        {platformList("android", "application android")}
        {platformList("ios", "application ios")}
      </div>
    </div>
  );
}

/* -------------------------------- Content -------------------------------- */

const CONTENT_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "contact_email", label: "E-mail de contact (barre des politiques)" },
  { key: "company_name", label: "Nom affiché de la société" },
  { key: "announcement", label: "Bandeau d'annonce en haut du site", multiline: true },
  { key: "download_intro", label: "Texte de la page de téléchargement", multiline: true },
];

export function ContentPanel() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const row of settings.data ?? []) map[row.key] = row.value;
    setValues(map);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = CONTENT_FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: async () => {
      setStatus("Modifications publiées.");
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => setStatus(e.message),
  });

  return (
    <Panel title="contenu du site">
      <div className="grid gap-4">
        {CONTENT_FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label>{f.label}</Label>
            {f.multiline ? (
              <Textarea
                rows={2}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            ) : (
              <Input
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Publier les modifications
        </Button>
        {status && <p className="text-sm text-primary">{status}</p>}
      </div>
    </Panel>
  );
}

/* ---------------------------------- Ads ---------------------------------- */

type AdRow = {
  id: string;
  title: string;
  body: string;
  image_url: string;
  link_url: string;
  placement: string;
  active: boolean;
};

export function AdsPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    body: "",
    image_url: "",
    link_url: "",
    placement: "home",
    active: true,
  });

  const ads = useQuery({
    queryKey: ["admin", "ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, body, image_url, link_url, placement, active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdRow[];
    },
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    await qc.invalidateQueries({ queryKey: ["ads"] });
  }

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ads").insert(draft);
      if (error) throw error;
    },
    onSuccess: async () => {
      setDraft({
        title: "",
        body: "",
        image_url: "",
        link_url: "",
        placement: "home",
        active: true,
      });
      setStatus("Encart créé.");
      await refresh();
    },
    onError: (e: Error) => setStatus(e.message),
  });

  return (
    <div className="space-y-5">
      <Panel title="nouvel encart publicitaire">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Titre</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Texte</Label>
            <Textarea
              rows={2}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Image (URL)</Label>
            <Input
              value={draft.image_url}
              onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Lien</Label>
            <Input
              value={draft.link_url}
              onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Emplacement</Label>
            <select
              value={draft.placement}
              onChange={(e) => setDraft({ ...draft, placement: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="home">Accueil</option>
              <option value="lessons">Leçons</option>
              <option value="translator">Traducteur</option>
              <option value="all">Partout</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="ad-active"
              checked={draft.active}
              onCheckedChange={(v) => setDraft({ ...draft, active: v })}
            />
            <Label htmlFor="ad-active">Actif</Label>
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !draft.title}>
            Créer l'encart
          </Button>
          {status && <p className="text-sm text-primary">{status}</p>}
        </div>
      </Panel>

      <Panel title={`encarts existants (${(ads.data ?? []).length})`}>
        <ul className="space-y-3">
          {(ads.data ?? []).map((ad) => (
            <AdEditor key={ad.id} ad={ad} onChanged={refresh} />
          ))}
          {(ads.data ?? []).length === 0 && (
            <li className="text-sm text-muted-foreground">Aucun encart pour le moment.</li>
          )}
        </ul>
      </Panel>
    </div>
  );
}

function AdEditor({ ad, onChanged }: { ad: AdRow; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(ad);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setForm(ad);
  }, [ad]);

  async function save() {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("ads")
      .update({
        title: form.title,
        body: form.body,
        image_url: form.image_url,
        link_url: form.link_url,
        placement: form.placement,
        active: form.active,
      })
      .eq("id", ad.id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Encart mis à jour.");
    await onChanged();
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-card-foreground">{ad.title}</p>
          <p className="text-xs text-muted-foreground">
            {ad.placement} · {ad.active ? "actif" : "inactif"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={ad.active}
            onCheckedChange={async (v) => {
              await supabase.from("ads").update({ active: v }).eq("id", ad.id);
              await onChanged();
            }}
          />
          <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? "Fermer" : "Modifier"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await supabase.from("ads").delete().eq("id", ad.id);
              await onChanged();
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-3 grid gap-3 border-t border-border pt-3">
          <div className="grid gap-1.5">
            <Label>Titre</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Texte</Label>
            <Textarea
              rows={2}
              value={form.body ?? ""}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Image (URL)</Label>
            <Input
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Lien</Label>
            <Input
              value={form.link_url ?? ""}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Emplacement</Label>
            <select
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="home">Accueil</option>
              <option value="lessons">Leçons</option>
              <option value="translator">Traducteur</option>
              <option value="all">Partout</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
            <Label>Actif</Label>
          </div>
          <Button onClick={save} disabled={busy || !form.title}>
            Enregistrer
          </Button>
          {msg && <p className="text-sm text-primary">{msg}</p>}
        </div>
      )}
    </li>
  );
}

/* -------------------------------- Security -------------------------------- */

export function SecurityPanel() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function saveCode() {
    try {
      await setAdminCode({ data: { code } });
      setStatus(code ? "Code d'accès mis à jour." : "Code d'accès supprimé.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Échec de la mise à jour.");
    }
    setCode("");
  }

  async function setRole(grant: boolean) {
    try {
      await setAdminRoleByEmail({ data: { email, grant } });
      setStatus(
        grant ? `${email} est désormais administrateur.` : `${email} n'est plus administrateur.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Échec de la mise à jour du rôle.");
    }
  }

  return (
    <div className="space-y-5">
      <Panel title="code d'accès de la console">
        <div className="grid gap-3">
          <Label>Nouveau code (laisser vide pour le désactiver)</Label>
          <Input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="new-password"
          />
          <Button onClick={saveCode}>Mettre à jour le code</Button>
        </div>
      </Panel>

      <Panel title="administrateurs">
        <div className="grid gap-3">
          <Label>Adresse e-mail d'un compte existant</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@mail.com" />
          <div className="flex gap-2">
            <Button onClick={() => void setRole(true)} disabled={!email}>
              Promouvoir
            </Button>
            <Button variant="outline" onClick={() => void setRole(false)} disabled={!email}>
              Retirer
            </Button>
          </div>
        </div>
      </Panel>

      {status && <p className="text-sm text-primary">{status}</p>}
    </div>
  );
}
