import { BADGES, getBadge } from "@/lib/lessons/gamification";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function BadgeGrid({ owned }: { owned: string[] }) {
  const { lang } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {BADGES.map((badge) => {
        const has = owned.includes(badge.id);
        return (
          <div
            key={badge.id}
            className={`rounded-xl border p-3 text-center transition-colors ${
              has ? "border-primary/50 bg-card" : "border-dashed border-border bg-card/50 opacity-60"
            }`}
          >
            <div className="text-2xl" aria-hidden>
              {has ? badge.icon : "🔒"}
            </div>
            <p className="mt-1 text-sm font-semibold text-card-foreground">
              {lang === "en" ? badge.titleEn : badge.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {lang === "en" ? badge.descriptionEn : badge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function BadgeChip({ id }: { id: string }) {
  const { lang } = useI18n();
  const badge = getBadge(id);
  if (!badge) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
      <span aria-hidden>{badge.icon}</span>
      {lang === "en" ? badge.titleEn : badge.title}
    </span>
  );
}
