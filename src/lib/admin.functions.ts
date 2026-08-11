import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUserRow = {
  user_id: string;
  email: string | null;
  pseudo: string | null;
  preferred_language: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  xp_total: number | null;
  current_streak: number | null;
  last_active_day: string | null;
};

export const getAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({ context }): Promise<{ isAdmin: boolean; adminExists: boolean; codeSet: boolean }> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [roleRes, existsRes, codeRes] = await Promise.all([
        supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .eq("user_id", context.userId)
          .eq("role", "admin")
          .maybeSingle(),
        supabaseAdmin.rpc("admin_exists"),
        supabaseAdmin.rpc("admin_code_is_set"),
      ]);
      return {
        isAdmin: Boolean(roleRes.data),
        adminExists: Boolean(existsRes.data),
        codeSet: Boolean(codeRes.data),
      };
    },
  );

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("admin_list_users", { _actor: context.userId });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminUserRow[];
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("claim_first_admin", { _actor: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const verifyAdminCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: z.string().max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<{ valid: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("verify_admin_code", {
      _actor: context.userId,
      _code: data.code,
    });
    if (error) throw new Error(error.message);
    return { valid: Boolean(ok) };
  });

export const setAdminCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: z.string().max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("set_admin_code", {
      _actor: context.userId,
      _code: data.code,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAdminRoleByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().trim().email().max(200), grant: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("admin_set_role_by_email", {
      _actor: context.userId,
      _email: data.email,
      _grant: data.grant,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
