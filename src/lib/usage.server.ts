import { FREE_AI_QUESTIONS_PER_DAY, FREE_VOICE_SECONDS_PER_DAY } from "@/lib/billing/plans";
import { computeEntitlements } from "@/lib/entitlements.server";

export type UsageKind = "ai" | "voice";

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Identifie l'utilisateur à partir du jeton Bearer (null si non connecté). */
export async function getRequestUserId(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const sb = await admin();
  const { data } = await sb.auth.getUser(token);
  return data.user?.id ?? null;
}

export type UsageStatus = {
  aiUnlimited: boolean;
  voiceUnlimited: boolean;
  aiUsed: number;
  aiLimit: number;
  voiceUsed: number;
  voiceLimit: number;
};

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const sb = await admin();
  const ent = await computeEntitlements(sb as never, userId);
  const { data } = await sb
    .from("usage_daily")
    .select("ai_questions, voice_seconds")
    .eq("user_id", userId)
    .eq("day", today())
    .maybeSingle();
  return {
    aiUnlimited: ent.plans.length > 0,
    voiceUnlimited: ent.translationPremium,
    aiUsed: data?.ai_questions ?? 0,
    aiLimit: FREE_AI_QUESTIONS_PER_DAY,
    voiceUsed: data?.voice_seconds ?? 0,
    voiceLimit: FREE_VOICE_SECONDS_PER_DAY,
  };
}

/** Vérifie le quota du jour puis consomme `amount`. Retourne false si dépassé. */
export async function consumeUsage(userId: string, kind: UsageKind, amount: number) {
  const status = await getUsageStatus(userId);
  if (kind === "ai") {
    if (!status.aiUnlimited && status.aiUsed >= status.aiLimit) return false;
  } else if (!status.voiceUnlimited && status.voiceUsed >= status.voiceLimit) {
    return false;
  }
  const sb = await admin();
  const row = {
    user_id: userId,
    day: today(),
    ai_questions: status.aiUsed + (kind === "ai" ? amount : 0),
    voice_seconds: status.voiceUsed + (kind === "voice" ? Math.ceil(amount) : 0),
  };
  const { error } = await sb.from("usage_daily").upsert(row, { onConflict: "user_id,day" });
  if (error) console.error("usage upsert failed", error);
  return true;
}
