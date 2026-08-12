# Cœurs quotidiens + offres payantes

## 1. Cœurs : 4 par jour

- Maximum de cœurs : **4** (au lieu de 5).
- Recharge : **remise à 4 au début de chaque nouvelle journée** (jour UTC), au lieu de la recharge « 1 cœur toutes les 20 minutes ».
- Affichage : la barre de statistiques et le HUD de leçon montrent 4 cœurs, avec la mention « recharge demain » quand il n'en reste plus.
- Les abonnés payants ont des **cœurs illimités** (voir offres).

## 2. Offres payantes

Quatre offres (prix modifiables ensuite dans l'admin) :

| Offre | Prix | Durée |
|---|---|---|
| Gratuit | 0 € | — |
| Pass 24 h | 2,99 € | 1 jour |
| Pass 7 jours | 6,99 € | 7 jours |
| Premium mensuel | 9,99 € | mensuel (abonnement) |
| Premium annuel | 79,99 € | annuel (abonnement) |

Ce que débloque une offre payante :
- Cœurs illimités dans les leçons.
- Traductions et messages IA illimités (le gratuit reste limité : 20 traductions et 20 messages IA par jour).
- Mode vocal (dictée + lecture audio) illimité.
- Accès complet au phrasebook Touriste/Urgence hors ligne.
- Pas de publicités.

Pages et parcours :
- Nouvelle page `/offres` : comparatif des offres, bouton d'achat, état de l'abonnement en cours.
- Bandeau « Passer à Premium » quand une limite gratuite est atteinte (traducteur, assistant, leçons sans cœurs).
- Section « Mon abonnement » dans le profil (offre active, date de fin, gestion).
- Panneau admin : liste des abonnements actifs et statistiques de revenus.

## 3. Paiement

Le fournisseur recommandé pour ce type de produit est **Paddle** (marchand de référence : il gère la TVA et la facturation à ta place, idéal pour une vente internationale). Je l'activerai lors de la mise en œuvre ; il faudra remplir un court formulaire de compte (email, nom, société).

## 4. Détails techniques

- `src/lib/lessons/index.ts` : `MAX_HEARTS = 4`, suppression de `HEART_REFILL_MINUTES` au profit d'une recharge journalière.
- `src/lib/lessons/stats.ts` : `refillHearts` remplacé par `refillDaily` — si `hearts_updated_at` est antérieur au jour courant, les cœurs repassent à 4 ; premium = cœurs non décrémentés.
- `src/lib/lessons.functions.ts` : `loseHeart` ignore la perte pour un utilisateur premium ; utilise la nouvelle logique de recharge.
- Migration base de données :
  - `subscription_plans` (clé, libellés FR/EN, prix, durée, actif) — lecture publique `anon`.
  - `user_subscriptions` (user_id, plan, statut, période, identifiants du fournisseur de paiement) — RLS sur `auth.uid()`, écriture réservée au `service_role`.
  - `usage_counters` (user_id, jour, traductions, messages IA) pour les quotas gratuits.
  - GRANT explicites sur chaque nouvelle table.
- `src/lib/billing.functions.ts` : `getMySubscription`, `createCheckout` (Paddle), quota check côté serveur.
- Route webhook `src/routes/api/public/paddle-webhook.ts` : vérification de signature puis activation/expiration de l'abonnement via `service_role`.
- Contrôle des quotas côté serveur dans `translate.functions.ts` et `api/chat.ts` (jamais côté client).
- Textes FR/EN ajoutés à `src/lib/i18n/dictionary.ts`.

## 5. Ordre de livraison

1. Cœurs 4/jour (rapide, visible immédiatement).
2. Modèle de données abonnements + quotas + page `/offres`.
3. Activation Paddle, checkout et webhook.
4. Gating (cœurs illimités, quotas, pubs) + admin et profil.
