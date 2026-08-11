# Erreur « connexion non sécurisée » sur fonconnect.fr

## Ce que montrent les vérifications

- `fonconnect.fr` et `www.fonconnect.fr` pointent bien vers l'IP Lovable (185.158.133.1).
- Les deux certificats HTTPS existent et sont valides :
  - `fonconnect.fr` — émis aujourd'hui à 17h27 UTC (19h27 Paris), valide jusqu'au 9 novembre 2026
  - `www.fonconnect.fr` — émis aujourd'hui à 17h32 UTC
- Depuis l'extérieur, `https://fonconnect.fr` répond bien en 200, et `http://` redirige en 301 vers `https://`.

Conclusion : le certificat a été délivré il y a environ une heure seulement. `ERR_SSL_PROTOCOL_ERROR` correspond à une visite faite **avant** la fin de la génération du certificat ; Chrome mémorise ensuite l'échec (cache SSL/HSTS/QUIC), donc l'erreur persiste côté navigateur alors que le site est déjà correct.

## À faire côté utilisateur (aucun changement de code nécessaire)

1. Fermer complètement Chrome puis rouvrir `https://fonconnect.fr`.
2. Si l'erreur persiste : vider le cache SSL — `chrome://net-internals/#hsts` → « Delete domain security policies » → saisir `fonconnect.fr`, puis idem pour `www.fonconnect.fr`.
3. Tester en navigation privée et depuis une autre connexion (données mobiles) pour écarter un cache DNS/proxy local.
4. Sur mobile : vider le cache du navigateur ou redémarrer l'appareil.

## Vérification de suivi

Si, après ces étapes, l'erreur revient encore demain, je relancerai un contrôle TLS et proposerai un « Retry » de provisioning du domaine dans les réglages du projet.

## Détails techniques

- Émetteur : Google Trust Services (WE1), certificats séparés par nom d'hôte (SAN unique).
- Redirections en place : `www.fonconnect.fr` → `fonconnect.fr`, `fon-connect.lovable.app` → `fonconnect.fr`.
