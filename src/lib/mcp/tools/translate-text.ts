import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { LANG_NATIVE } from "@/lib/languages";
import {
  createLovableAiGatewayProvider,
  DEFAULT_LLM_MODEL,
  FON_SYSTEM_CONTEXT,
} from "@/lib/ai-gateway.server";

const OutputSchema = z.object({
  translation: z.string(),
  phonetic: z.string(),
  notes: z.array(z.string()),
});

export default defineTool({
  name: "translate_text",
  title: "Traduire un texte (fon / français / anglais)",
  description:
    "Traduit un texte entre le fon (fongbe, Bénin), le français et l'anglais, avec transcription phonétique et notes culturelles.",
  inputSchema: {
    text: z.string().trim().min(1).max(1500).describe("Texte à traduire."),
    source: z.enum(["fr", "en", "fon"]).describe("Langue source."),
    target: z.enum(["fr", "en", "fon"]).describe("Langue cible."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ text, source, target }) => {
    if (source === target) throw new ToolError("La langue source et la langue cible sont identiques.");
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new ToolError("Le service de traduction n'est pas configuré.");

    const gateway = createLovableAiGatewayProvider(key);
    const targetIsFon = target === "fon";
    const prompt = `${FON_SYSTEM_CONTEXT}

Traduis le texte suivant du ${LANG_NATIVE[source]} vers le ${LANG_NATIVE[target]}.

Réponds avec :
- translation : la traduction en ${LANG_NATIVE[target]}, sans guillemets ni commentaire.
- phonetic : ${targetIsFon ? "une transcription phonétique simplifiée du fon" : "une chaîne vide"}.
- notes : 0 à 3 notes courtes en français (registre, variante, contexte culturel).

Texte à traduire :
"""${text}"""`;

    try {
      const { output } = await generateText({
        model: gateway(DEFAULT_LLM_MODEL),
        output: Output.object({ schema: OutputSchema }),
        prompt,
      });
      const result = {
        translation: output.translation.trim(),
        phonetic: output.phonetic.trim(),
        notes: output.notes.filter(Boolean).slice(0, 3),
      };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && (error.text ?? "").trim()) {
        const translation = (error.text ?? "").trim();
        return {
          content: [{ type: "text" as const, text: translation }],
          structuredContent: { translation, phonetic: "", notes: [] },
        };
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new ToolError(
        message.includes("429") ? "Trop de demandes en peu de temps. Réessayez." : "La traduction a échoué.",
      );
    }
  },
});
