import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeEntitlements, type Entitlements } from "@/lib/entitlements.server";

export type { Entitlements };

export const getEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Entitlements> => {
    return computeEntitlements(context.supabase as never, context.userId);
  });
