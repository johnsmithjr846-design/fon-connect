# Leçons de fon — parcours structuré avec compte et progression

## Ce qu'on met en place

Un espace **Leçons** (`/lecons`) organisé en parcours progressif : plusieurs modules, chaque module contenant des leçons courtes (vocabulaire fon + français/anglais + phonétique + audio) et se terminant par un quiz.

La progression est enregistrée sur un compte utilisateur, donc on ajoute aussi l'authentification à FonConnect (elle n'existe pas encore).

## Contenu

Tu fournis le contenu des leçons. En attendant, on démarre avec **un module de démonstration** construit uniquement à partir des phrases déjà validées du Phrasebook (salutations et politesse) — aucun contenu inventé. Dès que tu envoies tes leçons (texte, Word, Excel, JSON…), on les intègre à la place ou en complément.

Format dans lequel m'envoyer chaque leçon :
- Titre du module et de la leçon
- Objectif en une phrase
- Liste d'items : fon / français / anglais / phonétique (optionnelle) / note culturelle (optionnelle)
- Questions de quiz : énoncé + bonne réponse + 2-3 mauvaises réponses

## Parcours utilisateur

1. `/lecons` — liste des modules avec barre de progression (X leçons terminées, quiz réussis).
2. `/lecons/$moduleId` — leçons du module, verrouillées tant que la précédente n'est pas terminée.
3. `/lecons/$moduleId/$leconId` — cartes de vocabulaire une par une, bouton audio (même moteur que le Phrasebook), bouton « Terminé ».
4. Quiz de fin de module — QCM, score affiché, badge de réussite à partir de 80 %.
5. Sans compte : les leçons sont consultables, mais un bandeau invite à se connecter pour sauvegarder la progression.

## Authentification

- Nouvelle page `/auth` : e-mail + mot de passe et connexion Google.
- Header : bouton « Se connecter » qui devient un menu compte (progression, déconnexion) une fois connecté.
- Page `/mot-de-passe-oublie` + `/reset-password` pour la réinitialisation.

Question ouverte : souhaites-tu un profil utilisateur (pseudo, avatar) ou juste l'e-mail ? Par défaut je crée une table `profiles` avec pseudo, ça sert aussi à afficher les badges.

## Détails techniques

- **Contenu** : `src/lib/lessons-data.ts` (typé : `LessonModule` > `Lesson` > `LessonItem` + `QuizQuestion`), servi statiquement — chargement instantané, fonctionne hors ligne.
- **Routes** : `src/routes/lecons.index.tsx`, `lecons.$moduleId.index.tsx`, `lecons.$moduleId.$lessonId.tsx`, chacune avec son `head()` SEO propre.
- **Backend (Lovable Cloud)** : migration créant
  - `profiles` (id → auth user, pseudo, créé le) + trigger de création auto au signup
  - `lesson_progress` (user_id, module_id, lesson_id, completed_at)
  - `quiz_results` (user_id, module_id, score, total, passed, created_at)
  - GRANTs + RLS scopées sur `auth.uid()` pour chaque table.
- **Lecture/écriture** : server functions dans `src/lib/lessons.functions.ts` avec `requireSupabaseAuth` ; appelées depuis les composants via `useServerFn` + TanStack Query (pas dans les loaders des routes publiques).
- **Auth** : page `/auth` avec `supabase.auth` (e-mail/mot de passe) et le broker Lovable pour Google ; provider Google configuré côté backend dans le même passage ; listener `onAuthStateChange` dans `__root.tsx`.
- **Audio** : réutilisation de `useSpeech` et `SpeakButton` existants.
- **Accueil** : la carte « Leçons » devient cliquable vers `/lecons` ; ajout d'un lien « Leçons » dans le header.
