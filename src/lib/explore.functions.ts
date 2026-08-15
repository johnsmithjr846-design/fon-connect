import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ExplorePlace, RoutePlan } from "@/lib/explore/categories";

const CATEGORY_IDS = [
  "city",
  "tourist",
  "monument",
  "museum",
  "beach",
  "park",
  "market",
  "restaurant",
  "hotel",
  "health",
  "fuel",
  "transport",
  "culture",
  "other",
] as const;

const Coords = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const SearchInput = z.object({
  query: z.string().trim().max(200).optional(),
  category: z.enum(CATEGORY_IDS).optional(),
  center: Coords.optional(),
});

/** Recherche classique : texte libre ou catégorie autour d'un point. */
export const searchPlaces = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SearchInput.parse(input))
  .handler(async ({ data }): Promise<{ places: ExplorePlace[]; error: string | null }> => {
    const { searchPlacesByText, searchPlacesNearby } = await import("@/lib/explore.server");
    try {
      if (data.query && data.query.length >= 2) {
        const places = await searchPlacesByText(`${data.query} Bénin`, data.center);
        return { places, error: null };
      }
      if (data.category && data.center) {
        const places = await searchPlacesNearby(data.category, data.center);
        return { places, error: null };
      }
      return { places: [], error: null };
    } catch (error) {
      return { places: [], error: (error as Error).message };
    }
  });

export const getPlaceDetails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ placeId: z.string().min(3).max(200) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ place: ExplorePlace | null; error: string | null }> => {
    const { fetchPlaceDetails } = await import("@/lib/explore.server");
    try {
      return { place: await fetchPlaceDetails(data.placeId), error: null };
    } catch (error) {
      return { place: null, error: (error as Error).message };
    }
  });

export const getRoute = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        origin: Coords,
        destination: Coords,
        travelMode: z.enum(["DRIVE", "WALK", "TWO_WHEELER", "TRANSIT"]),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ route: RoutePlan | null; error: string | null }> => {
    const { computeRoutePlan } = await import("@/lib/explore.server");
    try {
      const route = await computeRoutePlan(data.origin, data.destination, data.travelMode);
      return { route, error: null };
    } catch (error) {
      return { route: null, error: (error as Error).message };
    }
  });

/**
 * Recherche assistée par IA : l'IA n'invente aucun lieu, elle traduit la demande
 * en requêtes de recherche exécutées ensuite sur l'API cartographique.
 */
export const askExplorer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string().trim().min(3).max(400),
        center: Coords.optional(),
        lang: z.enum(["fr", "en"]).default("fr"),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ answer: string; places: ExplorePlace[]; error: string | null }> => {
      const key = process.env["LOVABLE_API_KEY"];
      if (!key) return { answer: "", places: [], error: "Assistant indisponible." };

      const { generateText, Output } = await import("ai");
      const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
      const { searchPlacesByText } = await import("@/lib/explore.server");

      try {
        const gateway = createLovableAiGatewayProvider(key);
        const result = await generateText({
          model: gateway("google/gemini-3.6-flash"),
          system:
            "Tu es le guide touristique de FonConnect au Bénin. À partir de la demande, produis un court conseil (2-3 phrases) et 1 à 4 requêtes de recherche cartographique précises (nom de lieu ou type + ville) à exécuter au Bénin. N'invente jamais d'adresse, d'horaire ni de prix : les fiches viendront de la carte. " +
            (data.lang === "en" ? "Réponds en anglais." : "Réponds en français."),
          prompt: data.question,
          experimental_output: Output.object({
            schema: z.object({
              answer: z.string(),
              queries: z.array(z.string()).min(1).max(4),
            }),
          }),
        });

        const output = result.experimental_output;
        const seen = new Set<string>();
        const places: ExplorePlace[] = [];
        for (const query of output.queries.slice(0, 3)) {
          const found = await searchPlacesByText(`${query} Bénin`, data.center);
          for (const place of found.slice(0, 6)) {
            if (seen.has(place.id)) continue;
            seen.add(place.id);
            places.push(place);
          }
        }
        return { answer: output.answer, places, error: null };
      } catch (error) {
        return { answer: "", places: [], error: (error as Error).message };
      }
    },
  );

/** Le droit à la navigation AR est décidé côté serveur, jamais par le navigateur. */
export const getArAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ allowed: boolean; plans: string[] }> => {
    const { computeEntitlements } = await import("@/lib/entitlements.server");
    const entitlements = await computeEntitlements(context.supabase as never, context.userId);
    return { allowed: entitlements.arNavigation, plans: entitlements.plans };
  });
