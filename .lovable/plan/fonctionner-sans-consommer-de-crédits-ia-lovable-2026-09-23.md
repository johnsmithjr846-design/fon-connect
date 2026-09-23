# Fonctionner sans consommer de crédits IA Lovable

Objectif : que la traduction et la lecture à voix haute marchent sans crédits Lovable, avec vos propres services, Lovable servant uniquement de dernier secours.

## Point important sur le fon

Google Traduction, DeepL et les services de traduction classiques **ne connaissent pas le fon**. Ils couvrent uniquement français ↔ anglais.
Le fon continuera donc de passer par :
1. le corpus local FonConnect (gratuit, instantané), puis
2. un moteur IA — d'abord votre propre clé si vous en ajoutez une, sinon Lovable.

## Comment la traduction choisira sa source

```text
1. Corpus local FonConnect      -> gratuit, instantané
2. Google Traduction (FR <-> EN) -> votre clé, facturée chez Google
3. Votre clé IA (OpenAI/Gemini)  -> optionnelle, pour le fon
4. Lovable (secours final)       -> seulement si tout le reste échoue
```

Chaque réponse indiquera discrètement d'où vient la traduction, et l'espace admin affichera quel moteur a servi.

## Étape 1 — Google Traduction (maintenant)

- Vous créez une clé Google Cloud Translation et on l'enregistre en sécurité dans le site.
- Toutes les traductions français ↔ anglais passent par Google : aucun crédit Lovable consommé.
- Si Google échoue ou si la paire contient du fon, on passe à l'étape suivante de la chaîne.

## Étape 2 — Vos clés IA (ensuite, optionnel)

- Emplacement prévu pour une clé OpenAI et/ou Gemini personnelle, utilisée pour le fon.
- Si aucune clé n'est fournie, le fon utilise le corpus local puis Lovable.

## Étape 3 — DeepL (plus tard)

- Même mécanisme, ajouté comme alternative à Google pour français ↔ anglais, choisi dans l'espace admin.

## Lecture à voix haute — zéro crédit

- La voix du navigateur devient le mode **par défaut** (aujourd'hui elle n'est qu'un secours) : gratuite, aucune clé.
- Le fon est lu avec la voix française à vitesse réduite, comme actuellement.
- Un réglage discret permettra d'activer la voix naturelle Lovable pour ceux qui veulent la meilleure qualité, en sachant qu'elle consomme des crédits.
- Suggestion pour plus tard : enregistrer de vrais locuteurs fon pour les phrases clés, qualité supérieure et coût nul.

## Détails techniques

- Nouveau module `src/lib/translation/providers/` avec une interface commune `TranslationProvider` : `local`, `google`, `own-llm`, `lovable`.
- `src/lib/translate.functions.ts` devient un orchestrateur qui parcourt la chaîne dans l'ordre et renvoie `{ translation, phonetic, notes, provider }`.
- Google : appel REST `https://translation.googleapis.com/language/translate/v2` côté serveur, clé lue dans le handler.
- Secret à enregistrer : `GOOGLE_TRANSLATE_API_KEY` (puis `OPENAI_API_KEY` / `DEEPL_API_KEY` si souhaité).
- `src/hooks/useSpeech.ts` : inversion de priorité — `speechSynthesis` d'abord, route `/api/speech` uniquement si l'option voix naturelle est activée.
- Erreurs 402/429 du gateway ne remontent plus à l'utilisateur : elles déclenchent simplement le maillon suivant de la chaîne.

## Ce dont j'ai besoin de vous

Une clé Google Cloud Translation (console Google Cloud → activer « Cloud Translation API » → créer une clé API). Je vous ouvrirai un formulaire sécurisé au moment voulu.
