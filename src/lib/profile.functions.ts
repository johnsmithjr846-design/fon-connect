import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProfileData = {
  pseudo: string | null;
  preferredLanguage: "fr" | "en";
};

function normalizeLanguage(value: unknown): "fr" | "en" {
  return value === "en" ? "en" : "fr";
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileData> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as { pseudo?: string | null; preferred_language?: string } | null;
    return {
      pseudo: row?.pseudo ?? null,
      preferredLanguage: normalizeLanguage(row?.preferred_language),
    };
  });

const UpdateSchema = z.object({
  pseudo: z.string().trim().max(60).optional(),
  preferredLanguage: z.enum(["fr", "en"]).optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateSchema.parse(input))
  .handler(async ({ data, context }): Promise<ProfileData> => {
    const patch: Record<string, unknown> = { id: context.userId };
    if (data.pseudo !== undefined) patch['pseudo'] = data.pseudo || null;
    if (data.preferredLanguage !== undefined) patch['preferred_language'] = data.preferredLanguage;

    const { data: saved, error } = await context.supabase
      .from("profiles")
      .upsert(patch as never, { onConflict: "id" })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = saved as { pseudo?: string | null; preferred_language?: string } | null;
    return {
      pseudo: row?.pseudo ?? null,
      preferredLanguage: normalizeLanguage(row?.preferred_language),
    };
  });
