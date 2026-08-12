/**
 * Source unique des offres FonConnect (prix, durées, droits, libellés).
 * Toute évolution tarifaire se fait ici et nulle part ailleurs.
 */

export type PlanId =
  | "FREE"
  | "LESSONS_PRO_MONTHLY"
  | "PRO_TRANSLATION_LESSONS_MONTHLY"
  | "TRAVEL_24H"
  | "TRAVEL_7D"
  | "TRANSLATION_PREMIUM_YEARLY"
  | "GOLD_MONTHLY"
  | "GOLD_YEARLY";

export type PlanFamily = "learning" | "translation" | "gold" | "free";

export type Plan = {
  id: PlanId;
  family: PlanFamily;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  /** Prix TTC en centimes d'euro. */
  priceCents: number;
  currency: "EUR";
  /** "month" | "year" pour les abonnements, "once" pour les passes. */
  interval: "month" | "year" | "once";
  /** Durée en heures pour les achats ponctuels. */
  durationHours?: number;
  recurring: boolean;
  /** Le client peut choisir oui/non pour le renouvellement automatique. */
  renewalOptional?: boolean;
  entitlements: { lessonsPro: boolean; translationPremium: boolean };
  unlimitedHearts: boolean;
  features: string[];
  featuresEn: string[];
  highlight?: boolean;
};

export const CURRENCY_SYMBOL = "€";

/** Limite de traduction vocale de l'offre gratuite : 30 minutes par jour. */
export const FREE_VOICE_SECONDS_PER_DAY = 30 * 60;

export const PLANS: Plan[] = [
  {
    id: "FREE",
    family: "free",
    name: "Gratuit",
    nameEn: "Free",
    tagline: "Découvrez FonConnect sans payer.",
    taglineEn: "Discover FonConnect for free.",
    priceCents: 0,
    currency: "EUR",
    interval: "once",
    recurring: false,
    entitlements: { lessonsPro: false, translationPremium: false },
    unlimitedHearts: false,
    features: [
      "Parcours de leçons gratuit",
      "4 cœurs par jour, réinitialisés à minuit",
      "30 min de traduction vocale par jour",
      "Phrasebook et traduction texte de base",
    ],
    featuresEn: [
      "Free lesson path",
      "4 hearts a day, reset at midnight",
      "30 min of voice translation a day",
      "Phrasebook and basic text translation",
    ],
  },
  {
    id: "LESSONS_PRO_MONTHLY",
    family: "learning",
    name: "Leçons Pro",
    nameEn: "Lessons Pro",
    tagline: "Apprenez le fon sans limite.",
    taglineEn: "Learn Fon without limits.",
    priceCents: 799,
    currency: "EUR",
    interval: "month",
    recurring: true,
    entitlements: { lessonsPro: true, translationPremium: false },
    unlimitedHearts: true,
    features: [
      "Toutes les leçons disponibles",
      "Cœurs illimités",
      "Vocabulaire, compréhension, phrases à remettre en ordre, textes à trous",
      "Écoute, répétition, prononciation au micro",
      "Mini-conversations IA d'apprentissage",
      "XP, badges, séries et statistiques",
      "Futurs contenus d'apprentissage inclus",
    ],
    featuresEn: [
      "All available lessons",
      "Unlimited hearts",
      "Vocabulary, comprehension, word ordering, fill-in-the-blanks",
      "Listening, repetition, microphone pronunciation",
      "AI mini-conversations for learning",
      "XP, badges, streaks and statistics",
      "Future learning content included",
    ],
  },
  {
    id: "PRO_TRANSLATION_LESSONS_MONTHLY",
    family: "learning",
    name: "Pro Traduction + Leçons Pro",
    nameEn: "Pro Translation + Lessons Pro",
    tagline: "Apprenez et traduisez au quotidien.",
    taglineEn: "Learn and translate every day.",
    priceCents: 1499,
    currency: "EUR",
    interval: "month",
    recurring: true,
    entitlements: { lessonsPro: true, translationPremium: true },
    unlimitedHearts: true,
    highlight: true,
    features: [
      "Tout Leçons Pro",
      "Traduction texte et vocale illimitée",
      "Conversation et traduction en temps réel",
      "Lecture audio des traductions et reconnaissance vocale",
      "Traduction par caméra (si disponible)",
      "Assistant IA",
    ],
    featuresEn: [
      "Everything in Lessons Pro",
      "Unlimited text and voice translation",
      "Real-time conversation and translation",
      "Audio playback and speech recognition",
      "Camera translation (where available)",
      "AI assistant",
    ],
  },
  {
    id: "TRAVEL_24H",
    family: "translation",
    name: "Traduc Voyage 1",
    nameEn: "Travel Pass 1",
    tagline: "La traduction pendant 24 heures.",
    taglineEn: "Translation for 24 hours.",
    priceCents: 499,
    currency: "EUR",
    interval: "once",
    durationHours: 24,
    recurring: false,
    entitlements: { lessonsPro: false, translationPremium: true },
    unlimitedHearts: false,
    features: [
      "24 heures d'accès à compter de l'activation",
      "Traduction texte, vocale et conversationnelle",
      "Lecture audio et reconnaissance vocale",
      "Assistant IA de traduction, caméra si disponible",
      "Achat ponctuel — aucune reconduction automatique",
    ],
    featuresEn: [
      "24 hours of access from activation",
      "Text, voice and conversation translation",
      "Audio playback and speech recognition",
      "AI translation assistant, camera where available",
      "One-off purchase — no automatic renewal",
    ],
  },
  {
    id: "TRAVEL_7D",
    family: "translation",
    name: "Traduc Voyage 2",
    nameEn: "Travel Pass 2",
    tagline: "La traduction pendant 7 jours.",
    taglineEn: "Translation for 7 days.",
    priceCents: 999,
    currency: "EUR",
    interval: "once",
    durationHours: 24 * 7,
    recurring: false,
    entitlements: { lessonsPro: false, translationPremium: true },
    unlimitedHearts: false,
    features: [
      "7 jours d'accès à compter de l'activation",
      "Même périmètre que Traduc Voyage 1",
      "Achat ponctuel — aucune reconduction automatique",
    ],
    featuresEn: [
      "7 days of access from activation",
      "Same scope as Travel Pass 1",
      "One-off purchase — no automatic renewal",
    ],
  },
  {
    id: "TRANSLATION_PREMIUM_YEARLY",
    family: "translation",
    name: "Traduc Premium",
    nameEn: "Translation Premium",
    tagline: "La traduction Premium pendant un an.",
    taglineEn: "Premium translation for a year.",
    priceCents: 9999,
    currency: "EUR",
    interval: "year",
    recurring: true,
    renewalOptional: true,
    entitlements: { lessonsPro: false, translationPremium: true },
    unlimitedHearts: false,
    features: [
      "Un an de traduction Premium",
      "Traduction texte, vocale et en temps réel",
      "Reconnaissance et synthèse vocales",
      "Traduction caméra si disponible, assistant IA",
      "Renouvellement automatique au choix (oui / non)",
    ],
    featuresEn: [
      "One year of Premium translation",
      "Text, voice and real-time translation",
      "Speech recognition and synthesis",
      "Camera translation where available, AI assistant",
      "Automatic renewal is your choice (yes / no)",
    ],
  },
  {
    id: "GOLD_MONTHLY",
    family: "gold",
    name: "Premium GOLD",
    nameEn: "Premium GOLD",
    tagline: "Tout FonConnect, sans limite.",
    taglineEn: "All of FonConnect, without limits.",
    priceCents: 1999,
    currency: "EUR",
    interval: "month",
    recurring: true,
    highlight: true,
    entitlements: { lessonsPro: true, translationPremium: true },
    unlimitedHearts: true,
    features: [
      "Tout Leçons Pro et tout Pro Traduction",
      "Cœurs illimités, toutes les leçons",
      "Prononciation, exercices vocaux, conversations IA",
      "Traduction texte, vocale, temps réel, caméra si disponible",
      "XP, badges, séries, statistiques",
      "Fonctionnalités Premium futures incluses",
    ],
    featuresEn: [
      "Everything in Lessons Pro and Pro Translation",
      "Unlimited hearts, all lessons",
      "Pronunciation, voice exercises, AI conversations",
      "Text, voice, real-time and camera translation where available",
      "XP, badges, streaks, statistics",
      "Future Premium features included",
    ],
  },
  {
    id: "GOLD_YEARLY",
    family: "gold",
    name: "Premium GOLD annuel",
    nameEn: "Premium GOLD yearly",
    tagline: "Tout FonConnect, à l'année.",
    taglineEn: "All of FonConnect, yearly.",
    priceCents: 14999,
    currency: "EUR",
    interval: "year",
    recurring: true,
    entitlements: { lessonsPro: true, translationPremium: true },
    unlimitedHearts: true,
    features: [
      "Contenu identique à Premium GOLD",
      "Paiement annuel, deux mois offerts environ",
      "Cœurs illimités et toutes les fonctions Premium",
    ],
    featuresEn: [
      "Same content as Premium GOLD",
      "Yearly payment, roughly two months free",
      "Unlimited hearts and all Premium features",
    ],
  },
];

export const PAID_PLANS = PLANS.filter((p) => p.id !== "FREE");

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPrice(cents: number, lang: "fr" | "en" = "fr"): string {
  return new Intl.NumberFormat(lang === "en" ? "en-IE" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function planDuration(plan: Plan, lang: "fr" | "en" = "fr"): string {
  if (plan.interval === "month") return lang === "en" ? "per month" : "par mois";
  if (plan.interval === "year") return lang === "en" ? "per year" : "par an";
  if (plan.durationHours === 24) return lang === "en" ? "for 24 hours" : "pendant 24 h";
  if (plan.durationHours) {
    const days = Math.round(plan.durationHours / 24);
    return lang === "en" ? `for ${days} days` : `pendant ${days} jours`;
  }
  return "";
}

/** Date d'expiration d'un achat ponctuel, à partir de son activation. */
export function expiresAtFor(plan: Plan, from: Date = new Date()): Date | null {
  if (plan.durationHours) return new Date(from.getTime() + plan.durationHours * 3_600_000);
  if (plan.interval === "month") {
    const d = new Date(from);
    d.setMonth(d.getMonth() + 1);
    return d;
  }
  if (plan.interval === "year") {
    const d = new Date(from);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  return null;
}
