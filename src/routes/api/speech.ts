import { createFileRoute } from "@tanstack/react-router";

type SpeechBody = { text?: unknown; lang?: unknown };

const FON_INSTRUCTIONS =
  "Lis ce texte lentement et distinctement, comme une transcription phonétique destinée à un francophone. Articule chaque syllabe, sans accent anglais.";
const FR_INSTRUCTIONS = "Lis ce texte en français, d'une voix chaleureuse, claire et posée.";

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Service vocal non configuré.", { status: 500 });

        const { text, lang } = (await request.json()) as SpeechBody;
        if (typeof text !== "string" || !text.trim()) {
          return new Response("Texte requis.", { status: 400 });
        }
        const input = text.trim().slice(0, 2000);
        const isFon = lang === "fon";

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
            instructions: isFon ? FON_INSTRUCTIONS : FR_INSTRUCTIONS,
            speed: isFon ? 0.9 : 1,
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
