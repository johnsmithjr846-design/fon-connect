import { Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SpeakButtonProps = {
  speaking: boolean;
  onSpeak: () => void;
  onStop: () => void;
  label?: string;
};

export function SpeakButton({ speaking, onSpeak, onStop, label = "Écouter" }: SpeakButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={speaking ? "Arrêter la lecture" : label}
      onClick={speaking ? onStop : onSpeak}
    >
      {speaking ? (
        <Square className="mr-1.5 size-4" />
      ) : (
        <Volume2 className="mr-1.5 size-4" />
      )}
      {speaking ? "Stop" : label}
    </Button>
  );
}
