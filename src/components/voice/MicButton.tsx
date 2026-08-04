import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecorderStatus } from "@/hooks/useVoiceRecorder";

type MicButtonProps = {
  status: RecorderStatus;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export function MicButton({ status, onStart, onStop, disabled }: MicButtonProps) {
  const recording = status === "recording";
  const transcribing = status === "transcribing";

  return (
    <Button
      type="button"
      variant={recording ? "destructive" : "outline"}
      size="icon"
      disabled={disabled || transcribing}
      aria-label={recording ? "Arrêter l'enregistrement" : "Dicter au micro"}
      onClick={recording ? onStop : onStart}
      className={recording ? "animate-pulse" : undefined}
    >
      {transcribing ? (
        <Loader2 className="size-4 animate-spin" />
      ) : recording ? (
        <Square className="size-4" />
      ) : (
        <Mic className="size-4" />
      )}
    </Button>
  );
}
