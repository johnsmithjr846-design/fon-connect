import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpeakButton } from "@/components/voice/SpeakButton";
import { MicButton } from "@/components/voice/MicButton";
import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { checkAnswer, similarity } from "@/lib/lessons/exercises";
import type { Exercise } from "@/lib/lessons/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ExercisePlayerProps = {
  exercise: Exercise;
  onResult: (correct: boolean) => void;
};

export function ExercisePlayer({ exercise, onResult }: ExercisePlayerProps) {
  const { t, lang } = useI18n();
  const speech = useSpeech();
  const recorder = useVoiceRecorder({ language: "fon" });
  const [value, setValue] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<null | { correct: boolean; expected: string }>(null);

  const prompt = useMemo(() => {
    if (exercise.kind === "discover") return t("lessons.ex.discover");
    if (exercise.kind === "listen") return t("lessons.ex.listen");
    if (exercise.kind === "order") return t("lessons.ex.order");
    if (exercise.kind === "blank") return t("lessons.ex.blank");
    if (exercise.kind === "mcq") return t("lessons.ex.mcq");
    return t("lessons.ex.translate");
  }, [exercise, t]);

  const target = exercise.kind === "discover" ? "" : exercise.item.fon;
  const meaning =
    exercise.kind === "discover"
      ? ""
      : lang === "en"
        ? exercise.item.en
        : exercise.item.fr;

  function submit(answer: string) {
    const correct = checkAnswer(exercise, answer);
    setVerdict({ correct, expected: target });
  }

  function advance() {
    const correct = verdict?.correct ?? true;
    setValue("");
    setTokens([]);
    setVerdict(null);
    onResult(correct);
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{prompt}</p>

      {exercise.kind === "discover" && (
        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {exercise.items.map((item) => {
            const id = `discover-${item.fon}`;
            return (
              <li key={id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-card-foreground">{item.fon}</p>
                  {item.phonetic && (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">[{item.phonetic}]</p>
                  )}
                  <p className="mt-1 text-sm text-foreground">
                    {lang === "en" ? item.en : item.fr}
                  </p>
                </div>
                <SpeakButton
                  speaking={speech.speakingId === id}
                  onSpeak={() => void speech.speak(id, item.phonetic || item.fon, "fon")}
                  onStop={speech.stop}
                />
              </li>
            );
          })}
        </ul>
      )}

      {exercise.kind === "mcq" && (
        <div className="mt-5">
          <p className="text-lg font-semibold text-foreground">{meaning}</p>
          <div className="mt-4 grid gap-3">
            {exercise.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={Boolean(verdict)}
                onClick={() => submit(option)}
                className="rounded-xl border border-border bg-card px-4 py-3 text-left text-base text-card-foreground transition-colors hover:border-primary/60 hover:bg-accent disabled:opacity-70"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {exercise.kind === "order" && (
        <div className="mt-5">
          <p className="text-lg font-semibold text-foreground">{meaning}</p>
          <div className="mt-4 min-h-14 rounded-xl border border-dashed border-border bg-card/60 p-3">
            <div className="flex flex-wrap gap-2">
              {tokens.map((token, i) => (
                <button
                  key={`${token}-${i}`}
                  type="button"
                  onClick={() => setTokens(tokens.filter((_, j) => j !== i))}
                  className="rounded-lg border border-primary/40 bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {exercise.tokens.map((token, i) => {
              const used = tokens.filter((x) => x === token).length;
              const available = exercise.tokens.filter((x) => x === token).length;
              const disabled = used >= available;
              return (
                <button
                  key={`${token}-src-${i}`}
                  type="button"
                  disabled={disabled || Boolean(verdict)}
                  onClick={() => setTokens([...tokens, token])}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground transition-colors hover:border-primary/60 disabled:opacity-30"
                >
                  {token}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {exercise.kind === "blank" && (
        <div className="mt-5">
          <p className="text-lg font-semibold text-foreground">{meaning}</p>
          <p className="mt-3 font-mono text-2xl tracking-[0.2em] text-primary">{exercise.masked}</p>
          <Input
            className="mt-4"
            value={value}
            disabled={Boolean(verdict)}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("lessons.ex.placeholder")}
          />
        </div>
      )}

      {exercise.kind === "translate" && (
        <div className="mt-5">
          <p className="text-lg font-semibold text-foreground">{meaning}</p>
          <Input
            className="mt-4"
            value={value}
            disabled={Boolean(verdict)}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("lessons.ex.placeholder")}
          />
        </div>
      )}

      {exercise.kind === "listen" && (
        <div className="mt-5">
          <p className="text-2xl font-bold text-foreground">{exercise.item.fon}</p>
          {exercise.item.phonetic && (
            <p className="mt-1 text-sm italic text-muted-foreground">[{exercise.item.phonetic}]</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{meaning}</p>
          <div className="mt-4 flex items-center gap-3">
            <SpeakButton
              speaking={speech.speakingId === exercise.id}
              onSpeak={() =>
                void speech.speak(
                  exercise.id,
                  exercise.item.phonetic || exercise.item.fon,
                  "fon",
                )
              }
              onStop={speech.stop}
            />
            <MicButton
              status={recorder.status}
              onStart={() => void recorder.start()}
              onStop={async () => {
                const text = await recorder.stopAndTranscribe();
                if (typeof text === "string" && text.trim()) {
                  setValue(text);
                  submit(text);
                }
              }}
            />
            <span className="text-sm text-muted-foreground">{t("lessons.ex.speakPrompt")}</span>
          </div>
          {recorder.error && (
            <p className="mt-3 text-sm text-destructive">{recorder.error}</p>
          )}
          {value && (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("lessons.ex.heard", {
                text: value,
                score: Math.round(similarity(value, exercise.item.fon) * 100),
              })}
            </p>
          )}
          <Button type="button" variant="ghost" className="mt-3" onClick={() => submit("")}>
            {t("lessons.ex.skip")}
          </Button>
        </div>
      )}

      <div className="mt-auto pt-8">
        {verdict ? (
          <div
            className={`rounded-xl p-4 ${
              verdict.correct
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <p className="text-sm font-semibold">
              {verdict.correct ? t("lessons.ex.correct") : t("lessons.ex.wrong")}
            </p>
            {!verdict.correct && verdict.expected && (
              <p className="mt-1 text-sm">{t("lessons.ex.answer", { answer: verdict.expected })}</p>
            )}
            <Button type="button" className="mt-3" onClick={advance}>
              {t("lessons.ex.continue")}
            </Button>
          </div>
        ) : exercise.kind === "discover" ? (
          <Button type="button" className="w-full" onClick={() => onResult(true)}>
            {t("lessons.ex.continue")}
          </Button>
        ) : exercise.kind === "mcq" || exercise.kind === "listen" ? null : (
          <Button
            type="button"
            className="w-full"
            disabled={exercise.kind === "order" ? tokens.length === 0 : value.trim().length === 0}
            onClick={() => submit(exercise.kind === "order" ? tokens.join(" ") : value)}
          >
            {t("lessons.ex.check")}
          </Button>
        )}
      </div>
    </div>
  );
}
