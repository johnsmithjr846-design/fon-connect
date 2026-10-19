import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeftRight, Copy, Check, Loader2, History, Trash2 } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import { fetchUsageStatus } from "@/lib/usage.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { MicButton } from "@/components/voice/MicButton";
import { SpeakButton } from "@/components/voice/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { translateText } from "@/lib/translate.functions";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/languages";
import { translateFromLocalCorpus } from "@/lib/local-corpus";

export const Route = createFileRoute("/traducteur")({
  component: TraducteurPage,
  head: () => ({
    meta: [
      { title: "Traducteur français, anglais et fon — FonConnect" },
      {
        name: "description",
        content:
          "Traduisez entre le fon, le français et l'anglais : prononciation simplifiée, notes d'usage béninoises et corpus local instantané.",
      },
      { property: "og:title", content: "Traducteur français, anglais et fon — FonConnect" },
      {
        property: "og:description",
        content: "Traduction IA fon ↔ français ↔ anglais avec prononciation et notes culturelles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/traducteur" }],
  }),
});

const MAX = 1500;
const GUEST_KEY = "fonconnect_guest_translation";

const PROVIDER_LABEL: Record<string, string> = {
  local: "Corpus FonConnect (hors ligne)",
  google: "Google Traduction",
  openai: "IA OpenAI",
  gemini: "IA Gemini",
  lovable: "IA FonConnect",
};

function LangSelect({
  value,
  exclude,
  onChange,
  label,
}: {
  value: Lang;
  exclude: Lang;
  onChange: (lang: Lang) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as Lang)}
      className="rounded-md border border-input bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
    >
      {LANGS.filter((l) => l.code !== exclude).map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

function TraducteurPage() {
  const [source, setSource] = useState<Lang>("fr");
  const [target, setTarget] = useState<Lang>("fon");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [needLogin, setNeedLogin] = useState(false);
  const usageFn = useServerFn(fetchUsageStatus);
  const usage = useQuery({
    queryKey: ["usage", user?.id],
    queryFn: () => usageFn(),
    enabled: Boolean(user),
  });
  const history = useQuery({
    queryKey: ["translation-history", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("translation_history")
        .select("id, source_lang, target_lang, source_text, translation, phonetic, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const translate = useServerFn(translateText);
  const mutation = useMutation({
    mutationFn: (input: { text: string; source: Lang; target: Lang }) => {
      const local = translateFromLocalCorpus(input.text, input.source, input.target);
      return local ? Promise.resolve(local) : translate({ data: input });
    },
    onSuccess: async (data, input) => {
      if (!user) {
        window.localStorage.setItem(GUEST_KEY, "1");
        return;
      }
      await supabase.from("translation_history").insert({
        user_id: user.id,
        source_lang: input.source,
        target_lang: input.target,
        source_text: input.text,
        translation: data.translation,
        phonetic: data.phonetic ?? "",
      });
      void queryClient.invalidateQueries({ queryKey: ["translation-history", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["usage", user.id] });
    },
  });

  const guestBlocked = () => {
    if (user) return false;
    if (window.localStorage.getItem(GUEST_KEY) === "1") {
      setNeedLogin(true);
      return true;
    }
    return false;
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("translation_history").delete().eq("user_id", user.id);
    void queryClient.invalidateQueries({ queryKey: ["translation-history", user.id] });
  };

  const recorder = useVoiceRecorder({
    language: source === "fon" ? undefined : source,
    purpose: "translation",
  });
  const speech = useSpeech();

  const targetIsFon = target === "fon";

  const onMicStop = async () => {
    const transcript = await recorder.stopAndTranscribe();
    if (!transcript) return;
    const value = transcript.slice(0, MAX);
    setText(value);
    if (guestBlocked()) return;
    mutation.mutate({ text: value, source, target });
  };

  const onSpeakResult = () => {
    const data = mutation.data;
    if (!data) return;
    const spoken = targetIsFon ? data.phonetic || data.translation : data.translation;
    void speech.speak("result", spoken, targetIsFon ? "fon" : target === "en" ? "en" : "fr");
  };

  const onCopy = async () => {
    if (!mutation.data?.translation) return;
    await navigator.clipboard.writeText(mutation.data.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const swap = () => {
    setSource(target);
    setTarget(source);
    mutation.reset();
  };

  const placeholder =
    source === "fr"
      ? "Bonjour, comment allez-vous ?"
      : source === "en"
        ? "Hello, how are you?"
        : "A fɔ́n gánjí à ?";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Traducteur fon · français · anglais
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Le fon n'est pas pris en charge par les traducteurs génériques : FonConnect utilise son
          corpus local prioritaire, puis son IA linguistique pour les phrases inconnues.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <LangSelect
            value={source}
            exclude={target}
            onChange={(l) => {
              setSource(l);
              mutation.reset();
            }}
            label="Langue source"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Inverser le sens de traduction"
            onClick={swap}
          >
            <ArrowLeftRight className="size-4" />
          </Button>
          <LangSelect
            value={target}
            exclude={source}
            onChange={(l) => {
              setTarget(l);
              mutation.reset();
            }}
            label="Langue cible"
          />
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = text.trim();
            if (!value || guestBlocked()) return;
            mutation.mutate({ text: value.slice(0, MAX), source, target });
          }}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={5}
            placeholder={placeholder}
            className="resize-y text-base"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MicButton
                status={recorder.status}
                onStart={() => void recorder.start()}
                onStop={() => void onMicStop()}
                disabled={mutation.isPending}
              />
              <span className="text-xs text-muted-foreground">
                {recorder.status === "recording"
                  ? "Enregistrement…"
                  : recorder.status === "transcribing"
                    ? "Transcription…"
                    : `${text.length}/${MAX}`}
              </span>
            </div>
            <Button type="submit" disabled={!text.trim() || mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Traduire
            </Button>
          </div>
        </form>

        {user && usage.data && (
          <p className="mt-3 text-xs text-muted-foreground">
            Traduction écrite illimitée · Traduction vocale :{" "}
            {usage.data.voiceUnlimited
              ? "illimitée"
              : `${Math.max(0, Math.ceil((usage.data.voiceLimit - usage.data.voiceUsed) / 60))} min restantes aujourd'hui`}
            {!usage.data.voiceUnlimited && (
              <>
                {" · "}
                <Link to="/tarifs" className="font-medium text-primary underline">
                  Passer à l'illimité
                </Link>
              </>
            )}
          </p>
        )}

        {needLogin && !user && (
          <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
            Vous avez utilisé votre traduction d'essai.{" "}
            <Link to="/auth" className="font-semibold text-primary underline">
              Connectez-vous pour poursuivre
            </Link>{" "}
            gratuitement.
          </div>
        )}

        {(recorder.error || speech.error) && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {recorder.error ?? speech.error}
          </p>
        )}

        {mutation.isError && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "La traduction a échoué. Réessayez."}
          </p>
        )}

        {mutation.data && (
          <section className="mt-6 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {LANG_LABEL[target]}
              </h2>
              <div className="flex items-center gap-1">
                <SpeakButton
                  speaking={speech.speakingId === "result"}
                  onSpeak={onSpeakResult}
                  onStop={speech.stop}
                />
                <Button type="button" variant="ghost" size="sm" onClick={onCopy}>
                  {copied ? (
                    <Check className="mr-1.5 size-4" />
                  ) : (
                    <Copy className="mr-1.5 size-4" />
                  )}
                  {copied ? "Copié" : "Copier"}
                </Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-card-foreground">
              {mutation.data.translation}
            </p>
            {mutation.data.phonetic && (
              <p className="mt-3 text-sm italic text-muted-foreground">
                Prononciation : {mutation.data.phonetic}
              </p>
            )}
            {targetIsFon && (
              <p className="mt-3 text-xs text-muted-foreground">
                Lecture audio approximative : aucune voix de synthèse n'existe encore pour le fon.
                Des enregistrements de locuteurs natifs arriveront prochainement.
              </p>
            )}

            {mutation.data.provider && PROVIDER_LABEL[mutation.data.provider] && (
              <p className="mt-3 text-xs text-muted-foreground">
                Source : {PROVIDER_LABEL[mutation.data.provider]}
              </p>
            )}

            {mutation.data.notes.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                {mutation.data.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {user && (history.data?.length ?? 0) > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <History className="size-5" /> Historique de traduction
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => void clearHistory()}>
                <Trash2 className="mr-1.5 size-4" /> Tout effacer
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {history.data!.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSource(h.source_lang as Lang);
                      setTarget(h.target_lang as Lang);
                      setText(h.source_text);
                      mutation.reset();
                    }}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary"
                  >
                    <p className="text-xs text-muted-foreground">
                      {LANG_LABEL[h.source_lang as Lang]} → {LANG_LABEL[h.target_lang as Lang]} ·{" "}
                      {new Date(h.created_at).toLocaleString("fr-FR")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{h.source_text}</p>
                    <p className="text-sm font-medium text-card-foreground">{h.translation}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
