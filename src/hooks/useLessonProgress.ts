import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLessonProgress, type ProgressSnapshot } from "@/lib/lessons.functions";
import { useAuthUser } from "@/hooks/useAuthUser";

const EMPTY: ProgressSnapshot = { lessons: [], quizzes: [] };

export function useLessonProgress() {
  const { user, loading } = useAuthUser();
  const fetchProgress = useServerFn(getLessonProgress);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lesson-progress", user?.id],
    queryFn: () => fetchProgress(),
    enabled: Boolean(user),
  });

  const data = query.data ?? EMPTY;

  return {
    user,
    authLoading: loading,
    progress: data,
    isLessonDone: (moduleId: string, lessonId: string) =>
      data.lessons.some((l) => l.module_id === moduleId && l.lesson_id === lessonId),
    bestQuiz: (moduleId: string) =>
      data.quizzes
        .filter((q) => q.module_id === moduleId)
        .sort((a, b) => b.score / b.total - a.score / a.total)[0] ?? null,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] }),
  };
}
