import type { Lang } from "@/lib/languages";

export type TranslationProviderId = "local" | "google" | "openai" | "gemini" | "lovable";

export type ProviderResult = {
  translation: string;
  phonetic: string;
  notes: string[];
  provider: TranslationProviderId;
};

const GOOGLE_LANG: Partial<Record<Lang, string>> = { fr: "fr", en: "en" };

export async function translateWithGoogle(
  text: string,
  source: Lang,
  target: Lang,
): Promise<ProviderResult | null> {
  const key = process.env["GOOGLE_TRANSLATE_API_KEY"];
  const from = GOOGLE_LANG[source];
  const to = GOOGLE_LANG[target];
  if (!key || !from || !to) return null;

  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: from, target: to, format: "text" }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Google Translate failed [${res.status}]: ${body}`);
    return null;
  }
  const json = (await res.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> };
  };
  const translation = json.data?.translations?.[0]?.translatedText?.trim();
  if (!translation) return null;
  return {
    translation,
    phonetic: "",
    notes: ["Traduction fournie par Google Traduction."],
    provider: "google",
  };
}

const LLM_PROMPT = (
  fonContext: string,
  text: string,
  from: string,
  to: string,
  targetIsFon: boolean,
) => `${fonContext}

Traduis le texte suivant du ${from} vers le ${to}.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown :
{"translation":"...","phonetic":"...","notes":["..."]}

- translation : la traduction en ${to}, sans guillemets ni commentaire.
- phonetic : ${targetIsFon ? "une transcription phonétique simplifiée, lisible par un francophone" : "une chaîne vide"}.
- notes : 0 à 3 notes courtes en français (registre, variante, contexte culturel).

Texte à traduire :
"""${text}"""`;

function parseLlmJson(raw: string): { translation: string; phonetic: string; notes: string[] } | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as {
      translation?: unknown;
      phonetic?: unknown;
      notes?: unknown;
    };
    if (typeof parsed.translation !== "string" || !parsed.translation.trim()) return null;
    return {
      translation: parsed.translation.trim(),
      phonetic: typeof parsed.phonetic === "string" ? parsed.phonetic.trim() : "",
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((n): n is string => typeof n === "string").slice(0, 3)
        : [],
    };
  } catch {
    return null;
  }
}

export async function translateWithOwnLlm(
  fonContext: string,
  text: string,
  from: string,
  to: string,
  targetIsFon: boolean,
): Promise<ProviderResult | null> {
  const prompt = LLM_PROMPT(fonContext, text, from, to, targetIsFon);

  const openaiKey = process.env["OPENAI_API_KEY"];
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content ?? "";
        const parsed = parseLlmJson(content);
        if (parsed) return { ...parsed, provider: "openai" };
      } else {
        console.error(`OpenAI translate failed [${res.status}]: ${await res.text().catch(() => "")}`);
      }
    } catch (error) {
      console.error("OpenAI translate error:", error);
    }
  }

  const geminiKey = process.env["GEMINI_API_KEY"];
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      if (res.ok) {
        const json = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const parsed = parseLlmJson(content);
        if (parsed) return { ...parsed, provider: "gemini" };
      } else {
        console.error(`Gemini translate failed [${res.status}]: ${await res.text().catch(() => "")}`);
      }
    } catch (error) {
      console.error("Gemini translate error:", error);
    }
  }

  return null;
}
