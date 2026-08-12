import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPlan } from "@/lib/billing/plans";

type PromoRow = {
  id: string;
  title: string;
  description: string;
  plan_ids: string[];
  discount_type: string;
  discount_value: number;
  code: string | null;
  ends_at: string | null;
};

/** Promotions publiques en cours (les promos ciblées arrivent par notification). */
export function PromoBanner() {
  const promos = useQuery({
    queryKey: ["promotions", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("id, title, description, plan_ids, discount_type, discount_value, code, ends_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PromoRow[];
    },
  });

  const rows = promos.data ?? [];
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
