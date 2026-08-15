/**
 * Fournisseur par défaut : OpenStreetMap (Nominatim + Overpass) et OSRM pour le routage.
 * Aucune clé API, aucun compte cloud. Aucune donnée inventée : tout provient d'OSM.
 */
import {
  CATEGORY_BY_ID,
  type ExplorePlace,
  type PlaceCategoryId,
  type RoutePlan,
  type RouteStep,
  type TravelMode,
} from "@/lib/explore/categories";
import { decodePolyline } from "@/lib/explore/polyline";
import type { LatLng, PlacesProvider, RoutingProvider } from "@/lib/explore/providers/types";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OVERPASS = "https://overpass-api.de/api/interpreter";
const OSRM = "https://router.project-osrm.org";
const UA = "FonConnect/1.0 (https://fonconnect.fr)";

/** Filtres Overpass par catégorie (clé=valeur OSM). */
const OVERPASS_FILTERS: Record<PlaceCategoryId, string[]> = {
  city: ["place=city", "place=town"],
  tourist: ["tourism=attraction", "tourism=viewpoint"],
  monument: ["historic=monument", "historic=memorial", "historic=castle"],
  museum: ["tourism=museum"],
  beach: ["natural=beach"],
  park: ["leisure=park", "boundary=national_park", "leisure=nature_reserve"],
  market: ["amenity=marketplace"],
  restaurant: ["amenity=restaurant", "amenity=cafe"],
  hotel: ["tourism=hotel", "tourism=guest_house"],
  health: ["amenity=hospital", "amenity=pharmacy", "amenity=clinic"],
  fuel: ["amenity=fuel"],
  transport: ["amenity=bus_station", "aeroway=aerodrome", "amenity=taxi"],
  culture: ["amenity=theatre", "amenity=arts_centre", "tourism=gallery"],
  other: [],
};

/** Déduction de la catégorie à partir des tags OSM. */
function categoryFromTags(tags: Record<string, string | undefined>): PlaceCategoryId {
  for (const [id, filters] of Object.entries(OVERPASS_FILTERS) as [PlaceCategoryId, string[]][]) {
    if (filters.some((f) => { const [k, v] = f.split("="); return k && v && tags[k] === v; })) {
      return id;
    }
  }
  return "other";
}

function categoryFromNominatim(category?: string, type?: string): PlaceCategoryId {
  const tags: Record<string, string> = {};
  if (category && type) tags[category] = type;
  const found = categoryFromTags(tags);
  if (found !== "other") return found;
  if (category === "place") return "city";
  if (category === "tourism") return "tourist";
  return "other";
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!response.ok) {
    console.error(`OSM ${response.status} sur ${url}`);
    throw new Error("Le service cartographique est momentanément indisponible.");
  }
  return response.json();
}

type NominatimItem = {
  osm_type?: string;
  osm_id?: number;
  place_id?: number;
  name?: string;
  display_name?: string;
  lat?: string;
  lon?: string;
  category?: string;
  type?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
};

function osmId(item: NominatimItem): string {
  const prefix = (item.osm_type ?? "node")[0] ?? "n";
  return item.osm_id ? `${prefix}${item.osm_id}` : `p${item.place_id ?? Math.random()}`;
}

function cityFrom(address: Record<string, string> | undefined): string {
  return (
    address?.["city"] ??
    address?.["town"] ??
    address?.["village"] ??
    address?.["county"] ??
    address?.["state"] ??
    ""
  );
}

function fromNominatim(item: NominatimItem): ExplorePlace | null {
  const lat = Number.parseFloat(item.lat ?? "");
  const lng = Number.parseFloat(item.lon ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const extra = item.extratags ?? {};
  return {
    id: osmId(item),
    name: item.name || (item.display_name ?? "").split(",")[0] || "",
    category: categoryFromNominatim(item.category, item.type),
    latitude: lat,
    longitude: lng,
    address: item.display_name ?? "",
    city: cityFrom(item.address),
    description: extra["description"] ?? "",
    photos: [],
    openingHours: extra["opening_hours"] ? [extra["opening_hours"]] : [],
    price: "",
    phone: extra["phone"] ?? extra["contact:phone"] ?? "",
    website: extra["website"] ?? extra["contact:website"] ?? "",
    rating: null,
    source: "OpenStreetMap",
  };
}

type OverpassElement = {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

function fromOverpass(el: OverpassElement): ExplorePlace | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const tags = el.tags ?? {};
  if (typeof lat !== "number" || typeof lng !== "number" || !tags["name"]) return null;
  const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
    .filter(Boolean)
    .join(" ");
  return {
    id: `${(el.type ?? "node")[0]}${el.id ?? 0}`,
    name: tags["name"],
    category: categoryFromTags(tags),
    latitude: lat,
    longitude: lng,
    address,
    city: tags["addr:city"] ?? "",
    description: tags["description"] ?? "",
    photos: [],
    openingHours: tags["opening_hours"] ? [tags["opening_hours"]] : [],
    price: "",
    phone: tags["phone"] ?? tags["contact:phone"] ?? "",
    website: tags["website"] ?? tags["contact:website"] ?? "",
    rating: null,
    source: "OpenStreetMap",
  };
}

export const osmPlacesProvider: PlacesProvider = {
  id: "openstreetmap",

  async searchByText(query, bias) {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      countrycodes: "bj",
      addressdetails: "1",
      extratags: "1",
      limit: "20",
      "accept-language": "fr",
    });
    if (bias) {
      const d = 0.5;
      params.set(
        "viewbox",
        `${bias.lng - d},${bias.lat + d},${bias.lng + d},${bias.lat - d}`,
      );
    }
    const json = (await getJson(`${NOMINATIM}/search?${params}`)) as NominatimItem[];
    return (json ?? []).map(fromNominatim).filter((p): p is ExplorePlace => Boolean(p));
  },

  async searchNearby(category, center, radiusMeters = 15000) {
    const filters = OVERPASS_FILTERS[category] ?? [];
    if (!filters.length) return [];
    const radius = Math.min(radiusMeters, 50000);
    const body = `[out:json][timeout:25];(${filters
      .map((f) => {
        const [k, v] = f.split("=");
        return `nwr[${k}=${v}](around:${radius},${center.lat},${center.lng});`;
      })
      .join("")});out center 30;`;

    const response = await fetch(OVERPASS, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: body }).toString(),
    });
    if (!response.ok) {
      console.error(`Overpass ${response.status}`);
      throw new Error("Le service cartographique est momentanément indisponible.");
    }
    const json = (await response.json()) as { elements?: OverpassElement[] };
    const places = (json.elements ?? [])
      .map(fromOverpass)
      .filter((p): p is ExplorePlace => Boolean(p))
      .map((p) => ({ ...p, category: p.category === "other" ? category : p.category }));
    return places.slice(0, 20);
  },

  async details(placeId) {
    const match = /^([nwr])(\d+)$/.exec(placeId);
    if (!match) return null;
    const params = new URLSearchParams({
      osm_ids: `${match[1]!.toUpperCase()}${match[2]}`,
      format: "jsonv2",
      addressdetails: "1",
      extratags: "1",
      "accept-language": "fr",
    });
    const json = (await getJson(`${NOMINATIM}/lookup?${params}`)) as NominatimItem[];
    const first = json?.[0];
    return first ? fromNominatim(first) : null;
  },
};

const OSRM_PROFILES: Record<TravelMode, string> = {
  DRIVE: "driving",
  WALK: "foot",
  TWO_WHEELER: "bike",
  TRANSIT: "driving",
};

type OsrmStep = {
  distance?: number;
  duration?: number;
  name?: string;
  maneuver?: { type?: string; modifier?: string; location?: [number, number] };
};

const MANEUVERS: Record<string, string> = {
  turn: "Tournez",
  "new name": "Continuez",
  depart: "Départ",
  arrive: "Arrivée",
  merge: "Rejoignez",
  "on ramp": "Prenez la bretelle",
  "off ramp": "Sortez",
  fork: "À l'embranchement",
  "end of road": "En bout de route",
  continue: "Continuez",
  roundabout: "Au rond-point",
  rotary: "Au rond-point",
  "roundabout turn": "Au rond-point",
};

const MODIFIERS: Record<string, string> = {
  left: "à gauche",
  right: "à droite",
  "slight left": "légèrement à gauche",
  "slight right": "légèrement à droite",
  "sharp left": "franchement à gauche",
  "sharp right": "franchement à droite",
  straight: "tout droit",
  uturn: "faites demi-tour",
};

function instructionFrom(step: OsrmStep): string {
  const base = MANEUVERS[step.maneuver?.type ?? ""] ?? "Continuez";
  const modifier = MODIFIERS[step.maneuver?.modifier ?? ""] ?? "";
  const road = step.name ? ` sur ${step.name}` : "";
  return `${base}${modifier ? ` ${modifier}` : ""}${road}`.trim();
}

export const osrmRoutingProvider: RoutingProvider = {
  id: "osrm",

  async computeRoute(origin, destination, travelMode) {
    const profile = OSRM_PROFILES[travelMode] ?? "driving";
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${OSRM}/route/v1/${profile}/${coords}?overview=full&geometries=polyline&steps=true`;
    const response = await fetch(url, { headers: { "User-Agent": UA } });
    if (!response.ok) {
      console.error(`OSRM ${response.status}`);
      throw new Error("L'itinéraire n'a pas pu être calculé.");
    }
    const json = (await response.json()) as {
      routes?: {
        distance?: number;
        duration?: number;
        geometry?: string;
        legs?: { steps?: OsrmStep[] }[];
      }[];
    };
    const route = json.routes?.[0];
    if (!route) throw new Error("Aucun itinéraire disponible pour ce trajet.");

    const steps: RouteStep[] = (route.legs ?? []).flatMap((leg) =>
      (leg.steps ?? []).map((step) => ({
        instruction: instructionFrom(step),
        distanceMeters: Math.round(step.distance ?? 0),
        durationSeconds: Math.round(step.duration ?? 0),
        endLat: step.maneuver?.location?.[1] ?? destination.lat,
        endLng: step.maneuver?.location?.[0] ?? destination.lng,
      })),
    );

    const polyline = route.geometry ?? "";
    // Validation légère : une polyline illisible casserait l'affichage côté carte.
    if (polyline) decodePolyline(polyline);

    return {
      distanceMeters: Math.round(route.distance ?? 0),
      durationSeconds: Math.round(route.duration ?? 0),
      polyline,
      travelMode,
      steps,
    };
  },
};

/** Utilisé pour libeller la catégorie choisie dans les recherches Overpass. */
export function categoryLabelFr(id: PlaceCategoryId): string {
  return CATEGORY_BY_ID[id]?.label ?? "Lieux";
}
