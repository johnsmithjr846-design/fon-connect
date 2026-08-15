/** Catégories de lieux du module Explorer (client-safe, aucune donnée inventée). */

export type PlaceCategoryId =
  | "city"
  | "tourist"
  | "monument"
  | "museum"
  | "beach"
  | "park"
  | "market"
  | "restaurant"
  | "hotel"
  | "health"
  | "fuel"
  | "transport"
  | "culture"
  | "other";

export type PlaceCategory = {
  id: PlaceCategoryId;
  emoji: string;
  label: string;
  labelEn: string;
  /** Types Google Places (New) utilisés pour la recherche à proximité. */
  googleTypes: string[];
};

export const PLACE_CATEGORIES: PlaceCategory[] = [
  { id: "city", emoji: "🏙️", label: "Villes", labelEn: "Cities", googleTypes: ["locality"] },
  {
    id: "tourist",
    emoji: "📸",
    label: "Sites touristiques",
    labelEn: "Tourist sites",
    googleTypes: ["tourist_attraction"],
  },
  {
    id: "monument",
    emoji: "🏛️",
    label: "Monuments",
    labelEn: "Monuments",
    googleTypes: ["historical_landmark", "monument"],
  },
  { id: "museum", emoji: "🖼️", label: "Musées", labelEn: "Museums", googleTypes: ["museum"] },
  { id: "beach", emoji: "🏖️", label: "Plages", labelEn: "Beaches", googleTypes: ["beach"] },
  {
    id: "park",
    emoji: "🌳",
    label: "Parcs & réserves",
    labelEn: "Parks & reserves",
    googleTypes: ["national_park", "park", "wildlife_park"],
  },
  { id: "market", emoji: "🧺", label: "Marchés", labelEn: "Markets", googleTypes: ["market"] },
  {
    id: "restaurant",
    emoji: "🍽️",
    label: "Restaurants",
    labelEn: "Restaurants",
    googleTypes: ["restaurant"],
  },
  { id: "hotel", emoji: "🛏️", label: "Hôtels", labelEn: "Hotels", googleTypes: ["hotel", "lodging"] },
  {
    id: "health",
    emoji: "🏥",
    label: "Hôpitaux & pharmacies",
    labelEn: "Hospitals & pharmacies",
    googleTypes: ["hospital", "pharmacy"],
  },
  {
    id: "fuel",
    emoji: "⛽",
    label: "Stations-service",
    labelEn: "Petrol stations",
    googleTypes: ["gas_station"],
  },
  {
    id: "transport",
    emoji: "🚌",
    label: "Transports",
    labelEn: "Transport",
    googleTypes: ["bus_station", "airport", "taxi_stand"],
  },
  {
    id: "culture",
    emoji: "🎭",
    label: "Lieux culturels",
    labelEn: "Cultural venues",
    googleTypes: ["cultural_center", "art_gallery", "performing_arts_theater"],
  },
  { id: "other", emoji: "📍", label: "Autres", labelEn: "Other", googleTypes: [] },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  PLACE_CATEGORIES.map((c) => [c.id, c]),
) as Record<PlaceCategoryId, PlaceCategory>;

export function categoryLabel(id: string, lang: "fr" | "en"): string {
  const cat = CATEGORY_BY_ID[id as PlaceCategoryId] ?? CATEGORY_BY_ID.other;
  return `${cat.emoji} ${lang === "en" ? cat.labelEn : cat.label}`;
}

/** Centre du Bénin (Cotonou) pour le cadrage initial de la carte. */
export const BENIN_CENTER = { lat: 6.3703, lng: 2.3912 };
export const BENIN_DEFAULT_ZOOM = 7;

export type ExplorePlace = {
  /** Identifiant Google Places, ou `db:<uuid>` pour un lieu ajouté par l'administration. */
  id: string;
  name: string;
  category: PlaceCategoryId;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  description: string;
  photos: string[];
  openingHours: string[];
  price: string;
  phone: string;
  website: string;
  rating: number | null;
  source: string;
};

export type RouteStep = {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  endLat: number;
  endLng: number;
};

export type RoutePlan = {
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  travelMode: TravelMode;
  steps: RouteStep[];
};

export type TravelMode = "DRIVE" | "WALK" | "TWO_WHEELER" | "TRANSIT";

export const TRAVEL_MODES: { id: TravelMode; emoji: string; label: string; labelEn: string }[] = [
  { id: "DRIVE", emoji: "🚗", label: "Voiture", labelEn: "Car" },
  { id: "WALK", emoji: "🚶", label: "À pied", labelEn: "Walking" },
  { id: "TWO_WHEELER", emoji: "🛵", label: "Deux-roues", labelEn: "Two-wheeler" },
  { id: "TRANSIT", emoji: "🚌", label: "Transports", labelEn: "Transit" },
];

export function formatDistance(meters: number, lang: "fr" | "en" = "fr"): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", lang === "fr" ? "," : ".")} km`;
}

export function formatDuration(seconds: number, lang: "fr" | "en" = "fr"): string {
  const total = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return lang === "en" ? `${h} h ${m} min` : `${h} h ${m.toString().padStart(2, "0")}`;
}
