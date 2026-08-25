import { createFileRoute } from "@tanstack/react-router";

type SpeechBody = { text?: unknown; lang?: unknown; level?: unknown };

const FON_INSTRUCTIONS_BEGINNER =
  "Lis ce texte à un rythme légèrement ralenti mais naturel, comme un locuteur natif s'adressant à un débutant. Articule clairement, sans traîner sur chaque syllabe.";
const FON_INSTRUCTIONS_FLUENT =
  "Lis ce texte à un rythme naturel et fluide, comme le ferait un locuteur natif du fon dans une conversation courante. Articule clairement, sans ralentir excessivement.";
const FR_INSTRUCTIONS = "Lis ce texte en français, d'une voix chaleureuse, claire et posée.";
const EN_INSTRUCTIONS = "Read this text in clear, warm, natural English at a calm pace.";

const FON_SPEED_BY_LEVEL: Record<string, number> = {
  debutant: 0.95,
  intermediaire: 1.0,
  avance: 1.05,
};

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Service vocal non configuré.", { status: 500 });

        const { text, lang, level } = (await request.json()) as SpeechBody;
        if (typeof text !== "string" || !text.trim()) {
          return new Response("Texte requis.", { status: 400 });
        }
        const input = text.trim().slice(0, 2000);
        const isFon = lang === "fon";
        const normalizedLevel = typeof level === "string" && level in FON_SPEED_BY_LEVEL ? level : "intermediaire";
        const instructions = isFon
          ? normalizedLevel === "debutant"
            ? FON_INSTRUCTIONS_BEGINNER
            : FON_INSTRUCTIONS_FLUENT
          : lang === "en"
            ? EN_INSTRUCTIONS
            : FR_INSTRUCTIONS;
        const speed = isFon ? FON_SPEED_BY_LEVEL[normalizedLevel] : 1;


        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            "Lovable-API-Key": key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input,
            voice: "alloy",
            instructions,
            speed,
            stream_format: "sse",
            response_format: "pcm",
          }),
        });

        if (!response.ok || !response.body) {
          const body = await response.text().catch(() => "");
          console.error(`TTS failed [${response.status}]: ${body}`);
          const message =
            response.status === 429
              ? "Trop de demandes en peu de temps. Réessayez dans un instant."
              : response.status === 402
                ? "Crédits IA épuisés."
                : "La lecture audio a échoué.";
          return new Response(message, { status: response.status });
        }

        return new Response(response.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});
