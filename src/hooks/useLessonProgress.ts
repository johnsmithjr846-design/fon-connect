import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLessonProgress, type ProgressSnapshot } from "@/lib/lessons.functions";
import { useAuthUser } from "@/hooks/useAuthUser";
import { DEFAULT_STATS } from "@/lib/lessons/stats";
import { levelForXp, nextLevel } from "@/lib/lessons/gamification";

const EMPTY: ProgressSnapshot = {
  lessons: [],
  quizzes: [],
  stats: DEFAULT_STATS,
  badges: [],
  chests: [],
};

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
    stats: data.stats,
    badges: data.badges,
    chests: data.chests,
    level: levelForXp(data.stats.xp_total),
    next: nextLevel(data.stats.xp_total),
    isLessonDone: (pathId: string, lessonId: string) =>
      data.lessons.some(
        (l) => (l.path_id ?? l.module_id) === pathId && l.lesson_id === lessonId,
      ),
    pathDoneCount: (pathId: string) =>
      data.lessons.filter((l) => (l.path_id ?? l.module_id) === pathId).length,
    hasBadge: (badgeId: string) => data.badges.includes(badgeId),
    isChestOpen: (chestId: string) => data.chests.includes(chestId),
    bestQuiz: (moduleId: string) =>
      data.quizzes
        .filter((q) => q.module_id === moduleId)
        .sort((a, b) => b.score / b.total - a.score / a.total)[0] ?? null,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] }),
  };
}
