import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  FON_SYSTEM_CONTEXT,
  getLovableAiGatewayRunId,
} from "@/lib/ai-gateway.server";
import { LEARNING_PATHS } from "@/lib/lessons";

type LessonChatBody = { messages?: unknown; pathId?: unknown; lessonId?: unknown };

export const Route = createFileRoute("/api/lesson-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as LessonChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const path = LEARNING_PATHS.find((p) => p.id === body.pathId);
        const lesson = path?.lessons.find((l) => l.id === body.lessonId);
        if (!path || !lesson) {
          return new Response("Unknown lesson", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const vocab = lesson.vocab
          .map((v) => `- ${v.fon} = ${v.fr} / ${v.en}`)
          .join("\n");
        const turns = (lesson.aiTurns ?? []).map((t) => `- ${t.fon}`).join("\n");

        const system = `${FON_SYSTEM_CONTEXT}

Tu animes une mini-conversation d'entraînement en fon pour la leçon « ${lesson.title} » (parcours ${path.title}).
Règles :
- Parle d'abord en fon (phrases très courtes), puis donne la traduction française entre parenthèses.
- Reste strictement dans le vocabulaire de la leçon ci-dessous ; n'introduis pas de mots nouveaux.
- Pose une seule question à la fois, encourage l'apprenant, corrige gentiment.
- Après 5 échanges, conclus par « Mi yì nú ! » et un court bilan en français.

Vocabulaire de la leçon :
${vocab || "(aucun)"}

Répliques modèles :
${turns || "(aucune)"}`;

        const gateway = createLovableAiGatewayProvider(key, getLovableAiGatewayRunId(request));
        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
      },
    },
  },
});
