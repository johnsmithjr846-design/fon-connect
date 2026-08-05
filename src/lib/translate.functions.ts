import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { LANG_NATIVE, type Lang } from "@/lib/languages";

export type { Lang };

export type TranslationResult = {
  translation: string;
  phonetic: string;
  notes: string[];
};

const InputSchema = z.object({
  text: z.string().min(1).max(1500),
  source: z.enum(["fr", "en", "fon"]),
  target: z.enum(["fr", "en", "fon"]),
});

const OutputSchema = z.object({
  translation: z.string(),
  phonetic: z.string(),
  notes: z.array(z.string()),
});

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<TranslationResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Le service de traduction n'est pas configuré.");

    const { createLovableAiGatewayProvider, FON_SYSTEM_CONTEXT } = await import(
      "./ai-gateway.server"
    );
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3.6-flash");

    const from = LANG_NATIVE[data.source];
    const to = LANG_NATIVE[data.target];
    const targetIsFon = data.target === "fon";

    const prompt = `${FON_SYSTEM_CONTEXT}

Tu traduis aussi entre le français et l'anglais, et entre l'anglais et le fon, avec la même exigence de naturel.

Traduis le texte suivant du ${from} vers le ${to}.

Réponds avec :
- translation : la traduction en ${to}, sans guillemets ni commentaire.
- phonetic : ${
      targetIsFon
        ? "une transcription phonétique simplifiée du fon, lisible par un francophone"
        : "une chaîne vide"
    }.
- notes : entre 0 et 3 notes courtes (une phrase chacune, en français) sur le registre, une variante fréquente ou le contexte culturel.

Texte à traduire :
"""${data.text}"""`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: OutputSchema }),
        prompt,
      });

      return {
        translation: output.translation.trim(),
        phonetic: output.phonetic.trim(),
        notes: output.notes.filter(Boolean).slice(0, 3),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        const raw = (error.text ?? "").trim();
        if (raw) return { translation: raw, phonetic: "", notes: [] };
      }
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("429")) {
        throw new Error("Trop de demandes en peu de temps. Réessayez dans un instant.");
      }
      if (message.includes("402")) {
        throw new Error("Crédits IA épuisés. Rechargez votre espace Lovable pour continuer.");
      }
      throw new Error("La traduction a échoué. Réessayez.");
    }
  });
