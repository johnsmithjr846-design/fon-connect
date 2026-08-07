import { Link } from "@tanstack/react-router";
import { useLessonProgress } from "@/hooks/useLessonProgress";

export function SignInBanner({ message }: { message?: string }) {
  const { user, authLoading } = useLessonProgress();
  if (authLoading || user) return null;
  return (
    <p className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      {message ?? "Connectez-vous pour sauvegarder votre progression."}{" "}
      <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
        Se connecter
      </Link>
    </p>
  );
}
