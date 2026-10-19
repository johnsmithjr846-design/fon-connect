import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUsageStatus, type UsageStatus } from "@/lib/usage.server";

export type { UsageStatus };

export const fetchUsageStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UsageStatus> => getUsageStatus(context.userId));
