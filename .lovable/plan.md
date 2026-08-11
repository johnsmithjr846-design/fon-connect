# Consignes audio, téléchargement de l'app, espace admin & leçons illustrées

## 1. Consignes de leçon lues à voix haute

- Chaque consigne d'exercice (« Traduis en fon », « Remets dans l'ordre », …) reçoit un bouton d'écoute et est lue dans la langue d'interface (FR ou EN).
- Lecture automatique optionnelle : un petit interrupteur « Consignes audio » dans le bandeau de leçon, mémorisé dans le navigateur. Quand il est actif, la consigne (et l'énoncé associé) est lue dès l'affichage de l'exercice, sans clic.
- Le mot fon garde son propre bouton d'écoute déjà existant ; rien n'est lu deux fois en même temps.

## 2. Section « Télécharger l'application »

- Nouvelle page publique `/telecharger` + bloc d'appel sur l'accueil.
- Deux cartes distinctes : **Android** (APK / lien Play Store, taille, version, date, notes de version) et **iOS** (lien App Store / TestFlight, ou message « bientôt disponible » si rien n'est publié).
- Le contenu vient de la base : les administrateurs téléversent l'APK ou saisissent un lien, et la page se met à jour seule.
- Rappel discret que le site reste utilisable directement dans le navigateur (PWA « Ajouter à l'écran d'accueil »).

## 3. Espace administrateur (style « terminal / hacking »)

Accès : un lien très discret tout en bas, dans la barre des mentions légales (`·` / « Admin »), vers `/admin`.

Sécurité en deux couches :
1. Compte utilisateur avec rôle `admin` en base (pas de rôle stocké côté navigateur).
2. Un code d'accès supplémentaire propre à la section, que les admins peuvent définir et modifier depuis l'espace lui-même (stocké haché, vérifié côté serveur, déverrouillage valable pour la session).

Fonctions de l'espace :
- **Tableau de bord** : nombre de visiteurs, d'inscrits, de leçons terminées, XP distribué ; graphiques (visites par jour, inscriptions par jour, répartition par langue, top parcours).
- **Utilisateurs** : liste des inscrits (e-mail, pseudo, langue, date d'inscription, dernière activité, XP, série), recherche et export CSV.
- **Téléchargements** : téléverser un APK, saisir les liens Android/iOS, version, notes ; activer/désactiver l'affichage de chaque plateforme.
- **Contenu du site** : e-mail de contact affiché dans la barre des politiques, nom de la société, bandeau d'annonce en haut du site, texte du bloc téléchargement.
- **Publicités** : créer des encarts (image ou texte, lien, emplacement : accueil / leçons / traducteur, période d'affichage, actif ou non). Les encarts actifs s'affichent sur les pages choisies.
- **Sécurité** : gérer le code d'accès, promouvoir un autre compte au rôle admin.

Style visuel dédié : thème sombre « terminal » propre à l'espace admin (vert phosphore et cyan sur noir, police mono, effet scanline discret, entêtes façon invite de commande), sans toucher au thème Bénin du site public.

## 4. Leçons illustrées

- Illustration de couverture par parcours (8 visuels générés, style africain contemporain aux couleurs du Bénin) affichée sur `/lecons` et en tête de chaque parcours.
- Vignettes/pictogrammes thématiques sur les nœuds du chemin en zigzag et l'écran de fin de leçon.
- Illustration d'ambiance sur les cartes de vocabulaire « découverte » quand le thème s'y prête, avec textes alternatifs pour l'accessibilité.

## Détails techniques

- **Base de données** : `user_roles` + fonction `has_role` (rôle jamais stocké sur `profiles`) ; `site_settings` (clé/valeur), `app_releases`, `ads`, `page_views` (agrégat anonyme : chemin, jour, compteur). RLS : lecture publique limitée aux réglages/annonces/versions publiés, écriture réservée aux admins ; `page_views` insérable par tous mais lisible par les admins seulement.
- **Statistiques** : enregistrement anonyme des vues de page (pas d'IP, pas de traceur tiers) via une fonction serveur ; graphiques avec Recharts.
- **Fichiers APK** : bucket de stockage dédié, lecture publique, écriture admin.
- **Serveur** : `src/lib/admin.functions.ts` (fonctions protégées, vérification du rôle puis du code d'accès), `src/lib/public-site.functions.ts` (réglages/annonces/versions pour les pages publiques, lecture anonyme).
- **Audio** : réutilisation de `useSpeech` ; un identifiant de lecture par consigne pour éviter les lectures concurrentes.
- **Images** : générées et importées comme assets locaux, en `loading="lazy"`, avec dimensions fixes pour éviter les décalages.

## Hors périmètre

Compilation réelle de l'APK/IPA (les fichiers doivent être fournis par vous), régie publicitaire externe, suivi analytique individuel des visiteurs.
