import { Heart, Infinity as InfinityIcon } from "lucide-react";
import { MAX_HEARTS } from "@/lib/lessons";

type LessonHudProps = {
  progress: number;
  hearts: number;
  unlimited?: boolean;
  onQuit: () => void;
};

export function LessonHud({ progress, hearts, unlimited = false, onQuit }: LessonHudProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onQuit}
        aria-label="Quitter la leçon"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        ✕
      </button>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      {unlimited ? (
        <span
          className="inline-flex items-center gap-1 text-sm font-semibold text-destructive"
          aria-label="Cœurs illimités"
        >
          <Heart className="size-4 fill-destructive text-destructive" />
          <InfinityIcon className="size-4" />
        </span>
      ) : (
        <div className="flex items-center gap-1" aria-label={`${hearts} cœurs`}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              className={
                i < hearts
                  ? "size-4 fill-destructive text-destructive"
                  : "size-4 text-muted-foreground/40"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
