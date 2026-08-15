import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Compass, Crosshair, Loader2, Search, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PlaceSheet } from "@/components/explore/PlaceSheet";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/useSiteData";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { askExplorer, getRoute, searchPlaces } from "@/lib/explore.functions";
import {
  PLACE_CATEGORIES,
  TRAVEL_MODES,
  formatDistance,
  formatDuration,
  type ExplorePlace,
  type PlaceCategoryId,
  type RoutePlan,
  type TravelMode,
} from "@/lib/explore/categories";

const ExploreMap = lazy(() => import("@/components/explore/ExploreMap"));

export const Route = createFileRoute("/explorer/")({
  component: ExplorerPage,
  head: () => ({
    meta: [
      { title: "Explorer le Bénin — carte, lieux et itinéraires | FonConnect" },
      {
        name: "description",
        content:
          "Carte interactive du Bénin : sites touristiques, musées, plages, marchés, restaurants et hôtels, avec recherche IA, itinéraires et navigation AR.",
      },
      { property: "og:title", content: "Explorer le Bénin avec FonConnect" },
      {
        property: "og:description",
        content:
          "Carte interactive, recherche assistée par IA, fiches de lieux, itinéraires et navigation en réalité augmentée.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/explorer" }],
  }),
});

type DbPlace = {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  description: string;
  photos: string[];
  opening_hours: string;
  price: string;
  phone: string;
  website: string;
  source: string;
};

function fromDb(row: DbPlace): ExplorePlace {
  return {
    id: `db:${row.id}`,
    name: row.name,
    category: (row.category as PlaceCategoryId) ?? "other",
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    city: row.city,
    description: row.description,
    photos: row.photos ?? [],
    openingHours: row.opening_hours ? row.opening_hours.split("\n").filter(Boolean) : [],
    price: row.price,
    phone: row.phone,
    website: row.website,
    rating: null,
    source: row.source || "FonConnect",
  };
}

function ExplorerPage() {
  const { lang } = useI18n();
  usePageView("/explorer");

  const runSearch = useServerFn(searchPlaces);
  const runAsk = useServerFn(askExplorer);
  const runRoute = useServerFn(getRoute);

  const [curated, setCurated] = useState<ExplorePlace[]>([]);
  const [results, setResults] = useState<ExplorePlace[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PlaceCategoryId | null>(null);
  const [selected, setSelected] = useState<ExplorePlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);

  const [travelMode, setTravelMode] = useState<TravelMode>("DRIVE");
  const [route, setRoute] = useState<RoutePlan | null>(null);
  const [routeTarget, setRouteTarget] = useState<ExplorePlace | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase
      .from("places")
      .select(
        "id,name,category,latitude,longitude,address,city,description,photos,opening_hours,price,phone,website,source",
      )
      .eq("published", true)
      .limit(200)
      .then(({ data }) => {
        if (active && data) setCurated((data as DbPlace[]).map(fromDb));
      });
    return () => {
      active = false;
    };
  }, []);

  const places = useMemo(() => {
    const base = results.length > 0 ? results : curated;
    return category ? base.filter((p) => p.category === category) : base;
  }, [results, curated, category]);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError(lang === "en" ? "Location is not available." : "La localisation n'est pas disponible.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoError(null);
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRecenterToken((n) => n + 1);
      },
      () =>
        setGeoError(
          lang === "en"
            ? "Location permission denied."
            : "Autorisation de localisation refusée.",
        ),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [lang]);

  async function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await runSearch({
      data: {
        query: query.trim() || undefined,
        category: category ?? undefined,
        center: position ?? undefined,
      },
    });
    setResults(response.places);
    setError(response.error);
    setLoading(false);
  }

  async function pickCategory(id: PlaceCategoryId) {
    const next = category === id ? null : id;
    setCategory(next);
    if (!next || !position) return;
    setLoading(true);
    const response = await runSearch({ data: { category: next, center: position } });
    setResults(response.places);
    setError(response.error);
    setLoading(false);
  }

  async function askAi(event: React.FormEvent) {
    event.preventDefault();
    if (aiQuestion.trim().length < 3) return;
    setAiLoading(true);
    setError(null);
    try {
      const response = await runAsk({
        data: { question: aiQuestion.trim(), center: position ?? undefined, lang },
      });
      setAiAnswer(response.answer);
      if (response.places.length) setResults(response.places);
      setError(response.error);
    } catch {
      setError(
        lang === "en"
          ? "Sign in to use the AI travel assistant."
          : "Connectez-vous pour utiliser l'assistant touristique IA.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function planRoute(place: ExplorePlace, mode: TravelMode = travelMode) {
    if (!position) {
      locate();
      setRouteTarget(place);
      return;
    }
    setRouteTarget(place);
    setRouteLoading(true);
    const response = await runRoute({
      data: {
        origin: position,
        destination: { lat: place.latitude, lng: place.longitude },
        travelMode: mode,
      },
    });
    setRoute(response.route);
    setError(response.error);
    setRouteLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          🗺️ {lang === "en" ? "Explore Benin" : "Explorer le Bénin"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "en"
            ? "Places, routes and AR navigation, powered by verified map data."
            : "Lieux, itinéraires et navigation AR, à partir de données cartographiques vérifiées."}
        </p>

        <form onSubmit={submitSearch} className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "en" ? "🔎 Where do you want to go?" : "🔎 Où souhaitez-vous aller ?"}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label={lang === "en" ? "Search a place" : "Rechercher un lieu"}
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </Button>
          <Button type="button" variant="secondary" onClick={locate} aria-label="Ma position">
            <Crosshair className="size-4" />
          </Button>
        </form>
        {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PLACE_CATEGORIES.filter((c) => c.id !== "other").map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => void pickCategory(c.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                category === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:border-primary"
              }`}
            >
              {c.emoji} {lang === "en" ? c.labelEn : c.label}
            </button>
          ))}
        </div>

        <div className="mt-4 h-[360px] w-full overflow-hidden rounded-xl border border-border">
          <ClientOnly
            fallback={<div className="h-full w-full animate-pulse bg-muted" aria-hidden />}
          >
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" aria-hidden />}>
              <ExploreMap
                places={places}
                selectedId={selected?.id ?? null}
                userPosition={position}
                routePolyline={route?.polyline ?? null}
                onSelect={setSelected}
                recenterToken={recenterToken}
              />
            </Suspense>
          </ClientOnly>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <form onSubmit={askAi} className="mt-4 rounded-xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="size-4 text-primary" />
            🤖 {lang === "en" ? "Ask FonConnect" : "Demander à FonConnect"}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={
                lang === "en"
                  ? "I have 2 hours in Cotonou, what can I discover?"
                  : "J'ai 2 heures à Cotonou, que puis-je découvrir ?"
              }
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={aiLoading}>
              {aiLoading ? <Loader2 className="size-4 animate-spin" /> : "→"}
            </Button>
          </div>
          {aiAnswer && <p className="mt-2 text-sm text-muted-foreground">{aiAnswer}</p>}
        </form>

        {selected && (
          <div className="mt-4">
            <PlaceSheet
              place={selected}
              onClose={() => setSelected(null)}
              onRoute={(place) => void planRoute(place)}
            />
          </div>
        )}

        {routeTarget && (
          <section className="mt-4 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              🧭 {lang === "en" ? "Route to" : "Itinéraire vers"} {routeTarget.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              📍 {lang === "en" ? "From: my location" : "Départ : ma position"} · 🏁 {routeTarget.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TRAVEL_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setTravelMode(mode.id);
                    void planRoute(routeTarget, mode.id);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    travelMode === mode.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground"
                  }`}
                >
                  {mode.emoji} {lang === "en" ? mode.labelEn : mode.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-3"
              disabled={routeLoading}
              onClick={() => void planRoute(routeTarget)}
            >
              {routeLoading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              🧭 {lang === "en" ? "Calculate route" : "Calculer l'itinéraire"}
            </Button>

            {route && (
              <div className="mt-3 text-sm">
                <p className="font-medium text-foreground">
                  {formatDistance(route.distanceMeters, lang)} ·{" "}
                  {formatDuration(route.durationSeconds, lang)}
                </p>
                <ol className="mt-2 space-y-1 text-muted-foreground">
                  {route.steps.slice(0, 12).map((step, index) => (
                    <li key={`${step.instruction}-${index}`}>
                      {index + 1}. {step.instruction} — {formatDistance(step.distanceMeters, lang)}
                    </li>
                  ))}
                </ol>
                <Link
                  to="/explorer/ar"
                  search={{
                    lat: routeTarget.latitude,
                    lng: routeTarget.longitude,
                    name: routeTarget.name,
                    mode: travelMode,
                  }}
                  className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  <Compass className="mr-1.5 size-4" />
                  {lang === "en" ? "Start AR navigation" : "Démarrer la navigation AR"}
                </Link>
              </div>
            )}
          </section>
        )}

        {places.length > 0 && (
          <section className="mt-4">
            <h2 className="text-sm font-semibold text-foreground">
              {lang === "en" ? "Results" : "Résultats"} ({places.length})
            </h2>
            <ul className="mt-2 space-y-2">
              {places.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(place)}
                    className="w-full rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary"
                  >
                    <span className="font-medium text-foreground">{place.name}</span>
                    <span className="block text-xs text-muted-foreground">{place.address}</span>
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
