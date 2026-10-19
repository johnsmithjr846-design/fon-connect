import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import { fetchUsageStatus } from "@/lib/usage.functions";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { History, Loader2, Plus, Send, Trash2 } from "lucide-react";
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
const GUEST_KEY = "fonconnect_guest_ai";

function messageText(message: { parts: { type: string; text?: string }[] }) {
  return message.parts.map((part) => (part.type === "text" ? (part.text ?? "") : "")).join("");
}

function AssistantPage() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, setMessages, status, error } = useChat({ transport });
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [needLogin, setNeedLogin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const convRef = useRef<string | null>(null);
  const savedRef = useRef<Set<string>>(new Set());
  const usageFn = useServerFn(fetchUsageStatus);
  const usage = useQuery({
    queryKey: ["usage", user?.id],
    queryFn: () => usageFn(),
    enabled: Boolean(user),
  });
  const conversations = useQuery({
    queryKey: ["ai-conversations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from("ai_conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (e) throw e;
      return data;
    },
  });
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

  // Sauvegarde les réponses terminées d'Ayi dans la discussion active.
  useEffect(() => {
    if (status !== "ready" || !user || !convRef.current) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || savedRef.current.has(last.id)) return;
    const content = messageText(last);
    if (!content.trim()) return;
    savedRef.current.add(last.id);
    void supabase
      .from("ai_chat_messages")
      .insert({ conversation_id: convRef.current, user_id: user.id, role: "assistant", content })
      .then(({ error: e }) => e && console.error("save assistant message failed", e));
  }, [messages, status, user]);

  const persistUserMessage = async (text: string) => {
    if (!user) return;
    let id = convRef.current;
    if (!id) {
      const { data, error: e } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, title: text.slice(0, 60) })
        .select("id")
        .single();
      if (e || !data) return console.error("create conversation failed", e);
      id = data.id;
      convRef.current = id;
      setConvId(id);
    } else {
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);
    }
    const { error: e } = await supabase
      .from("ai_chat_messages")
      .insert({ conversation_id: id, user_id: user.id, role: "user", content: text });
    if (e) console.error("save user message failed", e);
    void queryClient.invalidateQueries({ queryKey: ["ai-conversations", user.id] });
  };

  const submit = (value: string) => {
    const text = value.trim();
    if (!text || isLoading) return;
    if (!user) {
      if (window.localStorage.getItem(GUEST_KEY) === "1") {
        setNeedLogin(true);
        return;
      }
      window.localStorage.setItem(GUEST_KEY, "1");
    }
    setInput("");
    void persistUserMessage(text);
    void sendMessage({ text }).finally(() => {
      if (user) void queryClient.invalidateQueries({ queryKey: ["usage", user.id] });
    });
  };

  const newConversation = () => {
    convRef.current = null;
    setConvId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const openConversation = async (id: string) => {
    const { data, error: e } = await supabase
      .from("ai_chat_messages")
      .select("id, role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (e) return console.error(e);
    const restored: UIMessage[] = (data ?? []).map((m) => ({
      id: m.id,
      role: m.role === "user" ? "user" : "assistant",
      parts: [{ type: "text", text: m.content }],
    }));
    restored.forEach((m) => savedRef.current.add(m.id));
    convRef.current = id;
    setConvId(id);
    setMessages(restored);
    setShowHistory(false);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    if (convRef.current === id) newConversation();
    void queryClient.invalidateQueries({ queryKey: ["ai-conversations", user?.id] });
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

        {user && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={newConversation}>
              <Plus className="mr-1.5 size-4" /> Nouvelle discussion
            </Button>
            <Button
              type="button"
              variant={showHistory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistory((v) => !v)}
            >
              <History className="mr-1.5 size-4" /> Historique
            </Button>
            {usage.data && (
              <span className="text-xs text-muted-foreground">
                {usage.data.aiUnlimited ? (
                  "Questions illimitées"
                ) : (
                  <>
                    {Math.max(0, usage.data.aiLimit - usage.data.aiUsed)} / {usage.data.aiLimit}{" "}
                    questions restantes aujourd'hui ·{" "}
                    <Link to="/tarifs" className="font-medium text-primary underline">
                      Passer à l'illimité
                    </Link>
                  </>
                )}
              </span>
            )}
          </div>
        )}

        {showHistory && user && (
          <div className="mt-3 rounded-xl border border-border bg-card p-3">
            {(conversations.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune discussion enregistrée.</p>
            ) : (
              <ul className="space-y-1">
                {conversations.data!.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openConversation(c.id)}
                      className={`flex-1 truncate rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${c.id === convId ? "bg-secondary font-medium text-foreground" : "text-card-foreground"}`}
                    >
                      {c.title}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(c.updated_at).toLocaleDateString("fr-FR")}
                      </span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer la discussion"
                      onClick={() => void deleteConversation(c.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}


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
              {error.message?.includes("402") || error.message?.includes("credits")
                ? "Crédits IA épuisés. Rechargez votre espace Lovable pour continuer."
                : error.message || "La discussion a échoué. Vérifiez votre connexion et réessayez."}
            </p>
          )}
          {needLogin && !user && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
              Vous avez utilisé votre question d'essai.{" "}
              <Link to="/auth" className="font-semibold text-primary underline">
                Connectez-vous pour poursuivre
              </Link>{" "}
              et profiter de 3 questions gratuites par jour.
            </div>
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
