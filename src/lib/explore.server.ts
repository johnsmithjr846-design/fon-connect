/**
 * Accès serveur aux données cartographiques, délégué au fournisseur actif
 * (par défaut OpenStreetMap + OSRM, sans clé API).
 * L'interface publique de ce module ne change jamais quand le fournisseur change.
 */
import type { ExplorePlace, PlaceCategoryId, RoutePlan, TravelMode } from "@/lib/explore/categories";
import { getPlacesProvider, getRoutingProvider } from "@/lib/explore/providers/index.server";

/** Recherche textuelle limitée au Bénin. */
export async function searchPlacesByText(
  query: string,
  bias?: { lat: number; lng: number },
): Promise<ExplorePlace[]> {
  return getPlacesProvider().searchByText(query, bias);
}

/** Recherche par catégorie autour d'un point. */
export async function searchPlacesNearby(
  category: PlaceCategoryId,
  center: { lat: number; lng: number },
  radiusMeters = 15000,
): Promise<ExplorePlace[]> {
  return getPlacesProvider().searchNearby(category, center, radiusMeters);
}

export async function fetchPlaceDetails(placeId: string): Promise<ExplorePlace | null> {
  return getPlacesProvider().details(placeId);
}

export async function computeRoutePlan(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: TravelMode,
): Promise<RoutePlan> {
  return getRoutingProvider().computeRoute(origin, destination, travelMode);
}
