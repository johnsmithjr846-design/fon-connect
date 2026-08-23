import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LEARNING_PATHS, XP_PER_LESSON, MAX_HEARTS } from "@/lib/lessons";
import { streakBonus } from "@/lib/lessons/gamification";
import {
  DEFAULT_STATS,
  nextStreak,
  resetHeartsIfNewDay,
  todayKey,
  type UserStats,
} from "@/lib/lessons/stats";

export type { UserStats };

export type ProgressSnapshot = {
  lessons: { path_id: string | null; module_id: string; lesson_id: string; xp_earned: number }[];
  quizzes: { module_id: string; score: number; total: number; passed: boolean }[];
  stats: UserStats;
  badges: string[];
  chests: string[];
  /** Cœurs bonus attribués par un administrateur (hors 4 cœurs quotidiens). */
  bonusHearts: number;
};

type ActiveGrant = { id: string; hearts_remaining: number };

/** Attributions admin actives (démarrées, non expirées, non révoquées), les plus proches de l'expiration d'abord. */
async function activeHeartGrants(
  sb: { from: (t: string) => any },
  userId: string,
): Promise<ActiveGrant[]> {
  const now = new Date().toISOString();
  const { data } = await sb
    .from("admin_heart_grants")
    .select("id, hearts_remaining")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .gt("hearts_remaining", 0)
    .lte("starts_at", now)
    .gt("expires_at", now)
    .order("expires_at", { ascending: true });
  return (data ?? []) as ActiveGrant[];
}

export const getLessonProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProgressSnapshot> => {
    const { supabase, userId } = context;
    const [lessons, quizzes, stats, badges, chests] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("path_id, module_id, lesson_id, xp_earned")
        .eq("user_id", userId),
      supabase
        .from("quiz_results")
        .select("module_id, score, total, passed")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_badges").select("badge_id").eq("user_id", userId),
      supabase.from("chest_rewards").select("chest_id").eq("user_id", userId),
    ]);
    if (lessons.error) throw new Error(lessons.error.message);
    if (quizzes.error) throw new Error(quizzes.error.message);

    const raw = (stats.data as UserStats | null) ?? DEFAULT_STATS;
    const grants = await activeHeartGrants(supabase as never, userId);
    return {
      lessons: lessons.data ?? [],
      quizzes: quizzes.data ?? [],
      stats: resetHeartsIfNewDay(raw),
      badges: (badges.data ?? []).map((b) => b.badge_id),
      chests: (chests.data ?? []).map((c) => c.chest_id),
      bonusHearts: grants.reduce((sum, g) => sum + g.hearts_remaining, 0),
    };
  });

const CompleteSchema = z.object({
  pathId: z.string().min(1).max(64),
  lessonId: z.string().min(1).max(64),
  mistakes: z.number().int().min(0).max(200),
  total: z.number().int().min(1).max(200),
});

export type CompleteResult = {
  xpEarned: number;
  bonusPercent: number;
  streak: number;
  xpTotal: number;
  newBadges: string[];
};

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CompleteSchema.parse(input))
  .handler(async ({ data, context }): Promise<CompleteResult> => {
    const { supabase, userId } = context;
    const path = LEARNING_PATHS.find((p) => p.id === data.pathId);
    if (!path || !path.lessons.some((l) => l.id === data.lessonId)) {
      throw new Error("Leçon inconnue");
    }

    const [statsRes, badgeRes, doneRes] = await Promise.all([
      supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_badges").select("badge_id").eq("user_id", userId),
      supabase
        .from("lesson_progress")
        .select("path_id, lesson_id, xp_earned")
        .eq("user_id", userId),
    ]);

    const prev = resetHeartsIfNewDay((statsRes.data as UserStats | null) ?? DEFAULT_STATS);
    const day = todayKey();
    const streak = nextStreak(prev.current_streak, prev.last_active_day);

    const accuracy = Math.max(0, 1 - data.mistakes / data.total);
    const bonus = streakBonus(streak) + (data.mistakes === 0 ? 0.2 : 0);
    const alreadyDone = (doneRes.data ?? []).some(
      (l) => l.lesson_id === data.lessonId && l.path_id === data.pathId,
    );
    const base = alreadyDone ? Math.round(XP_PER_LESSON / 2) : XP_PER_LESSON;
    const xpEarned = Math.max(1, Math.round(base * (1 + bonus)));
    const xpTotal = prev.xp_total + xpEarned;

    const upsertProgress = supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        module_id: data.pathId,
        path_id: data.pathId,
        lesson_id: data.lessonId,
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
        best_accuracy: accuracy,
        attempts: 1,
      },
      { onConflict: "user_id,module_id,lesson_id" },
    );

    const upsertStats = supabase.from("user_stats").upsert(
      {
        user_id: userId,
        xp_total: xpTotal,
        current_streak: streak,
        best_streak: Math.max(prev.best_streak, streak),
        last_active_day: day,
        hearts: prev.hearts,
        hearts_day: prev.hearts_day,
        hearts_updated_at: prev.hearts_updated_at,
      },
      { onConflict: "user_id" },
    );

    const [progressResult, statsResult] = await Promise.all([upsertProgress, upsertStats]);
    if (progressResult.error) throw new Error(progressResult.error.message);
    if (statsResult.error) throw new Error(statsResult.error.message);

    // Badges
    const owned = new Set((badgeRes.data ?? []).map((b) => b.badge_id));
    const completed = new Set(
      (doneRes.data ?? []).map((l) => `${l.path_id ?? ""}:${l.lesson_id}`),
    );
    completed.add(`${data.pathId}:${data.lessonId}`);

    const candidates: string[] = ["first-lesson"];
    if (data.mistakes === 0) candidates.push("perfect-lesson");
    if (streak >= 7) candidates.push("streak-7");
    if (streak >= 30) candidates.push("streak-30");
    if (xpTotal >= 500) candidates.push("xp-500");
    if (xpTotal >= 2000) candidates.push("xp-2000");
    const lesson = path.lessons.find((l) => l.id === data.lessonId);
    if (lesson?.kind === "ai") candidates.push("first-ai");
    if (path.lessons.every((l) => completed.has(`${path.id}:${l.id}`))) {
      candidates.push(`path-${path.id}`);
    }

    const newBadges = candidates.filter((id) => !owned.has(id));
    if (newBadges.length > 0) {
      await supabase
        .from("user_badges")
        .upsert(
          newBadges.map((badge_id) => ({ user_id: userId, badge_id })),
          { onConflict: "user_id,badge_id" },
        );
    }

    return {
      xpEarned,
      bonusPercent: Math.round(bonus * 100),
      streak,
      xpTotal,
      newBadges,
    };
  });

export const loseHeart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{ hearts: number; bonusHearts: number; unlimited: boolean }> => {
      const { supabase, userId } = context;
      const { computeEntitlements } = await import("@/lib/entitlements.server");
      const entitlements = await computeEntitlements(supabase as never, userId);
      if (entitlements.unlimitedHearts)
        return { hearts: MAX_HEARTS, bonusHearts: 0, unlimited: true };

      const { data } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      const prev = resetHeartsIfNewDay((data as UserStats | null) ?? DEFAULT_STATS);
      const grants = await activeHeartGrants(supabase as never, userId);
      let bonusHearts = grants.reduce((sum, g) => sum + g.hearts_remaining, 0);
      let hearts = prev.hearts;

      if (hearts > 0) {
        hearts -= 1;
      } else if (grants.length > 0) {
        // Les cœurs admin ne sont consommés qu'après les cœurs quotidiens.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const target = grants[0]!;
        await supabaseAdmin
          .from("admin_heart_grants")
          .update({ hearts_remaining: target.hearts_remaining - 1 })
          .eq("id", target.id);
        bonusHearts = Math.max(0, bonusHearts - 1);
      }

      const { error } = await supabase.from("user_stats").upsert(
        {
          user_id: userId,
          xp_total: prev.xp_total,
          current_streak: prev.current_streak,
          best_streak: prev.best_streak,
          last_active_day: prev.last_active_day,
          hearts,
          hearts_day: prev.hearts_day,
          hearts_updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) throw new Error(error.message);
      return { hearts, bonusHearts, unlimited: false };
    },
  );

const ChestSchema = z.object({ chestId: z.string().min(1).max(64) });

export const openChest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChestSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ xp: number; already: boolean }> => {
    const { supabase, userId } = context;
    const existing = await supabase
      .from("chest_rewards")
      .select("xp_awarded")
      .eq("user_id", userId)
      .eq("chest_id", data.chestId)
      .maybeSingle();
    if (existing.data) return { xp: existing.data.xp_awarded, already: true };

    const xp = 50 + Math.floor(Math.random() * 3) * 50;
    const { error } = await supabase
      .from("chest_rewards")
      .insert({ user_id: userId, chest_id: data.chestId, xp_awarded: xp });
    if (error) throw new Error(error.message);

    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const prev = (stats as UserStats | null) ?? DEFAULT_STATS;
    await supabase.from("user_stats").upsert(
      {
        user_id: userId,
        xp_total: prev.xp_total + xp,
        current_streak: prev.current_streak,
        best_streak: prev.best_streak,
        last_active_day: prev.last_active_day,
        hearts: prev.hearts,
        hearts_day: prev.hearts_day,
        hearts_updated_at: prev.hearts_updated_at,
      },
      { onConflict: "user_id" },
    );
    return { xp, already: false };
  });

const QuizSchema = z.object({
  moduleId: z.string().min(1).max(64),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  passed: z.boolean(),
});

export const saveQuizResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => QuizSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("quiz_results").insert({
      user_id: context.userId,
      module_id: data.moduleId,
      score: data.score,
      total: data.total,
      passed: data.passed,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
