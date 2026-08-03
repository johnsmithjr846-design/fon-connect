import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeftRight, Copy, Check, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { translateText, type TranslationDirection } from "@/lib/translate.functions";

export const Route = createFileRoute("/traducteur")({
  component: TraducteurPage,
  head: () => ({
    meta: [
      { title: "Traducteur français ↔ fon — FonConnect" },
      {
        name: "description",
        content:
          "Traduisez instantanément du français vers le fon et du fon vers le français, avec prononciation simplifiée et notes d'usage béninoises.",
      },
      { property: "og:title", content: "Traducteur français ↔ fon — FonConnect" },
      {
        property: "og:description",
        content: "Traduction IA français ↔ fon avec prononciation et notes culturelles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/traducteur" }],
  }),
});

const MAX = 1500;

function TraducteurPage() {
  const [direction, setDirection] = useState<TranslationDirection>("fr-fon");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const translate = useServerFn(translateText);
  const mutation = useMutation({
    mutationFn: (input: { text: string; direction: TranslationDirection }) =>
      translate({ data: input }),
  });

  const sourceLabel = direction === "fr-fon" ? "Français" : "Fon";
  const targetLabel = direction === "fr-fon" ? "Fon" : "Français";

  const onCopy = async () => {
    if (!mutation.data?.translation) return;
    await navigator.clipboard.writeText(mutation.data.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Traducteur français ↔ fon
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Le fon n'est pas pris en charge par les traducteurs génériques : FonConnect utilise sa
          propre IA linguistique, entraînée sur les usages du quotidien au Bénin.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 text-sm font-medium">
          <span className="rounded-md bg-secondary px-3 py-1.5 text-secondary-foreground">
            {sourceLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Inverser le sens de traduction"
            onClick={() => {
              setDirection((d) => (d === "fr-fon" ? "fon-fr" : "fr-fon"));
              mutation.reset();
            }}
          >
            <ArrowLeftRight className="size-4" />
          </Button>
          <span className="rounded-md bg-secondary px-3 py-1.5 text-secondary-foreground">
            {targetLabel}
          </span>
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = text.trim();
            if (!value) return;
            mutation.mutate({ text: value.slice(0, MAX), direction });
          }}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={5}
            placeholder={
              direction === "fr-fon"
                ? "Bonjour, comment allez-vous ?"
                : "Kudó, a fɔ́n gánjí à ?"
            }
            className="resize-y text-base"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {text.length}/{MAX}
            </span>
            <Button type="submit" disabled={!text.trim() || mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Traduire
            </Button>
          </div>
        </form>

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
                {targetLabel}
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={onCopy}>
                {copied ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
                {copied ? "Copié" : "Copier"}
              </Button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-card-foreground">
              {mutation.data.translation}
            </p>
            {mutation.data.phonetic && (
              <p className="mt-3 text-sm italic text-muted-foreground">
                Prononciation : {mutation.data.phonetic}
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
      </main>
    </div>
  );
}
