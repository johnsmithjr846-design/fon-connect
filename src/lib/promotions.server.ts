import type { PublicPromotion } from "@/lib/billing/promo";

const SELECT =
  "id, title, description, plan_ids, discount_type, discount_value, code, ends_at, audience";

/**
 * Promotions réellement valables pour un utilisateur :
 * actives, dans leur fenêtre de dates, publiques ou ciblées sur lui.
 */
export async function fetchUserPromotions(userId: string | null): Promise<PublicPromotion[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .select(SELECT)
    .eq("active", true)
    .lte("starts_at", nowIso)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as unknown as (PublicPromotion & { audience: string })[];
  const live = rows.filter((p) => !p.ends_at || Date.parse(p.ends_at) > Date.now());

  const publicOnes = live.filter((p) => p.audience === "all");
  const targetedIds = live.filter((p) => p.audience !== "all").map((p) => p.id);
  if (!userId || targetedIds.length === 0) return publicOnes.map(strip);

  const { data: targets } = await supabaseAdmin
    .from("promotion_targets")
    .select("promotion_id")
    .eq("user_id", userId)
    .in("promotion_id", targetedIds);
  const allowed = new Set(((targets ?? []) as { promotion_id: string }[]).map((t) => t.promotion_id));

  return live.filter((p) => p.audience === "all" || allowed.has(p.id)).map(strip);
}

function strip(p: PublicPromotion & { audience?: string }): PublicPromotion {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    plan_ids: p.plan_ids ?? [],
    discount_type: p.discount_type,
    discount_value: p.discount_value,
    code: p.code ?? null,
    ends_at: p.ends_at ?? null,
  };
}
