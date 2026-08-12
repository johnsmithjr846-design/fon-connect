import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminSubscriptionRow = {
  id: string;
  user_id: string;
  email: string | null;
  pseudo: string | null;
  plan_id: string;
  status: string;
  provider: string | null;
  start_at: string | null;
  expires_at: string | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  payment_state: string | null;
  grace_until: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const listAdminSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSubscriptionRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("admin_list_subscriptions", {
      _actor: context.userId,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminSubscriptionRow[];
  });

export const sendPromotionNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ promotionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ sent: number }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sent, error } = await supabaseAdmin.rpc("admin_send_promotion", {
      _actor: context.userId,
      _promotion_id: data.promotionId,
    });
    if (error) throw new Error(error.message);
    return { sent: Number(sent ?? 0) };
  });
