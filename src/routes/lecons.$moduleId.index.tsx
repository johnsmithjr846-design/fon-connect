import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SignInBanner } from "@/components/lessons/SignInBanner";
import { getModule } from "@/lib/lessons-data";
import { useLessonProgress } from "@/hooks/useLessonProgress";

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
          ← Tous les modules
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {module.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>

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
                    {index + 1}. {lesson.title}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {done ? "Terminée ✓" : locked ? "Verrouillée" : `${lesson.items.length} phrases`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{lesson.objective}</p>
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
          <h2 className="text-base font-semibold text-card-foreground">Quiz du module</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {allDone
              ? "Toutes les leçons sont terminées : testez-vous."
              : "Terminez les leçons pour débloquer le quiz."}
            {quiz ? ` Meilleur score : ${quiz.score}/${quiz.total}.` : ""}
          </p>
          {allDone && (
            <Link
              to="/lecons/$moduleId/quiz"
              params={{ moduleId }}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Lancer le quiz
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
