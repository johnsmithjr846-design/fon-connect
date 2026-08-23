import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { LessonHud } from "@/components/lessons/LessonHud";
import { HeartsEmptyState } from "@/components/lessons/HeartsEmptyState";
import { useEntitlements } from "@/hooks/useEntitlements";
import { ExercisePlayer } from "@/components/lessons/ExercisePlayer";
import { BadgeChip } from "@/components/lessons/BadgeGrid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getLesson, getPath, MAX_HEARTS } from "@/lib/lessons";
import { buildExercises } from "@/lib/lessons/exercises";
import { completeLesson, loseHeart, type CompleteResult } from "@/lib/lessons.functions";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export const Route = createFileRoute("/lecons/$moduleId/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.moduleId, params.lessonId);
    if (!lesson) throw notFound();
    return { title: lesson.title, minutes: lesson.minutes };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Leçon indisponible — FonConnect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.title} — Leçon de fon — FonConnect`;
    const description = `Leçon de fon de ${loaderData.minutes} minutes : vocabulaire, exercices interactifs et prononciation.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { moduleId, lessonId } = Route.useParams();
  const path = getPath(moduleId)!;
  const lesson = getLesson(moduleId, lessonId)!;
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { user, stats, bonusHearts, invalidate } = useLessonProgress();

  const exercises = useMemo(() => buildExercises(moduleId, lesson), [moduleId, lesson]);
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<CompleteResult | null>(null);

  const complete = useServerFn(completeLesson);
  const drop = useServerFn(loseHeart);

  const completion = useMutation({
    mutationFn: (payload: { mistakes: number; total: number }) =>
      complete({ data: { pathId: moduleId, lessonId, ...payload } }),
    onSuccess: async (data) => {
      setResult(data);
      await invalidate();
    },
  });
  const heartMutation = useMutation({
    mutationFn: () => drop({}),
    onSuccess: () => invalidate(),
  });

  function finish(finalMistakes: number, total: number) {
    if (user) completion.mutate({ mistakes: finalMistakes, total });
    else setResult({ xpEarned: 0, bonusPercent: 0, streak: 0, xpTotal: 0, newBadges: [] });
  }

  function onResult(correct: boolean) {
    const nextMistakes = correct ? mistakes : mistakes + 1;
    if (!correct) {
      setMistakes(nextMistakes);
      if (user && !unlimitedHearts) heartMutation.mutate();
    }
    if (step + 1 >= exercises.length) {
      finish(nextMistakes, Math.max(1, exercises.length));
      return;
    }
    setStep(step + 1);
  }

  const { entitlements } = useEntitlements();
  const unlimitedHearts = entitlements.unlimitedHearts;
  const hearts = user && !unlimitedHearts ? stats.hearts : MAX_HEARTS;
  const bonus = user && !unlimitedHearts ? bonusHearts : 0;
  const isAi = lesson.kind === "ai";

  if (result) {
    return (
      <LessonComplete
        result={result}
        pathId={moduleId}
        onRetry={() => {
          setResult(null);
          setStep(0);
          setMistakes(0);
        }}
      />
    );
  }

  if (isAi) {
    return (
      <AiLesson
        pathId={moduleId}
        lessonId={lessonId}
        onFinish={() => finish(0, 1)}
        pending={completion.isPending}
      />
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
          <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
          <Button className="mt-6" onClick={() => finish(0, 1)}>
            {t("lessons.ex.continue")}
          </Button>
        </main>
      </div>
    );
  }

  const exercise = exercises[step]!;
  const outOfHearts = Boolean(user) && !unlimitedHearts && hearts <= 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LessonHud
        progress={step / exercises.length}
        hearts={hearts}
        unlimited={unlimitedHearts}
        onQuit={() => void navigate({ to: "/lecons/$moduleId", params: { moduleId } })}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-6">
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? path.titleEn : path.title} · {lesson.title}
        </p>
        <SignInBanner messageKey="lessons.signInLesson" />
        {outOfHearts ? (
          <HeartsEmptyState
            backTo={
              <Button
                variant="outline"
                onClick={() => void navigate({ to: "/lecons/$moduleId", params: { moduleId } })}
              >
                {t("lessons.backToPath")}
              </Button>
            }
          />
        ) : (
          <div className="mt-4 flex flex-1 flex-col">
            <ExercisePlayer key={exercise.id} exercise={exercise} onResult={onResult} />
          </div>
        )}

        {lesson.culture && step === 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t("lessons.culture")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{lesson.culture}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function LessonComplete({
  result,
  pathId,
  onRetry,
}: {
  result: CompleteResult;
  pathId: string;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-16 text-center">
        <div className="text-6xl" aria-hidden>
          🎉
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">{t("lessons.completeTitle")}</h1>
        <p className="mt-3 text-3xl font-extrabold text-primary">
          {t("lessons.completeXp", { xp: result.xpEarned })}
        </p>
        {result.bonusPercent > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("lessons.completeBonus", { percent: result.bonusPercent })}
          </p>
        )}
        {result.newBadges.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">{t("lessons.newBadges")}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {result.newBadges.map((id) => (
                <BadgeChip key={id} id={id} />
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link to="/lecons/$moduleId" params={{ moduleId: pathId }}>
              {t("lessons.backToPath")}
            </Link>
          </Button>
          <Button variant="outline" onClick={onRetry}>
            {t("lessons.retryLesson")}
          </Button>
        </div>
      </main>
    </div>
  );
}

function AiLesson({
  pathId,
  lessonId,
  onFinish,
  pending,
}: {
  pathId: string;
  lessonId: string;
  onFinish: () => void;
  pending: boolean;
}) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/lesson-chat",
      body: { pathId, lessonId },
    }),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8">
        <h1 className="text-xl font-bold text-foreground">{getLesson(pathId, lessonId)?.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lessons.aiIntro")}</p>
        <SignInBanner messageKey="lessons.signInLesson" />

        <div className="mt-6 flex-1 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl border p-3 text-sm ${
                message.role === "user"
                  ? "ml-8 border-primary/40 bg-secondary text-secondary-foreground"
                  : "mr-8 border-border bg-card text-card-foreground"
              }`}
            >
              {message.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          ))}
        </div>

        <form
          className="mt-6 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text) return;
            setInput("");
            void sendMessage({ text });
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("lessons.aiPlaceholder")}
            rows={2}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={status === "streaming"}>
            <Send className="size-4" aria-hidden />
            <span className="sr-only">{t("lessons.aiSend")}</span>
          </Button>
        </form>

        <Button variant="outline" className="mt-4" disabled={pending} onClick={onFinish}>
          {t("lessons.aiFinish")}
        </Button>
      </main>
    </div>
  );
}
