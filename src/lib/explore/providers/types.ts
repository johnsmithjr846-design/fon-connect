/**
 * Contrat commun à tous les fournisseurs de données cartographiques (lieux + itinéraires).
 * L'interface applicative (`explore.server.ts`, serveur functions, UI) ne dépend QUE de ce contrat :
 * changer de fournisseur (OSM, MapTiler, Google, ORS…) ne demande aucune modification d'UI.
 */
import type {
  ExplorePlace,
  PlaceCategoryId,
  RoutePlan,
  TravelMode,
} from "@/lib/explore/categories";

export type LatLng = { lat: number; lng: number };

export interface PlacesProvider {
  /** Identifiant du fournisseur, affiché comme source dans les fiches. */
  readonly id: string;
  searchByText(query: string, bias?: LatLng): Promise<ExplorePlace[]>;
  searchNearby(
    category: PlaceCategoryId,
    center: LatLng,
    radiusMeters?: number,
  ): Promise<ExplorePlace[]>;
  details(placeId: string): Promise<ExplorePlace | null>;
}

export interface RoutingProvider {
  readonly id: string;
  computeRoute(origin: LatLng, destination: LatLng, travelMode: TravelMode): Promise<RoutePlan>;
}

/** Configuration côté client (tuiles de la carte) — sérialisable, aucune clé secrète. */
export type TileProviderConfig = {
  id: string;
  urlTemplate: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
};
