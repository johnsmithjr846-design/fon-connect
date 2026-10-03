import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_STATS, resetHeartsIfNewDay, type UserStats } from "@/lib/lessons/stats";

/** Rend exactement un cœur après une annonce récompensée vue à la fin des cœurs (offre gratuite uniquement). */
export const rewardAdHeart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ adId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ hearts: number }> => {
    const { supabase, userId } = context;
    const { data: ad } = await supabase
      .from("ads")
      .select("id, active, reward_heart, show_on_hearts_empty")
      .eq("id", data.adId)
      .maybeSingle();
    if (!ad || !ad.active || !ad.reward_heart || !ad.show_on_hearts_empty) {
      throw new Error("Annonce non récompensée");
    }
    const { computeEntitlements } = await import("@/lib/entitlements.server");
    const ent = await computeEntitlements(supabase as never, userId);
    if (ent.plans.length > 0 || ent.unlimitedHearts) throw new Error("Réservé à l'offre gratuite");

    const { data: row } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const prev = resetHeartsIfNewDay((row as UserStats | null) ?? DEFAULT_STATS);
    if (prev.hearts > 0) return { hearts: prev.hearts };

    const { error } = await supabase.from("user_stats").upsert(
      {
        user_id: userId,
        xp_total: prev.xp_total,
        current_streak: prev.current_streak,
        best_streak: prev.best_streak,
        last_active_day: prev.last_active_day,
        hearts: 1,
        hearts_day: prev.hearts_day,
        hearts_updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { hearts: 1 };
  });
