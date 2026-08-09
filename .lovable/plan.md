# Leçons FonConnect — expérience type Duolingo

Objectif : transformer la section Leçons (aujourd'hui 1 module de démo, 3 leçons) en un parcours complet de 81 leçons réparties en 8 parcours, avec exercices variés, XP, séries, cœurs, coffres, badges et niveaux.

## 1. Contenu importé depuis vos documents

Le programme complet (`FonConnect — Programme Complet de Leçons`) est converti en données de l'application :

- 8 parcours : Les bases, Vie quotidienne, Marché et achats, Restaurant, Voyage, Urgences, Conversations IA, Professionnel.
- Pour chaque leçon : vocabulaire (fon / phonétique / français / anglais), dialogue bilingue quand il existe, note culturelle, durée estimée.
- Le corpus trilingue (219 entrées) enrichit le moteur de traduction hors ligne existant et sert de banque de distracteurs pour les QCM.
- Le manuel de grammaire (alphabet, tons, pronoms, négation) devient une page « Guide de grammaire » consultable et alimente le contexte de l'IA.

## 2. Déroulé d'une leçon (5–8 min)

Chaque leçon enchaîne des exercices générés à partir de son vocabulaire :

1. Découverte : cartes de vocabulaire avec audio (bouton écouter déjà en place).
2. QCM de traduction (3 propositions).
3. Remise dans l'ordre des mots d'une phrase fon.
4. Texte à trous (lettres manquantes).
5. Traduction libre FR/EN → fon (tolérance aux accents et à la casse).
6. Prononciation au micro : enregistrement, transcription, score de similarité.
7. Mini-conversation IA (3–5 échanges) avec l'assistant, limitée au vocabulaire de la leçon.

Barre de progression en haut, cœurs à droite, écran de fin « Leçon terminée » avec XP gagnés.

## 3. Gamification

- **XP** : 10 XP par leçon, bonus série (+10 % à +50 %), bonus sans faute.
- **Cœurs** : 5 cœurs, −1 par erreur, recharge progressive dans le temps ; à 0 cœur la leçon se rejoue.
- **Série quotidienne** : compteur de jours consécutifs, affiché dans l'en-tête.
- **Coffres bonus** : toutes les 5 leçons, 50–150 XP.
- **Niveaux** : 10 rangs, Débutant → Grand Maître, seuils d'XP.
- **Badges** : 15 badges thématiques (fin de parcours, série 7/30 jours, sans faute, premier dialogue IA, etc.).
- Page profil enrichie : XP total, niveau, série, badges obtenus, leçons terminées.

## 4. Navigation « chemin » Duolingo

- `/lecons` : liste des 8 parcours avec couleur, progression et verrouillage progressif.
- `/lecons/$parcours` : chemin vertical en zigzag, bulles de leçons (verrouillée / disponible / terminée / dorée), coffres intercalés, quiz de fin de parcours.
- Les leçons se déverrouillent l'une après l'autre ; le quiz de parcours s'ouvre une fois toutes les leçons terminées.
- Tout reste bilingue FR/EN via le système i18n déjà en place.

## 5. Détails techniques

- Script de conversion Markdown → `src/lib/lessons/content/*.ts` (données typées, une entrée par parcours), avec `src/lib/lessons/index.ts` pour les accès (`getPath`, `getLesson`, générateurs d'exercices).
- Générateurs d'exercices déterministes dans `src/lib/lessons/exercises.ts` (distracteurs issus du même parcours puis du corpus).
- Base de données (migration, avec GRANT + RLS par `auth.uid()`) :
  - `user_stats` : xp_total, niveau, série courante, meilleure série, dernier jour actif, cœurs, recharge.
  - `lesson_progress` : ajout de `path_id`, `xp_earned`, `best_accuracy`, `attempts`.
  - `user_badges` : badge_id, obtenu_le.
  - `chest_rewards` : coffres ouverts et XP octroyés.
- Serveur : `src/lib/lessons.functions.ts` étendu (`completeLesson` renvoie XP/série/badges gagnés, `consumeHeart`, `openChest`), calculs XP côté serveur uniquement.
- Prononciation : réutilise `/api/transcribe` + `useVoiceRecorder`, score par distance de Levenshtein normalisée.
- Mini-conversation IA : nouvel endpoint streaming réutilisant le gateway existant, prompt contraint au vocabulaire de la leçon.
- Composants UI : `LessonPath`, `LessonNode`, `HeartBar`, `StreakBadge`, `XpToast`, `ExerciseCard` + un composant par type d'exercice, `LessonComplete`, `BadgeGrid`.

## 6. Livraison en étapes

1. Import du contenu + modèle de données + migration.
2. Chemin de parcours et écran de leçon avec les 4 exercices écrits.
3. Micro (prononciation) et mini-conversation IA.
4. XP, cœurs, série, coffres, niveaux, badges + profil.
