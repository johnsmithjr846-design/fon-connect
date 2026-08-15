/**
 * Accès serveur aux API cartographiques (Google Maps Platform) via la passerelle Lovable.
 * Aucune clé secrète ne transite par le navigateur, aucune donnée de lieu n'est inventée.
 */
import {
  CATEGORY_BY_ID,
  PLACE_CATEGORIES,
  type ExplorePlace,
  type PlaceCategoryId,
  type RoutePlan,
  type RouteStep,
  type TravelMode,
} from "@/lib/explore/categories";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

const PLACE_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.location",
  "places.types",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.editorialSummary",
  "places.photos",
].join(",");

const DETAIL_FIELDS = PLACE_FIELDS.replace(/places\./g, "");

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  rating?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  editorialSummary?: { text?: string };
  photos?: { name?: string }[];
};

function credentials() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) {
    throw new Error("La cartographie n'est pas encore configurée sur ce projet.");
  }
  return { lovableKey, mapsKey };
}

async function gateway(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; fieldMask?: string },
): Promise<unknown> {
  const { lovableKey, mapsKey } = credentials();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": mapsKey,
    "Content-Type": "application/json",
  };
  if (init.fieldMask) headers["X-Goog-FieldMask"] = init.fieldMask;

  const response = await fetch(`${GATEWAY_URL}${path}`, {
    method: init.method,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Google Maps gateway ${response.status}: ${errorBody}`);
    if (response.status === 403) {
      throw new Error("La cartographie a refusé la requête (clé restreinte).");
    }
    throw new Error("Le service cartographique est momentanément indisponible.");
  }
  return response.json();
}

function categoryFromTypes(types: string[] | undefined): PlaceCategoryId {
  if (!types?.length) return "other";
  for (const category of PLACE_CATEGORIES) {
    if (category.googleTypes.some((t) => types.includes(t))) return category.id;
  }
  return "other";
}

function photoUrl(name: string | undefined, browserKey: string | undefined): string | null {
  if (!name || !browserKey) return null;
  return `https://places.googleapis.com/v1/${name}/media?maxHeightPx=640&key=${browserKey}`;
}

function toPlace(raw: GooglePlace): ExplorePlace | null {
  const lat = raw.location?.latitude;
  const lng = raw.location?.longitude;
  if (!raw.id || typeof lat !== "number" || typeof lng !== "number") return null;
  const browserKey = process.env["GOOGLE_MAPS_BROWSER_KEY"];
  const address = raw.formattedAddress ?? raw.shortFormattedAddress ?? "";
  return {
    id: raw.id,
    name: raw.displayName?.text ?? "",
    category: categoryFromTypes(raw.types),
    latitude: lat,
    longitude: lng,
    address,
    city: address.split(",").slice(-2, -1)[0]?.trim() ?? "",
    description: raw.editorialSummary?.text ?? "",
    photos: (raw.photos ?? [])
      .slice(0, 3)
      .map((p) => photoUrl(p.name, browserKey))
      .filter((u): u is string => Boolean(u)),
    openingHours: raw.regularOpeningHours?.weekdayDescriptions ?? [],
    price: "",
    phone: raw.nationalPhoneNumber ?? "",
    website: raw.websiteUri ?? "",
    rating: typeof raw.rating === "number" ? raw.rating : null,
    source: "Google Maps Platform",
  };
}

/** Recherche textuelle limitée au Bénin. */
export async function searchPlacesByText(
  query: string,
  bias?: { lat: number; lng: number },
): Promise<ExplorePlace[]> {
  const body: Record<string, unknown> = {
    textQuery: query,
    regionCode: "BJ",
    languageCode: "fr",
    maxResultCount: 20,
  };
  if (bias) {
    body["locationBias"] = {
      circle: { center: { latitude: bias.lat, longitude: bias.lng }, radius: 25000 },
    };
  }
  const json = (await gateway("/places/v1/places:searchText", {
    method: "POST",
    body,
    fieldMask: PLACE_FIELDS,
  })) as { places?: GooglePlace[] };
  return (json.places ?? []).map(toPlace).filter((p): p is ExplorePlace => Boolean(p));
}

/** Recherche par catégorie autour d'un point. */
export async function searchPlacesNearby(
  category: PlaceCategoryId,
  center: { lat: number; lng: number },
  radiusMeters = 15000,
): Promise<ExplorePlace[]> {
  const types = CATEGORY_BY_ID[category]?.googleTypes ?? [];
  if (!types.length) return [];
  const json = (await gateway("/places/v1/places:searchNearby", {
    method: "POST",
    body: {
      includedTypes: types,
      maxResultCount: 20,
      languageCode: "fr",
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: Math.min(radiusMeters, 50000),
        },
      },
    },
    fieldMask: PLACE_FIELDS,
  })) as { places?: GooglePlace[] };
  return (json.places ?? []).map(toPlace).filter((p): p is ExplorePlace => Boolean(p));
}

export async function fetchPlaceDetails(placeId: string): Promise<ExplorePlace | null> {
  const json = (await gateway(`/places/v1/places/${encodeURIComponent(placeId)}`, {
    method: "GET",
    fieldMask: DETAIL_FIELDS,
  })) as GooglePlace;
  return toPlace(json);
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function computeRoutePlan(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: TravelMode,
): Promise<RoutePlan> {
  const { lovableKey, mapsKey } = credentials();
  const response = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
      "Content-Type": "application/json",
      "X-Goog-FieldMask":
        "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.endLocation",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
      },
      travelMode,
      languageCode: "fr",
      units: "METRIC",
      ...(travelMode === "DRIVE" ? { routingPreference: "TRAFFIC_AWARE" } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Routes API ${response.status}: ${errorBody}`);
    throw new Error("L'itinéraire n'a pas pu être calculé.");
  }

  const json = (await response.json()) as {
    routes?: {
      distanceMeters?: number;
      duration?: string;
      polyline?: { encodedPolyline?: string };
      legs?: {
        steps?: {
          navigationInstruction?: { instructions?: string };
          distanceMeters?: number;
          staticDuration?: string;
          endLocation?: { latLng?: { latitude?: number; longitude?: number } };
        }[];
      }[];
    }[];
  };

  const route = json.routes?.[0];
  if (!route) throw new Error("Aucun itinéraire disponible pour ce trajet.");

  const seconds = (value?: string) => Number.parseInt(value?.replace("s", "") ?? "0", 10) || 0;
  const steps: RouteStep[] = (route.legs ?? []).flatMap((leg) =>
    (leg.steps ?? []).map((step) => ({
      instruction: stripHtml(step.navigationInstruction?.instructions ?? "Continuez"),
      distanceMeters: step.distanceMeters ?? 0,
      durationSeconds: seconds(step.staticDuration),
      endLat: step.endLocation?.latLng?.latitude ?? destination.lat,
      endLng: step.endLocation?.latLng?.longitude ?? destination.lng,
    })),
  );

  return {
    distanceMeters: route.distanceMeters ?? 0,
    durationSeconds: seconds(route.duration),
    polyline: route.polyline?.encodedPolyline ?? "",
    travelMode,
    steps,
  };
}
