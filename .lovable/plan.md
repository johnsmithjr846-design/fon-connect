# Choix de langue d'interface (français / anglais)

L'utilisateur choisit sa langue d'affichage à l'inscription, et peut la changer ensuite depuis une page « Mon profil ». L'app entière (menus, boutons, textes, leçons, phrasebook) s'affiche dans la langue choisie.

## Ce qui change pour l'utilisateur

1. **À l'inscription** : un sélecteur « Langue de l'application : Français / English » sous le pseudo.
2. **Partout dans l'app** : l'interface s'affiche dans cette langue, y compris avant connexion (français par défaut, mémorisé dans le navigateur).
3. **Page /profil** : accessible depuis l'en-tête une fois connecté. Permet de modifier le pseudo et la langue, et affiche l'e-mail du compte.
4. **En-tête** : un petit sélecteur FR / EN reste disponible pour les visiteurs non connectés.

## Système de traduction

- Un dictionnaire de textes `fr` / `en` couvrant l'accueil, l'en-tête, le traducteur, l'assistant, le phrasebook, les leçons, le quiz, l'authentification et le profil.
- Un contexte React `LanguageProvider` (dans la racine) qui expose `t("clé")` et la langue courante.
- Ordre de priorité de la langue : préférence du profil connecté → choix stocké dans le navigateur → français.
- Les pages légales (CGU, confidentialité, cookies, mentions) restent en français ; une note l'indique en mode anglais.
- Le contenu pédagogique (leçons, phrasebook) a déjà ses libellés français et anglais dans les données existantes : la langue choisie sélectionne la colonne à afficher et devient la langue source par défaut du traducteur.

## Base de données

Ajout d'une colonne `preferred_language` à la table `profiles` (valeur `fr` ou `en`, `fr` par défaut), enregistrée à la création du compte et modifiable par l'utilisateur pour son propre profil uniquement.

## Détails techniques

- Migration : `ALTER TABLE public.profiles ADD COLUMN preferred_language text NOT NULL DEFAULT 'fr'` + contrainte de valeurs, et mise à jour de `handle_new_user()` pour lire `raw_user_meta_data ->> 'preferred_language'`.
- `src/lib/i18n/dictionary.ts` (clés + traductions) et `src/lib/i18n/LanguageProvider.tsx` (contexte, `useI18n()`, persistance `localStorage`).
- `src/routes/auth.tsx` : champ langue passé dans `options.data` du `signUp`.
- `src/routes/profil.tsx` : nouvelle page, lecture/écriture du profil via une server function protégée (`requireSupabaseAuth`), appelée depuis le composant (pas depuis le loader).
- `src/components/SiteHeader.tsx` : lien « Profil » quand connecté + sélecteur de langue, libellés issus du dictionnaire.
- Chaque route reçoit son `head()` traduit selon la langue active.

## Étapes

1. Migration de la colonne `preferred_language` et du trigger d'inscription.
2. Dictionnaire + provider de langue branchés dans `__root.tsx`.
3. Remplacement des textes en dur par `t()` dans l'en-tête, l'accueil, le traducteur, l'assistant, le phrasebook, les leçons et le quiz.
4. Sélecteur de langue à l'inscription.
5. Page `/profil` (pseudo + langue) et lien dans l'en-tête.
