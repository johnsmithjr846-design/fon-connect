import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PathSchema = z.object({
  path: z.string().trim().min(1).max(200),
  newVisitor: z.boolean().optional(),
});

export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PathSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("track_page_view", {
      _path: data.path,
      _new_visitor: data.newVisitor ?? false,
    });
    if (error) console.error("[analytics] track_page_view", error.message);
    return { ok: !error };
  });
