import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { UI_LANGS, type UiLang } from "@/lib/i18n/dictionary";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { fileToAvatarDataUrl } from "@/lib/avatar";
import { MemberAvatar } from "@/components/social/MemberAvatar";
import { BadgeGrid } from "@/components/lessons/BadgeGrid";
import { StatsBar } from "@/components/lessons/StatsBar";
import { useLessonProgress } from "@/hooks/useLessonProgress";

export const Route = createFileRoute("/profil")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Mon profil — pseudo et langue — FonConnect" },
      {
        name: "description",
        content:
          "Gérez votre compte FonConnect : modifiez votre pseudo et choisissez la langue de l'application (français ou anglais).",
      },
      { property: "og:title", content: "Mon profil — FonConnect" },
      {
        property: "og:description",
        content: "Modifiez votre pseudo et la langue de l'application FonConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/profil" }],
  }),
});

function ProfilePage() {
  const { t, setLang } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuthUser();

  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);

  const [pseudo, setPseudo] = useState("");
  const [language, setLanguage] = useState<UiLang>("fr");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    const data = profileQuery.data;
    if (!data) return;
    setPseudo(data.pseudo ?? "");
    setLanguage(data.preferredLanguage);
    setAvatarUrl(data.avatarUrl ?? "");
  }, [profileQuery.data]);

  async function onPickAvatar(file: File | undefined) {
    if (!file) return;
    setAvatarError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch {
      setAvatarError(t("profile.avatarFailed"));
    }
  }

  const mutation = useMutation({
    mutationFn: () => saveProfile({ data: { pseudo, preferredLanguage: language, avatarUrl } }),
    onSuccess: async () => {
      setSaved(true);
      setLang(language);
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("profile.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("profile.intro")}</p>

        {loading || profileQuery.isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">{t("profile.loading")}</p>
        ) : (
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            {user?.email && (
              <p className="text-xs text-muted-foreground">
                {t("profile.signedInAs", { email: user.email })}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pseudo">{t("profile.pseudo")}</Label>
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                autoComplete="nickname"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="language">{t("profile.language")}</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as UiLang)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {UI_LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {mutation.isError && <p className="text-sm text-destructive">{t("profile.failed")}</p>}
            {saved && <p className="text-sm text-primary">{t("profile.saved")}</p>}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? t("profile.saving") : t("profile.save")}
            </Button>
          </form>
        )}

        <ProgressSection />

        <div className="mt-8 flex flex-col gap-2 text-sm">
          <button
            type="button"
            className="text-left text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            onClick={() => {
              void (async () => {
                queryClient.clear();
                await supabase.auth.signOut();
                void navigate({ to: "/", replace: true });
              })();
            }}
          >
            {t("profile.signOut")}
          </button>
          <Link
            to="/"
            className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {t("common.back")}
          </Link>
        </div>
      </main>
    </div>
  );
}

function ProgressSection() {
  const { t } = useI18n();
  const { user, badges } = useLessonProgress();
  if (!user) return null;
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-foreground">{t("lessons.myProgress")}</h2>
      <StatsBar />
      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {t("lessons.badges")}
      </h3>
      <div className="mt-3">
        <BadgeGrid owned={badges} />
      </div>
    </section>
  );
}
