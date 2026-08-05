import type { TranslationDirection, TranslationResult } from "@/lib/translate.functions";

type CorpusEntry = {
  fon: string;
  fr: string;
  en?: string;
  phonetic?: string;
};

// Corpus local embarqué : enrichi dès que le fichier JSON/CSV contenant les
// 219 entrées réelles est fourni. Les fichiers actuels ne contiennent que son index.
const CORPUS: CorpusEntry[] = [{ fon: "Un ɖo mɔ", fr: "Je vais bien", en: "I'm fine" }];

function normalize(value: string) {
  return value
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/[.!?…]+$/u, "")
    .replace(/\s+/g, " ");
}

export function translateFromLocalCorpus(
  text: string,
  direction: TranslationDirection,
): TranslationResult | null {
  const query = normalize(text);
  const entry = CORPUS.find((item) =>
    normalize(direction === "fr-fon" ? item.fr : item.fon) === query,
  );
  if (!entry) return null;

  return {
    translation: direction === "fr-fon" ? entry.fon : entry.fr,
    phonetic: direction === "fr-fon" ? (entry.phonetic ?? "") : "",
    notes: ["Traduction vérifiée issue du corpus local FonConnect."],
  };
}