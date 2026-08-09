import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { getPath } from "@/lib/lessons";
import { buildPathQuiz, QUIZ_PASS_RATIO } from "@/lib/lessons/quiz";
import { saveQuizResult } from "@/lib/lessons.functions";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/lecons/$moduleId/quiz")({
  loader: ({ params }) => {
    const path = getPath(params.moduleId);
    if (!path) throw notFound();
    return { title: path.title };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Quiz indisponible — FonConnect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Quiz — ${loaderData.title} — FonConnect`;
    const description = `Testez vos connaissances en fon sur le parcours ${loaderData.title}.`;
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
  component: QuizPage,
});

function QuizPage() {
  const { moduleId } = Route.useParams();
  const path = getPath(moduleId)!;
  const { user, invalidate } = useLessonProgress();
  const { t, lang } = useI18n();
  const questions = useMemo(() => buildPathQuiz(path), [path]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const save = useServerFn(saveQuizResult);
  const mutation = useMutation({
    mutationFn: (payload: { score: number; total: number; passed: boolean }) =>
      save({ data: { moduleId, ...payload } }),
    onSuccess: () => invalidate(),
  });

  const total = questions.length;
  const score = questions.filter((q) => answers[q.id] === q.answer).length;
  const passed = total > 0 && score / total >= QUIZ_PASS_RATIO;

  function onSubmit() {
    setSubmitted(true);
    if (user) mutation.mutate({ score, total, passed });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <Link
          to="/lecons/$moduleId"
          params={{ moduleId }}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          ← {lang === "en" ? path.titleEn : path.title}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("quiz.title", { module: lang === "en" ? path.titleEn : path.title })}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("quiz.intro", { total, ratio: Math.round(QUIZ_PASS_RATIO * 100) })}
        </p>

        <SignInBanner messageKey="lessons.signInScore" />

        <div className="mt-8 space-y-5">
          {questions.map((q, i) => (
            <fieldset key={q.id} className="rounded-xl border border-border bg-card p-5">
              <legend className="px-1 text-sm font-semibold text-card-foreground">
                {i + 1}. {lang === "en" ? q.promptEn : q.prompt}
              </legend>
              <div className="mt-3 space-y-2">
                {q.options.map((option) => {
                  const selected = answers[q.id] === option;
                  const isAnswer = option === q.answer;
                  const state =
                    submitted && isAnswer
                      ? "border-primary bg-primary/10"
                      : submitted && selected
                        ? "border-destructive bg-destructive/10"
                        : selected
                          ? "border-primary"
                          : "border-border";
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${state}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={selected}
                        disabled={submitted}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                        className="accent-[var(--primary)]"
                      />
                      <span className="text-foreground">{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <p className="text-base font-semibold text-card-foreground">
              {t("quiz.score", { score, total })} {passed ? t("quiz.passed") : t("quiz.retry")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                {t("quiz.restart")}
              </Button>
              <Button asChild>
                <Link to="/lecons/$moduleId" params={{ moduleId }}>
                  {t("lessons.backToPath")}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            className="mt-8"
            disabled={Object.keys(answers).length < total}
            onClick={onSubmit}
          >
            {t("quiz.submit")}
          </Button>
        )}
      </main>
    </div>
  );
}
