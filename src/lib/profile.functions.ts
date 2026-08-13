import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProfileData = {
  pseudo: string | null;
  preferredLanguage: "fr" | "en";
  avatarUrl: string | null;
};

function normalizeLanguage(value: unknown): "fr" | "en" {
  return value === "en" ? "en" : "fr";
}

type ProfileRow = { pseudo?: string | null; preferred_language?: string; avatar_url?: string | null };

function toProfile(row: ProfileRow | null): ProfileData {
  return {
    pseudo: row?.pseudo ?? null,
    preferredLanguage: normalizeLanguage(row?.preferred_language),
    avatarUrl: row?.avatar_url ?? null,
  };
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
    return toProfile(data as ProfileRow | null);
  });

const UpdateSchema = z.object({
  pseudo: z.string().trim().max(60).optional(),
  preferredLanguage: z.enum(["fr", "en"]).optional(),
  avatarUrl: z
    .string()
    .max(400_000)
    .refine((v) => v === "" || /^data:image\/(png|jpeg|webp);base64,/.test(v), "invalid image")
    .optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateSchema.parse(input))
  .handler(async ({ data, context }): Promise<ProfileData> => {
    const patch: Record<string, unknown> = { id: context.userId };
    if (data.pseudo !== undefined) patch['pseudo'] = data.pseudo || null;
    if (data.preferredLanguage !== undefined) patch['preferred_language'] = data.preferredLanguage;
    if (data.avatarUrl !== undefined) patch['avatar_url'] = data.avatarUrl || null;

    const { data: saved, error } = await context.supabase
      .from("profiles")
      .upsert(patch as never, { onConflict: "id" })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return toProfile(saved as ProfileRow | null);
  });
