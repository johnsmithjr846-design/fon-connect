/**
 * Configuration des tuiles de la carte (client-safe).
 * Changer de fournisseur de tuiles = ajouter une entrée ici, l'UI reste inchangée.
 */
import type { TileProviderConfig } from "@/lib/explore/providers/types";

export const TILE_PROVIDERS: Record<string, TileProviderConfig> = {
  osm: {
    id: "osm",
    urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  "osm-hot": {
    id: "osm-hot",
    urlTemplate: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, tuiles HOT',
    maxZoom: 19,
    subdomains: ["a", "b"],
  },
};

export function getTileProvider(): TileProviderConfig {
  const id = (import.meta.env["VITE_EXPLORE_TILE_PROVIDER"] as string | undefined) ?? "osm";
  return TILE_PROVIDERS[id] ?? TILE_PROVIDERS["osm"]!;
}
