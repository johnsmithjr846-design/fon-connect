import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "my_progress",
  title: "Ma progression FonConnect",
  description:
    "Retourne la progression de l'utilisateur connecté : leçons terminées, XP gagné et précision moyenne.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text" as const, text: "Non authentifié." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("path_id, module_id, lesson_id, xp_earned, best_accuracy, attempts, completed_at")
      .order("completed_at", { ascending: false })
      .limit(200);

    if (error) {
      return { content: [{ type: "text" as const, text: error.message }], isError: true };
    }

    const rows = data ?? [];
    const totalXp = rows.reduce((n, r) => n + (r.xp_earned ?? 0), 0);
    const summary = {
      lessonsCompleted: rows.length,
      totalXp,
      averageAccuracy: rows.length
        ? Math.round(rows.reduce((n, r) => n + (r.best_accuracy ?? 0), 0) / rows.length)
        : 0,
      recent: rows.slice(0, 10),
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${summary.lessonsCompleted} leçons terminées · ${totalXp} XP · précision moyenne ${summary.averageAccuracy}%`,
        },
      ],
      structuredContent: summary,
    };
  },
});
