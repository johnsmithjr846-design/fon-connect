import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { isUiLang, translate, type TranslationKey, type UiLang } from "./dictionary";

const STORAGE_KEY = "fonconnect:lang";

type I18nValue = {
  lang: UiLang;
  setLang: (lang: UiLang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>("fr");
  const { user } = useAuthUser();
  const queryClient = useQueryClient();

  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(),
    enabled: Boolean(user),
  });

  const savePreference = useMutation({
    mutationFn: (next: UiLang) => saveProfile({ data: { preferredLanguage: next } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });

  // Local preference (works signed out too).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isUiLang(stored)) setLangState(stored);
  }, []);

  // Account preference wins once the profile is loaded.
  useEffect(() => {
    const preferred = profileQuery.data?.preferredLanguage;
    if (preferred && isUiLang(preferred)) {
      setLangState(preferred);
      window.localStorage.setItem(STORAGE_KEY, preferred);
    }
  }, [profileQuery.data?.preferredLanguage]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (next: UiLang) => {
      setLangState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
      if (user) savePreference.mutate(next);
    },
    [user, savePreference],
  );

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { lang: "fr", setLang: () => {}, t: (key, vars) => translate("fr", key, vars) };
  }
  return ctx;
}
