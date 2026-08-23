import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { HeartGrant } from "@/lib/hearts";

export type AdminHeartGrant = HeartGrant & {
  email: string | null;
  pseudo: string | null;
};

async function assertAdmin(supabase: {
  from: (t: string) => any;
}, userId: string): Promise<void> {
  const { data } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("forbidden");
}

export const listHeartGrants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminHeartGrant[]> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("admin_heart_grants")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as HeartGrant[];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, pseudo").in("id", ids)
      : { data: [] as { id: string; pseudo: string | null }[] };
    const byId = new Map((profiles ?? []).map((p) => [p.id, p.pseudo]));
    return rows.map((r) => ({ ...r, pseudo: byId.get(r.user_id) ?? null, email: null }));
  });

const GrantSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(1).max(999),
  kind: z.enum(["free", "paid"]),
  startsAt: z.string().min(1),
  expiresAt: z.string().min(1),
  reason: z.string().max(500).default(""),
});

export const grantHearts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GrantSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context.supabase as never, context.userId);
    const startsAt = new Date(data.startsAt);
    const expiresAt = new Date(data.expiresAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
      throw new Error("Dates invalides.");
    }
    if (expiresAt <= startsAt) throw new Error("L'expiration doit suivre le début.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_heart_grants").insert({
      user_id: data.userId,
      amount: data.amount,
      hearts_remaining: data.amount,
      kind: data.kind,
      reason: data.reason,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeHeartGrant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ grantId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_heart_grants")
      .update({ revoked_at: new Date().toISOString(), hearts_remaining: 0 })
      .eq("id", data.grantId)
      .is("revoked_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
