import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { LESSON_MODULES } from "@/lib/lessons-data";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/lecons/")({
  component: LessonsIndex,
  head: () => ({
    meta: [
      { title: "Leçons de fon — parcours progressif — FonConnect" },
      {
        name: "description",
        content:
          "Apprenez le fon du Bénin pas à pas : modules courts, vocabulaire audio, phonétique et quiz de fin de module.",
      },
      { property: "og:title", content: "Leçons de fon — parcours progressif — FonConnect" },
      {
        property: "og:description",
        content: "Modules courts, prononciation audio et quiz pour apprendre le fon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/lecons" }],
  }),
});

function LessonsIndex() {
  const { isLessonDone, bestQuiz } = useLessonProgress();
  const { t, lang } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("lessons.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lessons.intro")}</p>

        <SignInBanner />

        <div className="mt-8 space-y-4">
          {LESSON_MODULES.map((module) => {
            const done = module.lessons.filter((l) => isLessonDone(module.id, l.id)).length;
            const quiz = bestQuiz(module.id);
            const pct = Math.round((done / module.lessons.length) * 100);
            return (
              <Link
                key={module.id}
                to="/lecons/$moduleId"
                params={{ moduleId: module.id }}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-card-foreground">
                    {lang === "en" ? module.titleEn : module.title}
                  </h2>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {lang === "en" ? module.levelEn : module.level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "en" ? module.descriptionEn : module.description}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("lessons.progress", { done, total: module.lessons.length })}
                  {quiz
                    ? `${t("lessons.quizScore", { score: quiz.score, total: quiz.total })}${quiz.passed ? " ✓" : ""}`
                    : ""}
                </p>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">{t("lessons.footnote")}</p>
      </main>
    </div>
  );
}
