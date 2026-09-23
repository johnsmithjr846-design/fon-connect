import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { LANG_NATIVE, type Lang } from "@/lib/languages";
import { PHRASEBOOK } from "@/lib/phrasebook-data";

const normalize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function lookupPhrasebook(text: string, source: Lang, target: Lang): TranslationResult | null {
  if (source !== "fon" && target !== "fon") return null;
  const needle = normalize(text);
  for (const category of PHRASEBOOK) {
    for (const entry of category.entries) {
      const sourceText = source === "fon" ? entry.fon : source === "fr" ? entry.fr : entry.en;
      if (normalize(sourceText) === needle) {
        return {
          translation: target === "fon" ? entry.fon : target === "fr" ? entry.fr : entry.en,
          phonetic: target === "fon" ? (entry.phonetic ?? "") : "",
          notes: [],
          provider: "local",
        };
      }
    }
  }
  return null;
}

export type { Lang };

export type TranslationProviderId = "local" | "google" | "openai" | "gemini" | "lovable";

export type TranslationResult = {
  translation: string;
  phonetic: string;
  notes: string[];
  provider?: TranslationProviderId;
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
    // 1. Corpus local (gratuit, instantané)
    const cached = lookupPhrasebook(data.text, data.source, data.target);
    if (cached) return cached;

    const from = LANG_NATIVE[data.source];
    const to = LANG_NATIVE[data.target];
    const targetIsFon = data.target === "fon";

    const { translateWithGoogle, translateWithOwnLlm } = await import(
      "./translation/providers.server"
    );

    // 2. Google Traduction (français ↔ anglais uniquement, clé propre)
    try {
      const google = await translateWithGoogle(data.text, data.source, data.target);
      if (google) return google;
    } catch (error) {
      console.error("Google provider error:", error);
    }

    // 3. Clé IA propre (OpenAI ou Gemini), notamment pour le fon
    const { FON_SYSTEM_CONTEXT } = await import("./ai-gateway.server");
    try {
      const own = await translateWithOwnLlm(FON_SYSTEM_CONTEXT, data.text, from, to, targetIsFon);
      if (own) return own;
    } catch (error) {
      console.error("Own LLM provider error:", error);
    }

    // 4. Secours final : Lovable AI Gateway (consomme des crédits)
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Le service de traduction n'est pas configuré.");

    const { createLovableAiGatewayProvider, DEFAULT_LLM_MODEL } = await import(
      "./ai-gateway.server"
    );
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway(DEFAULT_LLM_MODEL);

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
        provider: "lovable",
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        const raw = (error.text ?? "").trim();
        if (raw) return { translation: raw, phonetic: "", notes: [], provider: "lovable" };
      }
      const status =
        typeof (error as { statusCode?: number })?.statusCode === "number"
          ? (error as { statusCode?: number }).statusCode
          : undefined;
      const message = error instanceof Error ? error.message : String(error);
      const haystack = `${status ?? ""} ${message}`;
      if (haystack.includes("429") || /rate limit/i.test(haystack)) {
        throw new Error("Trop de demandes en peu de temps. Réessayez dans un instant.");
      }
      if (haystack.includes("402") || /credit/i.test(haystack) || /payment_required/i.test(haystack)) {
        throw new Error(
          "Traduction IA momentanément indisponible. Les phrases du guide de conversation restent traduites instantanément.",
        );
      }
      throw new Error(`La traduction a échoué : ${message}`);
    }
  });
