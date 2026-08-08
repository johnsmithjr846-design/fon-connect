import { Link } from "@tanstack/react-router";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export function SignInBanner({ messageKey }: { messageKey?: TranslationKey }) {
  const { user, authLoading } = useLessonProgress();
  const { t } = useI18n();
  if (authLoading || user) return null;
  return (
    <p className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      {t(messageKey ?? "lessons.signInDefault")}{" "}
      <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
        {t("nav.signIn")}
      </Link>
    </p>
  );
}
