import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PHRASEBOOK } from "@/lib/phrasebook-data";

export default defineTool({
  name: "search_phrasebook",
  title: "Chercher dans le guide de conversation fon",
  description:
    "Recherche des phrases utiles en fon (avec français, anglais et phonétique) dans le guide de conversation FonConnect : salutations, marché, santé, urgence, transport…",
  inputSchema: {
    query: z.string().trim().min(1).describe("Mot ou phrase à chercher (fon, français ou anglais)."),
    category: z.string().trim().optional().describe("Identifiant de catégorie pour restreindre la recherche."),
    limit: z.number().int().min(1).max(50).default(10).describe("Nombre maximum de résultats."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, limit }) => {
    const q = query.toLowerCase();
    const results = PHRASEBOOK.filter((c) => !category || c.id === category)
      .flatMap((c) => c.entries.map((e) => ({ ...e, category: c.id, categoryTitle: c.title })))
      .filter((e) =>
        [e.fon, e.fr, e.en, e.phonetic ?? ""].some((v) => v.toLowerCase().includes(q)),
      )
      .slice(0, limit ?? 10);

    return {
      content: [
        {
          type: "text" as const,
          text: results.length
            ? results.map((r) => `${r.fon} — ${r.fr} / ${r.en} (${r.phonetic ?? ""}) [${r.categoryTitle}]`).join("\n")
            : "Aucune phrase trouvée.",
        },
      ],
      structuredContent: { results },
    };
  },
});
