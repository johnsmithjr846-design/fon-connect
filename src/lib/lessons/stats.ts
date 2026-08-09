import { MAX_HEARTS, HEART_REFILL_MINUTES } from "@/lib/lessons";

export type UserStats = {
  xp_total: number;
  current_streak: number;
  best_streak: number;
  hearts: number;
  hearts_updated_at: string;
  last_active_day: string | null;
};

export const DEFAULT_STATS: UserStats = {
  xp_total: 0,
  current_streak: 0,
  best_streak: 0,
  hearts: MAX_HEARTS,
  hearts_updated_at: new Date(0).toISOString(),
  last_active_day: null,
};

/** Recharge progressive : 1 cœur toutes les HEART_REFILL_MINUTES minutes. */
export function refillHearts(stats: UserStats): UserStats {
  if (stats.hearts >= MAX_HEARTS) return stats;
  const elapsed = Date.now() - new Date(stats.hearts_updated_at).getTime();
  const gained = Math.floor(elapsed / (HEART_REFILL_MINUTES * 60_000));
  if (gained <= 0) return stats;
  const hearts = Math.min(MAX_HEARTS, stats.hearts + gained);
  return {
    ...stats,
    hearts,
    hearts_updated_at:
      hearts >= MAX_HEARTS
        ? new Date().toISOString()
        : new Date(
            new Date(stats.hearts_updated_at).getTime() + gained * HEART_REFILL_MINUTES * 60_000,
          ).toISOString(),
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function nextStreak(previous: number, lastActiveDay: string | null): number {
  if (!lastActiveDay) return 1;
  const diff = dayDiff(lastActiveDay, todayKey());
  if (diff === 0) return Math.max(previous, 1);
  if (diff === 1) return previous + 1;
  return 1;
}
