import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  DEFAULT_LLM_MODEL,
  FON_SYSTEM_CONTEXT,
  getLovableAiGatewayRunId,
} from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown };

const ASSISTANT_PROMPT = `${FON_SYSTEM_CONTEXT}

Tu es « Ayi », l'assistant IA de FonConnect : un professeur de fon bienveillant et patient.
- Réponds toujours en français, avec les exemples en fon suivis de leur prononciation entre parenthèses.
- Corrige gentiment les erreurs de l'utilisateur et explique pourquoi.
- Ajoute du contexte culturel béninois quand c'est utile (salutations, respect des aînés, marché, cérémonies).
- Réponses courtes et structurées (listes ou paragraphes brefs), sans jargon linguistique inutile.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key, getLovableAiGatewayRunId(request));
        const result = streamText({
          model: gateway(DEFAULT_LLM_MODEL),
          system: ASSISTANT_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
