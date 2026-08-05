import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "Service vocal non configuré." }, { status: 500 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Requête audio invalide." }, { status: 400 });
        }

        const file = form.get("audio");
        if (!(file instanceof File) || file.size < 2048) {
          return Response.json(
            { error: "Enregistrement trop court ou vide. Réessayez." },
            { status: 400 },
          );
        }
        if (file.size > 20 * 1024 * 1024) {
          return Response.json({ error: "Enregistrement trop long." }, { status: 413 });
        }

        const language = form.get("language");

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-transcribe");
        upstream.append("file", file, "recording.wav");
        if (typeof language === "string" && /^[a-z]{2}$/.test(language)) {
          upstream.append("language", language);
        }

        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Lovable-API-Key": key },
          body: upstream,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          console.error(`Transcription failed [${response.status}]: ${body}`);
          const message =
            response.status === 429
              ? "Trop de demandes en peu de temps. Réessayez dans un instant."
              : response.status === 402
                ? "Crédits IA épuisés."
                : "La transcription a échoué. Réessayez.";
          return Response.json({ error: message }, { status: response.status });
        }

        const data = (await response.json()) as { text?: string };
        return Response.json({ text: (data.text ?? "").trim() });
      },
    },
  },
});
