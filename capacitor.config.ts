import type { CapacitorConfig } from "@capacitor/cli";

// FonConnect est une app TanStack Start en SSR (auth, API, webhooks Stripe côté
// serveur) — pas un SPA statique. On ne peut donc pas faire un export statique
// dans webDir comme pour une app 100% front. À la place, Capacitor charge le
// site en production dans une WebView native : contrairement à AppGeyser,
// Capacitor implémente correctement le pont de permissions (micro, caméra)
// entre la WebView et l'OS, donc getUserMedia() fonctionne enfin.
const config: CapacitorConfig = {
  appId: "fr.fonconnect.app",
  appName: "FonConnect",
  webDir: "dist", // requis par le CLI mais non utilisé en mode server.url
  server: {
    url: "https://fonconnect.fr",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
