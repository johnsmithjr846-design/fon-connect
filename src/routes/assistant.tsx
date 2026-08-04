import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SiteHeader } from "@/components/SiteHeader";
import { MicButton } from "@/components/voice/MicButton";
import { SpeakButton } from "@/components/voice/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "Assistant IA fon — FonConnect" },
      {
        name: "description",
        content:
          "Discutez avec Ayi, l'assistant IA de FonConnect : posez vos questions sur le fon, pratiquez la conversation et apprenez la culture béninoise.",
      },
      { property: "og:title", content: "Assistant IA fon — FonConnect" },
      {
        property: "og:description",
        content: "Un professeur de fon disponible en continu pour pratiquer et progresser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/assistant" }],
  }),
});

const SUGGESTIONS = [
  "Comment saluer un aîné en fon ?",
  "Apprends-moi à négocier au marché de Dantokpa",
  "Que dire en cas d'urgence médicale ?",
];

const HANDS_FREE_KEY = "fonconnect:hands-free";

function messageText(message: { parts: { type: string; text?: string }[] }) {
  return message.parts.map((part) => (part.type === "text" ? (part.text ?? "") : "")).join("");
}

function AssistantPage() {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const [handsFree, setHandsFree] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const spokenRef = useRef<string | null>(null);

  const recorder = useVoiceRecorder({ language: "fr" });
  const speech = useSpeech();

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    setHandsFree(window.localStorage.getItem(HANDS_FREE_KEY) === "1");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (!handsFree || status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || spokenRef.current === last.id) return;
    const text = messageText(last);
    if (!text.trim()) return;
    spokenRef.current = last.id;
    void speech.speak(last.id, text, "fr");
  }, [handsFree, messages, speech, status]);

  const submit = (value: string) => {
    const text = value.trim();
    if (!text || isLoading) return;
    setInput("");
    void sendMessage({ text });
  };

  const onMicStop = async () => {
    const transcript = await recorder.stopAndTranscribe();
    if (transcript) setInput((current) => (current ? `${current} ${transcript}` : transcript));
  };

  const toggleHandsFree = () => {
    setHandsFree((current) => {
      const next = !current;
      window.localStorage.setItem(HANDS_FREE_KEY, next ? "1" : "0");
      if (!next) speech.stop();
      return next;
    });
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ayi, votre assistant fon
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Posez vos questions sur la langue et la culture du Bénin, pratiquez la conversation et
          faites corriger votre prononciation.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            variant={handsFree ? "default" : "outline"}
            size="sm"
            aria-pressed={handsFree}
            onClick={toggleHandsFree}
          >
            {handsFree ? "Mains libres activé" : "Mains libres"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Lecture automatique des réponses d'Ayi.
          </span>
        </div>


        <div className="mt-6 flex-1 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("");
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    isUser
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm text-card-foreground"
                  }
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{text}</p>
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1.5 [&_ul]:my-1.5">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                      {text.trim() && (
                        <div className="mt-1 flex justify-end">
                          <SpeakButton
                            speaking={speech.speakingId === message.id}
                            onSpeak={() => void speech.speak(message.id, text, "fr")}
                            onStop={speech.stop}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Ayi réfléchit…
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              La discussion a échoué. Vérifiez votre connexion et réessayez.
            </p>
          )}
          {(recorder.error || speech.error) && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {recorder.error ?? speech.error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="sticky bottom-0 mt-6 flex items-end gap-2 border-t border-border bg-background pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <MicButton
            status={recorder.status}
            onStart={() => void recorder.start()}
            onStop={() => void onMicStop()}
            disabled={isLoading}
          />
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={2}
            placeholder={
              recorder.status === "recording"
                ? "Enregistrement en cours…"
                : recorder.status === "transcribing"
                  ? "Transcription…"
                  : "Écrivez ou dictez votre message…"
            }
            className="resize-none"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="size-4" />
          </Button>
        </form>

      </main>
    </div>
  );
}
