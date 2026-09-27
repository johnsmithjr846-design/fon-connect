import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listReports, setReportStatus } from "@/lib/reports.functions";

const LABELS: Record<string, string> = {
  bug: "Bug",
  malfunction: "Dysfonctionnement",
  user: "Utilisateur",
  other: "Autre",
};

export function ReportsPanel() {
  const fetchReports = useServerFn(listReports);
  const update = useServerFn(setReportStatus);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-reports"], queryFn: () => fetchReports() });

  async function toggle(id: string, status: string) {
    await update({ data: { id, status: status === "open" ? "resolved" : "open" } });
    void qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">Aucun signalement.</p>;

  return (
    <ul className="space-y-3">
      {data.map((r) => (
        <li key={r.id} className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">
              {LABELS[r.category] ?? r.category}
              {r.reported_pseudo && ` — ${r.reported_pseudo}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString("fr-FR")} · {r.page || "/"}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap">{r.problem}</p>
          {r.message && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{r.message}</p>}
          <button
            type="button"
            onClick={() => void toggle(r.id, r.status)}
            className={`mt-3 rounded-md px-3 py-1 text-xs font-medium ${r.status === "open" ? "bg-primary text-primary-foreground" : "border border-input text-muted-foreground"}`}
          >
            {r.status === "open" ? "Marquer comme traité" : "Traité — rouvrir"}
          </button>
        </li>
      ))}
    </ul>
  );
}
