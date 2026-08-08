import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { getModule } from "@/lib/lessons-data";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/lecons/$moduleId/")({
  loader: ({ params }) => {
    const module = getModule(params.moduleId);
    if (!module) throw notFound();
    return { title: module.title, description: module.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Module indisponible — FonConnect" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Leçons de fon — FonConnect`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const module = getModule(moduleId)!;
  const { isLessonDone, bestQuiz } = useLessonProgress();
  const { t, lang } = useI18n();
  const quiz = bestQuiz(moduleId);
  const allDone = module.lessons.every((l) => isLessonDone(moduleId, l.id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <Link
          to="/lecons"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          ← {t("lessons.allModules")}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {lang === "en" ? module.titleEn : module.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "en" ? module.descriptionEn : module.description}
        </p>

        <SignInBanner />

        <ol className="mt-8 space-y-3">
          {module.lessons.map((lesson, index) => {
            const done = isLessonDone(moduleId, lesson.id);
            const previous = module.lessons[index - 1];
            const locked = index > 0 && previous ? !isLessonDone(moduleId, previous.id) : false;
            const body = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-card-foreground">
                    {index + 1}. {lang === "en" ? lesson.titleEn : lesson.title}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {done
                      ? t("lessons.done")
                      : locked
                        ? t("lessons.locked")
                        : t("lessons.phraseCount", { count: lesson.items.length })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "en" ? lesson.objectiveEn : lesson.objective}
                </p>
              </>
            );
            return (
              <li key={lesson.id}>
                {locked ? (
                  <div className="rounded-xl border border-dashed border-border bg-card/60 p-5 opacity-70">
                    {body}
                  </div>
                ) : (
                  <Link
                    to="/lecons/$moduleId/$lessonId"
                    params={{ moduleId, lessonId: lesson.id }}
                    className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent"
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-card-foreground">{t("lessons.moduleQuiz")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {allDone ? t("lessons.quizUnlocked") : t("lessons.quizLocked")}
            {quiz ? t("lessons.bestScore", { score: quiz.score, total: quiz.total }) : ""}
          </p>
          {allDone && (
            <Link
              to="/lecons/$moduleId/quiz"
              params={{ moduleId }}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("lessons.startQuiz")}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
