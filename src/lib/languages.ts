export type Lang = "fr" | "en" | "fon";

export const LANGS: { code: Lang; label: string; nativeLabel: string }[] = [
  { code: "fr", label: "Français", nativeLabel: "français" },
  { code: "en", label: "Anglais", nativeLabel: "anglais" },
  { code: "fon", label: "Fon", nativeLabel: "fon (fongbe)" },
];

export const LANG_LABEL: Record<Lang, string> = {
  fr: "Français",
  en: "Anglais",
  fon: "Fon",
};

export const LANG_NATIVE: Record<Lang, string> = {
  fr: "français",
  en: "anglais (English)",
  fon: "fon (fongbe)",
};

export function isLang(value: unknown): value is Lang {
  return value === "fr" || value === "en" || value === "fon";
}
