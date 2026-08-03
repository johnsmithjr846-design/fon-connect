# Traduction français ↔ fon dans FonConnect

## Point important sur Google Traduction

Google Traduction ne prend pas en charge le fon (ni son API Cloud Translation). Il n'existe aucun endpoint Google capable de traduire vers ou depuis le fon aujourd'hui. Un "traducteur Google français-fon" n'est donc pas réalisable techniquement.

À la place, la traduction reposera sur l'IA intégrée à Lovable (aucune clé à fournir), avec un prompt spécialisé FonConnect : orthographe du fon avec ses tons et diacritiques, registres poli/familier, contexte béninois (Cotonou, marché, taxi-moto, santé, urgence).

Le français reste disponible côté "langue source/cible" ; si vous voulez plus tard une passerelle Google, elle ne pourrait servir que pour les langues déjà supportées (ex. anglais ↔ français), pas pour le fon.

## Ce qui sera construit

1. **Page Traducteur** (`/traducteur`)
   - Zone de saisie + zone de résultat, bouton d'inversion du sens (FR → Fon / Fon → FR).
   - Bouton copier, compteur de caractères, état de chargement, gestion d'erreurs claire (limite de débit, crédits épuisés).
   - Résultat enrichi : traduction principale, transcription phonétique simplifiée, et 1–3 notes d'usage (registre, variante courante).

2. **Assistant IA FonConnect** (`/assistant`)
   - Chat en streaming avec une personnalité dédiée : professeur de fon bienveillant, réponses en français avec exemples en fon, corrections de prononciation, explications culturelles.
   - Rendu markdown, historique de la conversation en session (pas de base de données à ce stade).

3. **Navigation**
   - Liens vers Traducteur et Assistant depuis la page d'accueil, plus un en-tête commun aux couleurs du Bénin.

## Détails techniques

- Traduction : `createServerFn` dans `src/lib/translate.functions.ts`, appel Lovable AI Gateway via l'AI SDK, sortie structurée (traduction, phonétique, notes) avec repli sur texte brut si le modèle dévie.
- Assistant : route serveur `src/routes/api/chat.ts` en streaming + `useChat` côté client.
- Helper partagé `src/lib/ai-gateway.server.ts` pour le fournisseur AI Gateway.
- Aucune donnée persistée pour l'instant ; l'historique et les favoris pourront venir dans une étape suivante.
- Métadonnées SEO propres sur les deux nouvelles pages.

## Hors périmètre pour cette étape

Audio / prononciation vocale, leçons et quiz, phrasebook, comptes utilisateurs et offres payantes — à traiter dans des étapes suivantes.
