/**
 * Registre des fournisseurs cartographiques.
 * Pour changer de fournisseur (tuiles, lieux, routage), il suffit d'enregistrer une
 * nouvelle implémentation ici : aucune modification de l'UI n'est nécessaire.
 * Sélection via variables d'environnement `EXPLORE_PLACES_PROVIDER` / `EXPLORE_ROUTING_PROVIDER`.
 */
import { osmPlacesProvider, osrmRoutingProvider } from "@/lib/explore/providers/osm.server";
import type { PlacesProvider, RoutingProvider } from "@/lib/explore/providers/types";

const PLACES_PROVIDERS: Record<string, PlacesProvider> = {
  openstreetmap: osmPlacesProvider,
};

const ROUTING_PROVIDERS: Record<string, RoutingProvider> = {
  osrm: osrmRoutingProvider,
};

export function getPlacesProvider(): PlacesProvider {
  const id = process.env["EXPLORE_PLACES_PROVIDER"] ?? "openstreetmap";
  return PLACES_PROVIDERS[id] ?? osmPlacesProvider;
}

export function getRoutingProvider(): RoutingProvider {
  const id = process.env["EXPLORE_ROUTING_PROVIDER"] ?? "osrm";
  return ROUTING_PROVIDERS[id] ?? osrmRoutingProvider;
}
