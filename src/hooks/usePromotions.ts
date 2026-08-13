import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyPromotions } from "@/lib/promotions.functions";
import { bestPromoFor, type PublicPromotion } from "@/lib/billing/promo";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * Promotions visibles : publiques pour tout le monde,
 * publiques + ciblées pour un utilisateur connecté.
 */
export function usePromotions() {
  const { user } = useAuthUser();
  const fetchMine = useServerFn(listMyPromotions);

  const query = useQuery({
    queryKey: ["promotions", "visible", user?.id ?? "anon"],
    queryFn: async (): Promise<PublicPromotion[]> => {
      if (user) return (await fetchMine()) as PublicPromotion[];
      const { data, error } = await supabase
        .from("promotions")
        .select("id, title, description, plan_ids, discount_type, discount_value, code, ends_at")
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []) as PublicPromotion[];
    },
    staleTime: 30_000,
  });

  const promotions = query.data ?? [];
  return {
    promotions,
    isLoading: query.isLoading,
    promoFor: (planId: string, priceCents: number) =>
      bestPromoFor(promotions, planId, priceCents),
  };
}
