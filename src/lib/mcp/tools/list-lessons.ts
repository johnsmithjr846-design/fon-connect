import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { LEARNING_PATHS } from "@/lib/lessons";

export default defineTool({
  name: "list_lessons",
  title: "Lister les parcours et leçons de fon",
  description:
    "Liste les parcours d'apprentissage FonConnect et leurs leçons. Fournir pathId pour obtenir le vocabulaire détaillé d'un parcours.",
  inputSchema: {
    pathId: z.string().trim().optional().describe("Identifiant du parcours à détailler."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ pathId }) => {
    if (pathId) {
      const path = LEARNING_PATHS.find((p) => p.id === pathId);
      if (!path) {
        return { content: [{ type: "text" as const, text: `Parcours inconnu : ${pathId}` }], isError: true };
      }
      const lessons = path.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        minutes: l.minutes,
        kind: l.kind,
        vocab: l.vocab.map((v) => ({ fon: v.fon, fr: v.fr, en: v.en, phonetic: v.phonetic })),
      }));
      return {
        content: [
          {
            type: "text" as const,
            text: `${path.title}\n` + lessons.map((l) => `- ${l.id} · ${l.title} (${l.minutes} min)`).join("\n"),
          },
        ],
        structuredContent: { path: { id: path.id, title: path.title, lessons } },
      };
    }

    const paths = LEARNING_PATHS.map((p) => ({
      id: p.id,
      title: p.title,
      titleEn: p.titleEn,
      lessonCount: p.lessons.length,
    }));
    return {
      content: [
        { type: "text" as const, text: paths.map((p) => `- ${p.id} · ${p.title} (${p.lessonCount} leçons)`).join("\n") },
      ],
      structuredContent: { paths },
    };
  },
});
