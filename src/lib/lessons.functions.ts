import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProgressSnapshot = {
  lessons: { module_id: string; lesson_id: string }[];
  quizzes: { module_id: string; score: number; total: number; passed: boolean }[];
};

export const getLessonProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProgressSnapshot> => {
    const { supabase, userId } = context;
    const [lessons, quizzes] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("module_id, lesson_id")
        .eq("user_id", userId),
      supabase
        .from("quiz_results")
        .select("module_id, score, total, passed")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    if (lessons.error) throw new Error(lessons.error.message);
    if (quizzes.error) throw new Error(quizzes.error.message);
    return { lessons: lessons.data ?? [], quizzes: quizzes.data ?? [] };
  });

const CompleteSchema = z.object({
  moduleId: z.string().min(1).max(64),
  lessonId: z.string().min(1).max(64),
});

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CompleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("lesson_progress").upsert(
      {
        user_id: context.userId,
        module_id: data.moduleId,
        lesson_id: data.lessonId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id,lesson_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const QuizSchema = z.object({
  moduleId: z.string().min(1).max(64),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  passed: z.boolean(),
});

export const saveQuizResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => QuizSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("quiz_results").insert({
      user_id: context.userId,
      module_id: data.moduleId,
      score: data.score,
      total: data.total,
      passed: data.passed,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
