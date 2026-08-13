import { Sparkles } from "lucide-react";
import { getPlan } from "@/lib/billing/plans";
import { usePromotions } from "@/hooks/usePromotions";

/** Promotions en cours : publiques, plus celles ciblées sur l'utilisateur connecté. */
export function PromoBanner() {
  const { promotions } = usePromotions();
  const rows = promotions;
  if (rows.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      {rows.map((p) => (
        <div
          key={p.id}
          className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm"
        >
          <p className="flex items-center gap-2 font-semibold text-primary">
            <Sparkles className="size-4" aria-hidden />
            {p.title} — −{p.discount_value}
            {p.discount_type === "percent" ? " %" : " €"}
          </p>
          {p.description && <p className="mt-1 text-muted-foreground">{p.description}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {p.plan_ids.length > 0 &&
              `Offres : ${p.plan_ids.map((id) => getPlan(id)?.name ?? id).join(", ")}. `}
            {p.code ? `Code ${p.code}. ` : ""}
            {p.ends_at
              ? `Jusqu'au ${new Date(p.ends_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}.`
              : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
