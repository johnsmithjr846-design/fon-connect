import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SpeakButton } from "@/components/voice/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PHRASEBOOK, type PhraseEntry } from "@/lib/phrasebook-data";

export const Route = createFileRoute("/phrasebook")({
  component: PhrasebookPage,
  head: () => ({
    meta: [
      { title: "Phrasebook fon — français et anglais — FonConnect" },
      {
        name: "description",
        content:
          "Guide de conversation fon avec traduction française et anglaise : salutations, marché, zémidjan, santé et urgences au Bénin.",
      },
      { property: "og:title", content: "Phrasebook fon — français et anglais — FonConnect" },
      {
        property: "og:description",
        content: "Les phrases essentielles en fon, traduites en français et en anglais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/phrasebook" }],
  }),
});

type Gloss = "fr" | "en" | "both";

function matches(entry: PhraseEntry, query: string) {
  const q = query.trim().toLocaleLowerCase("fr");
  if (!q) return true;
  return [entry.fon, entry.fr, entry.en, entry.phonetic ?? ""].some((v) =>
    v.toLocaleLowerCase("fr").includes(q),
  );
}

function PhrasebookPage() {
  const [query, setQuery] = useState("");
  const [gloss, setGloss] = useState<Gloss>("both");
  const [category, setCategory] = useState<string>("all");
  const speech = useSpeech();

  const categories = useMemo(
    () =>
      PHRASEBOOK.map((c) => ({
        ...c,
        entries: c.entries.filter((e) => matches(e, query)),
      })).filter((c) => (category === "all" || c.id === category) && c.entries.length > 0),
    [query, category],
  );

  const total = PHRASEBOOK.reduce((n, c) => n + c.entries.length, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Phrasebook fon · français · anglais
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} phrases essentielles du quotidien béninois, avec prononciation simplifiée et
          traduction en français et en anglais. Utilisables hors connexion par le traducteur.
        </p>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher en fon, français ou anglais…"
              className="pl-9"
              aria-label="Rechercher une phrase"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "both", label: "FR + EN" },
                { id: "fr", label: "Français" },
                { id: "en", label: "English" },
              ] as const
            ).map((option) => (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={gloss === option.id ? "default" : "outline"}
                onClick={() => setGloss(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={category === "all" ? "secondary" : "ghost"}
              onClick={() => setCategory("all")}
            >
              Toutes
            </Button>
            {PHRASEBOOK.map((c) => (
              <Button
                key={c.id}
                type="button"
                size="sm"
                variant={category === c.id ? "secondary" : "ghost"}
                onClick={() => setCategory(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>
        </div>

        {speech.error && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {speech.error}
          </p>
        )}

        {categories.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">
            Aucune phrase ne correspond à « {query} ».
          </p>
        )}

        <div className="mt-8 space-y-8">
          {categories.map((c) => (
            <section key={c.id}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {c.title} · {c.titleEn}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {c.entries.map((entry) => {
                  const id = `${c.id}-${entry.fon}`;
                  return (
                    <li key={id} className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-card-foreground">{entry.fon}</p>
                        {entry.phonetic && (
                          <p className="mt-0.5 text-xs italic text-muted-foreground">
                            [{entry.phonetic}]
                          </p>
                        )}
                        {(gloss === "both" || gloss === "fr") && (
                          <p className="mt-1 text-sm text-foreground">🇫🇷 {entry.fr}</p>
                        )}
                        {(gloss === "both" || gloss === "en") && (
                          <p className="mt-0.5 text-sm text-muted-foreground">🇬🇧 {entry.en}</p>
                        )}
                      </div>
                      <SpeakButton
                        speaking={speech.speakingId === id}
                        onSpeak={() =>
                          void speech.speak(id, entry.phonetic || entry.fon, "fon")
                        }
                        onStop={speech.stop}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          La lecture audio du fon reste approximative : elle s'appuie sur la graphie phonétique en
          attendant des enregistrements de locuteurs natifs.
        </p>
      </main>
    </div>
  );
}
