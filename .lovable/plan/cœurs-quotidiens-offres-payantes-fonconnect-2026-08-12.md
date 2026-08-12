# Cœurs quotidiens + offres payantes FonConnect

## 1. Cœurs : 4 par jour, remis à zéro à minuit

Le système actuel donne 5 cœurs avec recharge progressive (1 cœur toutes les 20 min). Nouvelle règle, conforme au document :

- 4 cœurs par jour, pas de recharge dans la journée, pas de cumul.
- Réinitialisation à 4 chaque jour à 00:00 (heure de Paris).
- À 0 cœur : les nouvelles leçons sont bloquées, écran « Plus de cœurs » avec compte à rebours jusqu'à minuit + bouton « Passer à Leçons Pro ».
- Tolérance : une faute de frappe mineure ou un accent manquant ne retire pas de cœur (comparaison déjà normalisée pour la traduction libre ; on l'étend aux exercices concernés avec une tolérance d'une lettre sur les mots longs).
- Abonnés Leçons Pro / Pro Traduction+Leçons / GOLD : cœurs illimités, la barre de cœurs affiche ∞.

## 2. Catalogue des offres

Configuration centralisée unique (un seul fichier), reprise exacte du document :

| Offre | Prix | Durée | Leçons Pro | Traduction Premium | Cœurs |
|---|---|---|---|---|---|
| Gratuit | 0 € | — | limité | limité (30 min de vocal/jour) | 4/jour |
| Leçons Pro | 7,99 € | mensuel récurrent | oui | non | ∞ |
| Pro Traduction + Leçons Pro | 14,99 € | mensuel récurrent | oui | oui | ∞ |
| Traduc Voyage 1 | 4,99 € | 24 h, ponctuel | non | oui | — |
| Traduc Voyage 2 | 9,99 € | 7 jours, ponctuel | non | oui | — |
| Traduc Premium | 99,99 € | 1 an | non | oui | — |
| Premium GOLD | 19,99 € | mensuel récurrent | oui | oui | ∞ |
| Premium GOLD annuel | 149,99 € | annuel récurrent | oui | oui | ∞ |

Traduc Premium : au moment de l'achat, une case à cocher « Renouvellement automatique — Oui / Non » laisse le client choisir entre abonnement annuel reconduit et achat ponctuel d'un an.

## 3. Page Tarifs `/tarifs`

- Accroche « Apprenez. Traduisez. Communiquez. » et les phrases courtes du document.
- Deux groupes : Apprentissage / Traduction, plus GOLD mis en avant (« Tout FonConnect, sans limite »), bascule mensuel/annuel.
- Tableau comparatif complet, responsive (cartes empilées sur mobile).
- Avant paiement : nom de l'offre, prix TTC, durée, contenu, mention « renouvellement automatique » ou « achat ponctuel – aucune reconduction », lien vers CGV et politique de remboursement. Aucune option payante pré-cochée.
- Page bilingue FR/EN via le système i18n existant, couleurs Bénin, lien dans le header et dans l'accueil.

## 4. Paiement Stripe et gestion d'abonnement

- Paiement par Stripe (Checkout), abonnements et achats ponctuels.
- Après achat : page de confirmation avec l'offre active, sa date d'expiration et la prochaine échéance pour un abonnement.
- Page `/mon-abonnement` : offre en cours, statut, date de fin, activation/désactivation du renouvellement, accès au portail Stripe pour changer de carte ou résilier.

## 5. Droits d'accès (calculés côté serveur)

- États FREE / ACTIVE / EXPIRED / CANCELLED.
- Deux familles de droits : `lessons_pro` et `translation_premium`. Un utilisateur ayant plusieurs achats valides cumule les droits sans double comptage ; l'expiration retire l'accès automatiquement.
- Verrous appliqués : leçons au-delà du parcours gratuit, cœurs illimités, traduction vocale au-delà de 30 min/jour, temps réel, caméra, assistant IA premium — chaque blocage renvoie vers `/tarifs`.
- Jamais de décision de droits côté navigateur : le serveur fait foi.

## 6. Détails techniques

- `src/lib/billing/plans.ts` : source unique des offres (id, prix, devise, durée, récurrence, droits, libellés FR/EN). Plans : FREE, LESSONS_PRO_MONTHLY, PRO_TRANSLATION_LESSONS_MONTHLY, TRAVEL_24H, TRAVEL_7D, TRANSLATION_PREMIUM_YEARLY, GOLD_MONTHLY, GOLD_YEARLY.
- Migration base de données :
  - `subscriptions` (user_id, plan_id, provider, provider_ref, status, start_at, expires_at, auto_renew, cancel_at_period_end) — RLS lecture par `auth.uid()`, écriture réservée au serveur, GRANT explicites.
  - `usage_daily` (user_id, day, voice_seconds) pour la limite gratuite de 30 min de vocal.
  - `user_stats` : cœurs ramenés à 4, colonne `hearts_day` (date) remplaçant la recharge par minuterie ; `hearts_updated_at` conservée.
- `src/lib/lessons/stats.ts` : `refillHearts` remplacé par `resetHeartsIfNewDay` (fuseau Europe/Paris) ; `MAX_HEARTS = 4` ; `HEART_REFILL_MINUTES` supprimé.
- `src/lib/entitlements.functions.ts` : `getEntitlements()` (serveur, agrège les achats valides) ; hook `useEntitlements` côté client pour l'affichage seul.
- `src/lib/billing.functions.ts` : `createCheckout(planId, autoRenew)`, `getSubscription()`, `openBillingPortal()`.
- `src/routes/api/public/stripe-webhook.ts` : vérification de signature, mise à jour de `subscriptions` sur les événements de paiement, renouvellement, annulation et remboursement.
- Routes nouvelles : `src/routes/tarifs.tsx`, `src/routes/mon-abonnement.tsx`, `src/routes/paiement.succes.tsx`, chacune avec son `head()` SEO.
- `completeLesson` / `loseHeart` vérifient les droits côté serveur : cœur ignoré si `lessons_pro` actif.
- Composants : `PricingCard`, `PricingTable`, `UpgradeDialog`, `HeartsEmptyState`, barre de cœurs mise à jour (∞ pour les abonnés).

## 7. Ordre de livraison

1. Cœurs 4/jour + réinitialisation à minuit + tolérance aux fautes mineures.
2. Catalogue centralisé + page `/tarifs` + tableau comparatif.
3. Migration droits/abonnements + calcul serveur des accès + verrous.
4. Stripe (checkout, webhook, confirmation) + `/mon-abonnement`.
