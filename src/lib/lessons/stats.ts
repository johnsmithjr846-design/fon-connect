import { MAX_HEARTS } from "@/lib/lessons";

export type UserStats = {
  xp_total: number;
  current_streak: number;
  best_streak: number;
  hearts: number;
  hearts_day: string | null;
  hearts_updated_at: string;
  last_active_day: string | null;
};

export const APP_TIMEZONE = "Europe/Paris";

export const DEFAULT_STATS: UserStats = {
  xp_total: 0,
  current_streak: 0,
  best_streak: 0,
  hearts: MAX_HEARTS,
  hearts_day: null,
  hearts_updated_at: new Date(0).toISOString(),
  last_active_day: null,
};

/** Jour courant (AAAA-MM-JJ) dans le fuseau du service. */
export function todayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Millisecondes restantes avant la réinitialisation quotidienne (00:00 heure locale du service). */
export function msUntilReset(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const elapsed = (get("hour") % 24) * 3_600_000 + get("minute") * 60_000 + get("second") * 1000;
  return Math.max(0, 86_400_000 - elapsed);
}

/**
 * Les cœurs ne se rechargent pas dans la journée et ne se cumulent pas :
 * ils sont remis à MAX_HEARTS au premier accès d'un nouveau jour.
 */
export function resetHeartsIfNewDay(stats: UserStats): UserStats {
  const day = todayKey();
  if (stats.hearts_day === day) return stats;
  return {
    ...stats,
    hearts: MAX_HEARTS,
    hearts_day: day,
    hearts_updated_at: new Date().toISOString(),
  };
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
