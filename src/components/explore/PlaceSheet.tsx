import { useEffect, useState } from "react";
import { Heart, Loader2, Navigation, Share2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/voice/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { translateText } from "@/lib/translate.functions";
import { categoryLabel, type ExplorePlace } from "@/lib/explore/categories";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type PlaceSheetProps = {
  place: ExplorePlace;
  onClose: () => void;
  onRoute: (place: ExplorePlace) => void;
};

export function PlaceSheet({ place, onClose, onRoute }: PlaceSheetProps) {
  const { lang } = useI18n();
  const { user } = useAuthUser();
  const speech = useSpeech();
  const translate = useServerFn(translateText);
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [translation, setTranslation] = useState<{ text: string; lang: "fr" | "en" | "fon" } | null>(
    null,
  );
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    setTranslation(null);
    if (!user) {
      setFavorite(false);
      return;
    }
    let active = true;
    void supabase
      .from("place_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_ref", place.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setFavorite(Boolean(data));
      });
    return () => {
      active = false;
    };
  }, [place.id, user]);

  async function toggleFavorite() {
    if (!user) return;
    setBusy(true);
    if (favorite) {
      await supabase.from("place_favorites").delete().eq("user_id", user.id).eq("place_ref", place.id);
      setFavorite(false);
    } else {
      await supabase.from("place_favorites").insert({
        user_id: user.id,
        place_ref: place.id,
        name: place.name,
        category: place.category,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
      });
      setFavorite(true);
    }
    setBusy(false);
  }

  const description =
    place.description ||
    (lang === "en"
      ? "No official description available for this place."
      : "Aucune description officielle disponible pour ce lieu.");

  async function translateSheet(target: "fon" | "en" | "fr") {
    setTranslating(true);
    try {
      const result = await translate({
        data: { text: `${place.name}. ${description}`, source: lang, target },
      });
      setTranslation({ text: result.translation, lang: target });
    } catch {
      setTranslation(null);
    } finally {
      setTranslating(false);
    }
  }

  async function share() {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    if (navigator.share) {
      await navigator.share({ title: place.name, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{place.name}</h2>
          <p className="text-xs text-muted-foreground">{categoryLabel(place.category, lang)}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Fermer" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {place.photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {place.photos.map((photo) => (
            <img
              key={photo}
              src={photo}
              alt={place.name}
              loading="lazy"
              className="h-28 w-40 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <dl className="mt-3 space-y-1 text-sm">
        {place.address && (
          <div>
            <dt className="sr-only">Adresse</dt>
            <dd className="text-muted-foreground">📍 {place.address}</dd>
          </div>
        )}
        {place.rating !== null && <dd className="text-muted-foreground">⭐ {place.rating} / 5</dd>}
        {place.phone && (
          <dd>
            <a className="text-primary hover:underline" href={`tel:${place.phone}`}>
              📞 {place.phone}
            </a>
          </dd>
        )}
        {place.website && (
          <dd>
            <a
              className="text-primary hover:underline"
              href={place.website}
              target="_blank"
              rel="noreferrer noopener"
            >
              🌐 {lang === "en" ? "Official website" : "Site officiel"}
            </a>
          </dd>
        )}
      </dl>

      {place.openingHours.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium">
            🕒 {lang === "en" ? "Opening hours" : "Horaires"}
          </summary>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            {place.openingHours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-3 text-sm text-foreground">{description}</p>
      {translation && (
        <p className="mt-2 rounded-lg bg-secondary p-2 text-sm text-secondary-foreground">
          {translation.text}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={() => onRoute(place)}>
          <Navigation className="mr-1.5 size-4" />
          {lang === "en" ? "Directions" : "Itinéraire"}
        </Button>
        <SpeakButton
          speaking={speech.speakingId === place.id}
          onSpeak={() =>
            void speech.speak(
              place.id,
              translation ? translation.text : `${place.name}. ${description}`,
              translation ? translation.lang : lang,
            )
          }
          onStop={speech.stop}
          label={lang === "en" ? "Listen" : "Écouter"}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!user || busy}
          onClick={() => void toggleFavorite()}
          aria-pressed={favorite}
        >
          <Heart className={`mr-1.5 size-4 ${favorite ? "fill-destructive text-destructive" : ""}`} />
          {lang === "en" ? "Favourite" : "Favori"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => void share()}>
          <Share2 className="mr-1.5 size-4" />
          {lang === "en" ? "Share" : "Partager"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">
          {lang === "en" ? "Translate:" : "Traduire :"}
        </span>
        {(["fon", "fr", "en"] as const)
          .filter((target) => target !== lang)
          .map((target) => (
            <Button
              key={target}
              type="button"
              variant="secondary"
              size="sm"
              disabled={translating}
              onClick={() => void translateSheet(target)}
            >
              {translating ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : null}
              {target.toUpperCase()}
            </Button>
          ))}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {lang === "en" ? "Source" : "Source"} : {place.source}
      </p>
    </aside>
  );
}
