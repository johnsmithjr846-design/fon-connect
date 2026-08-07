import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { SpeakButton } from "@/components/voice/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import { getLesson, getModule } from "@/lib/lessons-data";
import { completeLesson } from "@/lib/lessons.functions";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/lecons/$moduleId/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.moduleId, params.lessonId);
    if (!lesson) throw notFound();
    return { title: lesson.title, objective: lesson.objective };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Leçon indisponible — FonConnect" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Leçon de fon — FonConnect`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.objective },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.objective },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { moduleId, lessonId } = Route.useParams();
  const navigate = useNavigate();
  const module = getModule(moduleId)!;
  const lesson = getLesson(moduleId, lessonId)!;
  const speech = useSpeech();
  const { user, isLessonDone, invalidate } = useLessonProgress();
  const done = isLessonDone(moduleId, lessonId);

  const markDone = useServerFn(completeLesson);
  const mutation = useMutation({
    mutationFn: () => markDone({ data: { moduleId, lessonId } }),
    onSuccess: async () => {
      await invalidate();
      void navigate({ to: "/lecons/$moduleId", params: { moduleId } });
    },
  });

  const index = module.lessons.findIndex((l) => l.id === lessonId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <Link
          to="/lecons/$moduleId"
          params={{ moduleId }}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          ← {module.title}
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Leçon {index + 1} / {module.lessons.length}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {lesson.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{lesson.objective}</p>

        <SignInBanner message="Connectez-vous pour marquer cette leçon comme terminée." />

        {speech.error && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {speech.error}
          </p>
        )}

        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {lesson.items.map((item) => {
            const id = `${lessonId}-${item.fon}`;
            return (
              <li key={id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-card-foreground">{item.fon}</p>
                  {item.phonetic && (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">[{item.phonetic}]</p>
                  )}
                  <p className="mt-1 text-sm text-foreground">🇫🇷 {item.fr}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">🇬🇧 {item.en}</p>
                </div>
                <SpeakButton
                  speaking={speech.speakingId === id}
                  onSpeak={() => void speech.speak(id, item.phonetic || item.fon, "fon")}
                  onStop={speech.stop}
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={!user || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {done ? "Revoir plus tard · déjà terminée" : mutation.isPending ? "Enregistrement…" : "Marquer comme terminée"}
          </Button>
          {mutation.isError && (
            <span className="text-sm text-destructive">L'enregistrement a échoué.</span>
          )}
        </div>
      </main>
    </div>
  );
}
