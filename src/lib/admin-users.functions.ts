import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPlan } from "@/lib/billing/plans";

async function adminClient(supabase: unknown, userId: string) {
  const { data } = await (supabase as { from: (t: string) => any })
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Accès refusé.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export type AdminUserDetail = {
  banned: { reason: string; created_at: string } | null;
  unlocks: { id: string; path_id: string; lesson_id: string | null }[];
  subscriptions: {
    id: string;
    plan_id: string;
    provider: string;
    status: string;
    expires_at: string | null;
  }[];
};

const UserId = z.object({ userId: z.string().uuid() });

export const getAdminUserDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => UserId.parse(i))
  .handler(async ({ data, context }): Promise<AdminUserDetail> => {
    const db = await adminClient(context.supabase, context.userId);
    const [ban, unlocks, subs] = await Promise.all([
      db.from("user_bans").select("reason, created_at").eq("user_id", data.userId).maybeSingle(),
      db.from("lesson_unlocks").select("id, path_id, lesson_id").eq("user_id", data.userId),
      db
        .from("subscriptions")
        .select("id, plan_id, provider, status, expires_at")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false }),
    ]);
    return { banned: ban.data ?? null, unlocks: unlocks.data ?? [], subscriptions: subs.data ?? [] };
  });

export const listBannedUserIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string[]> => {
    const db = await adminClient(context.supabase, context.userId);
    const { data } = await db.from("user_bans").select("user_id");
    return (data ?? []).map((r: { user_id: string }) => r.user_id);
  });

export const adminUnlockLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        pathId: z.string().min(1).max(64),
        lessonId: z.string().max(64).nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const db = await adminClient(context.supabase, context.userId);
    const { error } = await db.from("lesson_unlocks").insert({
      user_id: data.userId,
      path_id: data.pathId,
      lesson_id: data.lessonId,
      created_by: context.userId,
    });
    if (error && !String(error.message).includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoveUnlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context.supabase, context.userId);
    const { error } = await db.from("lesson_unlocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGrantSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        planId: z.string().min(1).max(64),
        kind: z.enum(["free", "paid"]),
        expiresAt: z.string().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    if (!getPlan(data.planId) || data.planId === "FREE") throw new Error("Offre inconnue.");
    const db = await adminClient(context.supabase, context.userId);
    const expires = data.expiresAt ? new Date(data.expiresAt) : null;
    if (expires && Number.isNaN(expires.getTime())) throw new Error("Date invalide.");
    const { error } = await db.from("subscriptions").insert({
      user_id: data.userId,
      plan_id: data.planId,
      provider: data.kind === "free" ? "admin_free" : "admin_paid",
      status: "ACTIVE",
      start_at: new Date().toISOString(),
      expires_at: expires ? expires.toISOString() : null,
      auto_renew: false,
      cancel_at_period_end: false,
      payment_state: "paid",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRevokeSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context.supabase, context.userId);
    const { error } = await db
      .from("subscriptions")
      .update({ status: "EXPIRED", expires_at: new Date().toISOString(), auto_renew: false })
      .eq("id", data.id)
      .in("provider", ["admin_free", "admin_paid"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetBan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        ban: z.boolean(),
        reason: z.string().max(500).default(""),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("Vous ne pouvez pas vous bannir.");
    const db = await adminClient(context.supabase, context.userId);
    const { error: authErr } = await db.auth.admin.updateUserById(data.userId, {
      ban_duration: data.ban ? "876000h" : "none",
    });
    if (authErr) throw new Error(authErr.message);
    if (data.ban) {
      await db.from("user_bans").upsert({
        user_id: data.userId,
        reason: data.reason.trim(),
        banned_by: context.userId,
      });
    } else {
      await db.from("user_bans").delete().eq("user_id", data.userId);
    }
    return { ok: true };
  });
