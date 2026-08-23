/**
 * Extraction des caractères spéciaux (non ASCII) nécessaires à une réponse.
 * Architecture extensible : ajouter un test dans `isSpecialCluster` suffit,
 * le composant clavier n'a pas besoin d'être modifié.
 */

/** Découpe une chaîne en clusters de graphèmes (base + diacritiques). */
export function splitGraphemes(value: string): string[] {
  const text = value.normalize("NFC");
  const Segmenter = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Segmenter) {
    const seg = new Segmenter("fr", { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  // Fallback : base + marques combinantes
  return text.match(/[\s\S][\u0300-\u036f]*/gu) ?? [];
}

/** Un cluster est « spécial » s'il sort de l'ASCII imprimable. */
export function isSpecialCluster(cluster: string): boolean {
  if (!cluster.trim()) return false;
  return [...cluster.normalize("NFC")].some((c) => c.charCodeAt(0) > 127);
}

/**
 * Caractères spéciaux d'une réponse attendue, dédupliqués,
 * dans l'ordre de première apparition.
 */
export function specialCharsFor(answer: string | undefined | null): string[] {
  if (!answer) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const cluster of splitGraphemes(answer)) {
    if (!isSpecialCluster(cluster)) continue;
    const key = cluster.normalize("NFC");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
