import type { Lang } from "@/lib/languages";
import type { TranslationResult } from "@/lib/translate.functions";
import { PHRASEBOOK_ENTRIES, type PhraseEntry } from "@/lib/phrasebook-data";

function normalize(value: string) {
  return value
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/[.!?…]+$/u, "")
    .replace(/\s+/g, " ");
}

function valueFor(entry: PhraseEntry, lang: Lang) {
  return lang === "fon" ? entry.fon : lang === "en" ? entry.en : entry.fr;
}

export function translateFromLocalCorpus(
  text: string,
  source: Lang,
  target: Lang,
): TranslationResult | null {
  if (source === target) return null;
  const query = normalize(text);
  const entry = PHRASEBOOK_ENTRIES.find((item) => normalize(valueFor(item, source)) === query);
  if (!entry) return null;

  return {
    translation: valueFor(entry, target),
    phonetic: target === "fon" ? (entry.phonetic ?? "") : "",
    notes: ["Traduction vérifiée issue du corpus local FonConnect (hors ligne, instantanée)."],
  };
}
