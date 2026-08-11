import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { StatsBar } from "@/components/lessons/StatsBar";
import { LEARNING_PATHS } from "@/lib/lessons";
import { PATH_EMOJI, pathIllustration } from "@/lib/lessons/illustrations";
import { AdSlot } from "@/components/AdSlot";

import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/lecons/")({
  component: LessonsIndex,
  head: () => ({
    meta: [
      { title: "Leçons de fon — 8 parcours progressifs — FonConnect" },
      {
        name: "description",
        content:
          "Apprenez le fon du Bénin comme sur Duolingo : 8 parcours, leçons courtes, exercices, prononciation, XP, séries et badges.",
      },
      { property: "og:title", content: "Leçons de fon — 8 parcours progressifs — FonConnect" },
      {
        property: "og:description",
        content: "Parcours gamifiés, exercices variés et prononciation pour apprendre le fon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/lecons" }],
  }),
});

function LessonsIndex() {
  const { pathDoneCount } = useLessonProgress();
  const { t, lang } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("lessons.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lessons.intro")}</p>

        <StatsBar />
        <SignInBanner />

        <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {t("lessons.paths")}
        </h2>

        <div className="mt-4 space-y-4">
          {LEARNING_PATHS.map((path, i) => {
            const done = pathDoneCount(path.id);
            const total = path.lessons.length;
            const pct = Math.round((done / total) * 100);
            const previous = LEARNING_PATHS[i - 1];
            const unlocked =
              i === 0 ||
              (previous
                ? pathDoneCount(previous.id) >= Math.ceil(previous.lessons.length * 0.8)
                : true);

            const illustration = pathIllustration(path.id);

            const inner = (
              <>
                {illustration && (
                  <img
                    src={illustration}
                    alt=""
                    loading="lazy"
                    className="mb-4 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: path.color }}
                      aria-hidden
                    >
                      {PATH_EMOJI[path.id] ?? path.index}
                    </span>
                    <h3 className="text-base font-semibold text-card-foreground">
                      {lang === "en" ? path.titleEn : path.title}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {t("lessons.lessonsCount", { count: total })}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: path.color }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {unlocked ? t("lessons.progress", { done, total }) : t("lessons.pathLocked")}
                </p>
              </>
            );


            return unlocked ? (
              <Link
                key={path.id}
                to="/lecons/$moduleId"
                params={{ moduleId: path.id }}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={path.id}
                className="block rounded-xl border border-dashed border-border bg-card/50 p-5 opacity-60"
              >
                {inner}
              </div>
            );
          })}
        </div>
        <AdSlot placement="lessons" />
      </main>

    </div>
  );
}
