import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { msUntilReset } from "@/lib/lessons/stats";

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HeartsEmptyState({ backTo }: { backTo?: React.ReactNode }) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(() => msUntilReset());

  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilReset()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-center">
      <Heart className="mx-auto size-8 text-destructive" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-destructive">{t("lessons.outOfHearts")}</p>
      <p className="mt-2 font-mono text-lg font-bold text-foreground" aria-live="polite">
        {format(remaining)}
      </p>
      <p className="text-xs text-muted-foreground">{t("lessons.heartsResetIn")}</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button asChild>
          <Link to="/tarifs">{t("lessons.upgradeHearts")}</Link>
        </Button>
        {backTo}
      </div>
    </div>
  );
}
