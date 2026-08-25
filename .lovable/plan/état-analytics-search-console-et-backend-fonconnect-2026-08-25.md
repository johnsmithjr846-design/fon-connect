# État analytics, Search Console et backend — FonConnect

## Résumé de l’état actuel

- **Backend** : le site repose sur **Supabase via Lovable Cloud** (pas Firebase). Toutes les tables, auth, paiements et stockage passent par Supabase.
- **GA4** : **non installé**. Aucun script gtag.js, aucune variable d’environnement GA4, aucun connecteur Google Analytics lié.
- **Google Search Console** :
  - La balise META `google-site-verification` est déjà présente dans `src/routes/__root.tsx`.
  - Le connecteur Google Search Console est lié au projet.
  - Cependant, le diagnostic indique qu’**aucune propriété vérifiée ne couvre l’URL publiée** `https://fonconnect.fr`. La vérification n’est donc pas finalisée côté Google.

## Prochaines étapes proposées

1. **Installer Google Analytics 4**
   - Connecter le connecteur Google Analytics via Lovable.
   - Injecter le script gtag.js une seule fois au démarrage (`src/main.tsx` ou `src/lib/analytics.ts`).
   - Envoyer un `page_view` à chaque changement de route SPA.
   - Conserver la mesure simple (visites) sans tracking avancé sauf demande contraire.

2. **Finaliser Google Search Console**
   - Republier le site pour que Google détecte la balise META déjà en place.
   - Vérifier la propriété `https://fonconnect.fr` dans Search Console.
   - Soumettre le sitemap dynamique (`/sitemap.xml`) une fois la propriété vérifiée.

3. **Documenter le backend dans la mémoire projet**
   - Enregistrer que le backend du site web est Supabase/Lovable Cloud (distinct de l’app mobile Flutter/Firebase mentionnée dans le README).

## Résultat attendu

- GA4 actif et capable de suivre les visites sur toutes les pages.
- Search Console vérifié pour `https://fonconnect.fr` avec sitemap soumis.
- Clarté sur le backend utilisé par le site web.
