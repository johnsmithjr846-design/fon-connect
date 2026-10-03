import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Ad } from "@/hooks/useSiteData";

/** Annonce plein écran au milieu d'une leçon ; « Continuer » s'active après 5 secondes. */
export function LessonAdDialog({
  ad,
  reward,
  onClose,
}: {
  ad: Ad;
  reward: boolean;
  onClose: () => void;
}) {
  const [left, setLeft] = useState(5);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const media = ad.image_url ? (
    ad.media_type === "video" ? (
      <video
        src={ad.image_url}
        autoPlay
        playsInline
        controls
        className="max-h-[50vh] w-full rounded-lg bg-muted object-contain"
      />
    ) : (
      <img
        src={ad.image_url}
        alt={ad.title}
        className="max-h-[50vh] w-full rounded-lg object-contain"
      />
    )
  ) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Annonce
        </p>
        <div className="mt-2">
          {ad.link_url ? (
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored">
              {media}
            </a>
          ) : (
            media
          )}
        </div>
        <p className="mt-3 font-semibold">{ad.title}</p>
        {ad.body && <p className="mt-1 text-sm text-muted-foreground">{ad.body}</p>}
        {reward && (
          <p className="mt-2 text-sm font-medium text-primary">
            Regardez jusqu'au bout pour récupérer 1 cœur.
          </p>
        )}
        <Button className="mt-4 w-full" disabled={left > 0} onClick={onClose}>
          {left > 0 ? `Continuer dans ${left} s` : reward ? "Récupérer mon cœur" : "Continuer"}
        </Button>
      </div>
    </div>
  );
}
