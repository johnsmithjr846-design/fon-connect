import { Flame, Heart, Infinity as InfinityIcon, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useEntitlements } from "@/hooks/useEntitlements";

export function StatsBar() {
  const { user, stats, level, bonusHearts } = useLessonProgress();
  const { entitlements } = useEntitlements();
  const { t, lang } = useI18n();
  if (!user) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        <Star className="size-3.5" aria-hidden />
        {t("lessons.xp", { xp: stats.xp_total })}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        <Flame className="size-3.5" aria-hidden />
        {t("lessons.streak", { days: stats.current_streak })}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        <Heart className="size-3.5" aria-hidden />
        {entitlements.unlimitedHearts ? (
          <InfinityIcon className="size-3.5" aria-hidden />
        ) : (
          stats.hearts
        )}
      </span>
      {!entitlements.unlimitedHearts && bonusHearts > 0 && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
          title={lang === "en" ? "Bonus hearts granted by the team" : "Cœurs bonus offerts par l'équipe"}
        >
          <Heart className="size-3.5" aria-hidden />+{bonusHearts}{" "}
          {lang === "en" ? "bonus" : "bonus"}
        </span>
      )}
      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
        {t("lessons.level", {
          level: level.level,
          title: lang === "en" ? level.titleEn : level.title,
        })}
      </span>
    </div>
  );
}
