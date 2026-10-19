import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Signe les médias des annonces actives uniquement (le stockage reste privé). */
export const signAdMedia = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ paths: z.array(z.string().max(300)).max(50) }).parse(input),
  )
  .handler(async ({ data }): Promise<Record<string, string>> => {
    if (data.paths.length === 0) return {};
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ads } = await supabaseAdmin
      .from("ads")
      .select("media_path")
      .eq("active", true)
      .in("media_path", data.paths);
    const allowed = (ads ?? []).map((a) => a.media_path).filter((p): p is string => Boolean(p));
    if (allowed.length === 0) return {};
    const { data: signed } = await supabaseAdmin.storage
      .from("ad-media")
      .createSignedUrls(allowed, 60 * 60 * 24);
    const out: Record<string, string> = {};
    for (const s of signed ?? []) if (s.path && s.signedUrl) out[s.path] = s.signedUrl;
    return out;
  });
