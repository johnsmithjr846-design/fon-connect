import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Gift, Lock, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { StatsBar } from "@/components/lessons/StatsBar";
import { Button } from "@/components/ui/button";
import { CHEST_EVERY, chestId, getPath } from "@/lib/lessons";
import { openChest } from "@/lib/lessons.functions";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/lecons/$moduleId/")({
  loader: ({ params }) => {
    const path = getPath(params.moduleId);
    if (!path) throw notFound();
    return { title: path.title, count: path.lessons.length };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Parcours indisponible — FonConnect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.title} — Parcours de fon — FonConnect`;
    const description = `${loaderData.count} leçons de fon dans le parcours ${loaderData.title} : vocabulaire, exercices, prononciation et quiz.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PathPage,
});

function PathPage() {
  const { moduleId } = Route.useParams();
  const path = getPath(moduleId)!;
  const { t, lang } = useI18n();
  const { user, isLessonDone, isChestOpen, invalidate, bestQuiz } = useLessonProgress();

  const open = useServerFn(openChest);
  const chestMutation = useMutation({
    mutationFn: (id: string) => open({ data: { chestId: id } }),
    onSuccess: () => invalidate(),
  });

  const quiz = bestQuiz(path.id);
  const allDone = path.lessons.every((l) => isLessonDone(path.id, l.id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <Link
          to="/lecons"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          ← {t("lessons.paths")}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {lang === "en" ? path.titleEn : path.title}
        </h1>
        <StatsBar />
        <SignInBanner />

        <ol className="mt-10 space-y-4">
          {path.lessons.map((lesson, i) => {
            const done = isLessonDone(path.id, lesson.id);
            const previous = path.lessons[i - 1];
            const unlocked = i === 0 || (previous ? isLessonDone(path.id, previous.id) : true);
            const offset = ["ml-0", "ml-10", "ml-20", "ml-10"][i % 4];
            const showChest = (i + 1) % CHEST_EVERY === 0;
            const id = chestId(path.id, i + 1);
            const chestOpened = isChestOpen(id);

            return (
              <li key={lesson.id} className="space-y-4">
                <div className={`flex items-center gap-4 ${offset}`}>
                  {unlocked ? (
                    <Link
                      to="/lecons/$moduleId/$lessonId"
                      params={{ moduleId: path.id, lessonId: lesson.id }}
                      className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-background text-white shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: done ? path.color : "var(--muted-foreground)" }}
                      aria-label={lesson.title}
                    >
                      {done ? (
                        <Check className="size-6" aria-hidden />
                      ) : (
                        <Star className="size-6" aria-hidden />
                      )}
                    </Link>
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Lock className="size-5" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {unlocked
                        ? done
                          ? t("lessons.done")
                          : `${lesson.minutes} min`
                        : t("lessons.lessonLocked")}
                    </p>
                  </div>
                </div>

                {showChest && (
                  <div className="ml-6 flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 p-3">
                    <Gift className="size-5 text-primary" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-card-foreground">
                        {t("lessons.chest")}
                      </p>
                    </div>
                    {chestOpened ? (
                      <span className="text-xs text-muted-foreground">{t("lessons.done")}</span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!user || !done || chestMutation.isPending}
                        onClick={() => chestMutation.mutate(id)}
                      >
                        {t("lessons.chestOpen")}
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-10 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-card-foreground">{t("lessons.pathQuiz")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {allDone ? t("lessons.quizUnlocked") : t("lessons.quizLocked")}
            {quiz && t("lessons.bestScore", { score: quiz.score, total: quiz.total })}
          </p>
          <Button asChild className="mt-4" disabled={!allDone}>
            <Link to="/lecons/$moduleId/quiz" params={{ moduleId: path.id }}>
              {t("lessons.startQuiz")}
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
