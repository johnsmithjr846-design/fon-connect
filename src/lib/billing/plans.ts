/**
 * Source unique des offres FonConnect (prix, durées, droits, libellés).
 * Toute évolution tarifaire se fait ici et nulle part ailleurs.
 *
 * Rédaction des descriptifs : chaque offre expose un bénéfice concret
 * (ce que le client gagne), un repère de comparaison (ancrage) et un
 * rappel de ce qu'il évite de perdre. Les listes commencent par le
 * résultat obtenu, jamais par la fonction technique.
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
  /** Bénéfice principal, formulé du point de vue du client. */
  benefit: string;
  benefitEn: string;
  /** Repère de comparaison concret (ancrage) affiché sous le prix. */
  anchor: string;
  anchorEn: string;
  /** Ce que le client évite de perdre en choisissant cette offre. */
  loss: string;
  lossEn: string;
  /** Pour qui l'offre est faite (effet de reconnaissance immédiate). */
  bestFor: string;
  bestForEn: string;
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
  entitlements: { lessonsPro: boolean; translationPremium: boolean; arNavigation: boolean };
  unlimitedHearts: boolean;
  features: string[];
  featuresEn: string[];
  highlight?: boolean;
};

export const CURRENCY_SYMBOL = "€";

/** Limite de traduction vocale de l'offre gratuite : 30 minutes par jour. */
export const FREE_VOICE_SECONDS_PER_DAY = 30 * 60;

/** TVA française applicable aux services numériques. */
export const VAT_RATE = 0.2;

export const PLANS: Plan[] = [
  {
    id: "FREE",
    family: "free",
    name: "Gratuit",
    nameEn: "Free",
    tagline: "Prononcez vos premiers mots en fon aujourd'hui.",
    taglineEn: "Say your first words in Fon today.",
    benefit:
      "Vous commencez maintenant, sans carte bancaire : une leçon de 3 minutes suffit pour retenir vos dix premiers mots et vérifier que la méthode fonctionne pour vous.",
    benefitEn:
      "Start right now, no card needed: a 3-minute lesson is enough to remember your first ten words and see for yourself that the method works.",
    anchor: "0 € — vous ne risquez rien, vous testez avant de décider.",
    anchorEn: "€0 — nothing to risk, try before you decide.",
    loss: "Sans compte, votre progression et votre série de jours ne sont pas sauvegardées.",
    lossEn: "Without an account, your progress and day streak are not saved.",
    bestFor: "Pour découvrir le fon et se faire son propre avis.",
    bestForEn: "For discovering Fon and making up your own mind.",
    priceCents: 0,
    currency: "EUR",
    interval: "once",
    recurring: false,
    entitlements: { lessonsPro: false, translationPremium: false, arNavigation: false },
    unlimitedHearts: false,
    features: [
      "Vos dix premiers mots dès la première session de 3 minutes",
      "4 cœurs par jour : l'erreur reste possible, la reprise est immédiate à minuit",
      "30 min de traduction vocale par jour pour vos échanges courts",
      "Le phrasebook de survie : saluer, remercier, demander son chemin",
      "Votre série de jours démarre dès la première leçon terminée",
    ],
    featuresEn: [
      "Your first ten words in a single 3-minute session",
      "4 hearts a day: mistakes are allowed, everything resets at midnight",
      "30 min of voice translation a day for short exchanges",
      "The survival phrasebook: greet, thank, ask for directions",
      "Your day streak starts with your very first finished lesson",
    ],
  },
  {
    id: "LESSONS_PRO_MONTHLY",
    family: "learning",
    name: "Leçons Pro",
    nameEn: "Lessons Pro",
    tagline: "Ne perdez plus jamais votre élan à cause des cœurs.",
    taglineEn: "Never lose your momentum to empty hearts again.",
    benefit:
      "L'apprentissage tient à la régularité, pas à la durée : avec les cœurs illimités, vous enchaînez les leçons le jour où vous êtes motivé au lieu d'attendre demain. C'est cette continuité qui ancre le vocabulaire durablement.",
    benefitEn:
      "Learning is built on regularity, not on long sessions: with unlimited hearts you keep going on the day you feel motivated instead of waiting for tomorrow. That continuity is what makes vocabulary stick.",
    anchor: "Moins de 0,27 € par jour, le prix d'un café partagé par mois.",
    anchorEn: "Under €0.27 a day — less than one coffee a month.",
    loss: "En gratuit, 4 erreurs suffisent à interrompre une session lancée : la série se casse et l'habitude avec elle.",
    lossEn: "On the free plan, 4 mistakes end a session in progress: the streak breaks, and the habit with it.",
    bestFor: "Pour qui veut vraiment parler fon, pas seulement l'essayer.",
    bestForEn: "For those who truly want to speak Fon, not just try it.",
    priceCents: 799,
    currency: "EUR",
    interval: "month",
    recurring: true,
    entitlements: { lessonsPro: true, translationPremium: false, arNavigation: false },
    unlimitedHearts: true,
    features: [
      "Cœurs illimités : vous apprenez tant que l'envie est là",
      "Les 81 leçons des 8 parcours ouvertes immédiatement",
      "Vocabulaire, compréhension, phrases à remettre en ordre, textes à trous : la mémoire est sollicitée sous plusieurs angles, c'est ce qui la fixe",
      "Correction de votre prononciation au micro, sans peur de vous tromper devant quelqu'un",
      "Mini-conversations avec l'IA : vous parlez dès la première semaine",
      "XP, badges et série de jours : chaque session laisse une trace visible",
      "Les nouveaux contenus arrivent inclus, sans supplément",
    ],
    featuresEn: [
      "Unlimited hearts: keep learning as long as the drive is there",
      "All 81 lessons across the 8 paths unlocked right away",
      "Vocabulary, comprehension, word ordering, fill-in-the-blanks: memory is challenged from several angles, which is what makes it hold",
      "Microphone pronunciation feedback, with no fear of getting it wrong in front of someone",
      "AI mini-conversations: you speak from the very first week",
      "XP, badges and day streak: every session leaves a visible mark",
      "New content is included as it ships, at no extra cost",
    ],
  },
  {
    id: "PRO_TRANSLATION_LESSONS_MONTHLY",
    family: "learning",
    name: "Pro Traduction + Leçons Pro",
    nameEn: "Pro Translation + Lessons Pro",
    tagline: "Apprenez le matin, faites-vous comprendre l'après-midi.",
    taglineEn: "Learn in the morning, be understood in the afternoon.",
    benefit:
      "Ce que vous apprenez en leçon, vous le réutilisez le jour même dans une vraie conversation traduite. Ce va-et-vient entre apprentissage et usage réel est la façon la plus rapide de passer de « je comprends » à « je parle ».",
    benefitEn:
      "What you learn in a lesson, you reuse the same day in a real translated conversation. That back-and-forth between study and real use is the fastest way to move from “I understand” to “I speak”.",
    anchor: "14,99 € les deux offres, contre 12,98 € pour Leçons Pro seul + un pass 7 jours.",
    anchorEn: "€14.99 for both, versus €12.98 for Lessons Pro alone plus one 7-day pass.",
    loss: "Séparément, la traduction s'arrête au bout de 30 min par jour, souvent en plein milieu d'un échange.",
    lossEn: "Separately, translation stops after 30 min a day — usually in the middle of a conversation.",
    bestFor: "Pour la diaspora et les professionnels en contact régulier avec le Bénin.",
    bestForEn: "For the diaspora and professionals in regular contact with Benin.",
    priceCents: 1499,
    currency: "EUR",
    interval: "month",
    recurring: true,
    entitlements: { lessonsPro: true, translationPremium: true, arNavigation: true },
    unlimitedHearts: true,
    highlight: true,
    features: [
      "Tout Leçons Pro, cœurs illimités compris",
      "Traduction texte et vocale sans compteur : plus d'échange coupé en cours de route",
      "Conversation en temps réel : chacun parle sa langue, personne n'attend",
      "Les traductions se lisent à voix haute — vous entendez le ton juste avant de le reproduire",
      "Traduction par caméra (si disponible) pour les panneaux et les menus",
      "Assistant IA disponible à toute heure, y compris avec le décalage horaire",
    ],
    featuresEn: [
      "Everything in Lessons Pro, unlimited hearts included",
      "Text and voice translation with no counter: no conversation cut short",
      "Real-time conversation: everyone speaks their own language, nobody waits",
      "Translations are read aloud — you hear the right tone before repeating it",
      "Camera translation (where available) for signs and menus",
      "AI assistant available at any hour, time difference included",
    ],
  },
  {
    id: "TRAVEL_24H",
    family: "translation",
    name: "Traduc Voyage 1",
    nameEn: "Travel Pass 1",
    tagline: "24 heures où la langue cesse d'être un problème.",
    taglineEn: "24 hours where language stops being a problem.",
    benefit:
      "Pour une journée décisive — arrivée à Cotonou, marché de Dantokpa, rendez-vous familial — vous êtes compris et vous comprenez, sans compteur qui s'arrête au mauvais moment.",
    benefitEn:
      "For one decisive day — landing in Cotonou, Dantokpa market, a family visit — you understand and are understood, with no counter running out at the worst moment.",
    anchor: "4,99 € : moins qu'un taxi raté faute de s'être fait comprendre.",
    anchorEn: "€4.99: less than one taxi ride lost to a misunderstanding.",
    loss: "Sans pass, la traduction vocale s'arrête après 30 min — souvent avant midi.",
    lossEn: "Without the pass, voice translation stops after 30 min — usually before noon.",
    bestFor: "Pour une escale, un rendez-vous ou une journée précise.",
    bestForEn: "For a stopover, an appointment or one specific day.",
    priceCents: 499,
    currency: "EUR",
    interval: "once",
    durationHours: 24,
    recurring: false,
    entitlements: { lessonsPro: false, translationPremium: true, arNavigation: true },
    unlimitedHearts: false,
    features: [
      "24 heures pleines, décomptées à partir de votre activation, pas de l'achat",
      "Traduction texte, vocale et conversation à deux, sans limite pendant la journée",
      "Lecture audio et reconnaissance vocale : vous parlez, l'application répond en fon",
      "Assistant IA de traduction, caméra si disponible",
      "Achat ponctuel : rien ne se reconduit, rien à résilier",
    ],
    featuresEn: [
      "A full 24 hours, counted from your activation, not from the purchase",
      "Text, voice and two-way conversation translation, unlimited for the day",
      "Audio playback and speech recognition: you speak, the app answers in Fon",
      "AI translation assistant, camera where available",
      "One-off purchase: nothing renews, nothing to cancel",
    ],
  },
  {
    id: "TRAVEL_7D",
    family: "translation",
    name: "Traduc Voyage 2",
    nameEn: "Travel Pass 2",
    tagline: "Une semaine entière sans barrière de langue.",
    taglineEn: "A whole week with no language barrier.",
    benefit:
      "Le temps d'un séjour complet, vous négociez, demandez, plaisantez et remerciez en fon. Au bout de quelques jours, vous reconnaissez les phrases avant même la traduction : c'est là que le voyage change de nature.",
    benefitEn:
      "For a full trip, you negotiate, ask, joke and thank in Fon. After a few days you recognise phrases before the translation appears — that is when the trip changes character.",
    anchor: "9,99 € les 7 jours, soit 1,43 € par jour : deux fois moins cher que sept pass 24 h.",
    anchorEn: "€9.99 for 7 days — €1.43 a day, half the price of seven 24-hour passes.",
    loss: "Repartir sans avoir échangé autrement que par gestes est le regret le plus fréquent des visiteurs.",
    lossEn: "Leaving with nothing but hand gestures is the regret visitors mention most.",
    bestFor: "Pour un séjour, une mission ou des retrouvailles familiales.",
    bestForEn: "For a trip, a work mission or a family reunion.",
    priceCents: 999,
    currency: "EUR",
    interval: "once",
    durationHours: 24 * 7,
    recurring: false,
    entitlements: { lessonsPro: false, translationPremium: true, arNavigation: true },
    unlimitedHearts: false,
    features: [
      "7 jours pleins à partir de votre activation",
      "Traduction texte, vocale, conversation et caméra si disponible, sans compteur",
      "1,43 € par jour au lieu de 4,99 € avec des pass journaliers",
      "Assistant IA de traduction disponible jour et nuit",
      "Achat ponctuel : rien ne se reconduit, rien à résilier",
    ],
    featuresEn: [
      "A full 7 days from your activation",
      "Text, voice, conversation and camera translation where available, with no counter",
      "€1.43 a day instead of €4.99 with daily passes",
      "AI translation assistant available day and night",
      "One-off purchase: nothing renews, nothing to cancel",
    ],
  },
  {
    id: "TRANSLATION_PREMIUM_YEARLY",
    family: "translation",
    name: "Traduc Premium",
    nameEn: "Translation Premium",
    tagline: "Un an de traduction, payé une seule fois.",
    taglineEn: "A full year of translation, paid once.",
    benefit:
      "Vous réglez une fois et vous n'y pensez plus : chaque appel à la famille, chaque voyage imprévu, chaque message à traduire est déjà couvert pendant douze mois.",
    benefitEn:
      "Pay once and stop thinking about it: every family call, every unplanned trip, every message to translate is already covered for twelve months.",
    anchor: "99,99 € l'année, soit 8,33 € par mois au lieu de 14,99 €.",
    anchorEn: "€99.99 a year — €8.33 a month instead of €14.99.",
    loss: "Au rythme d'un pass 7 jours par mois, la même année coûterait près de 120 €.",
    lossEn: "At one 7-day pass a month, the same year would cost close to €120.",
    bestFor: "Pour la diaspora qui échange toute l'année avec ses proches.",
    bestForEn: "For the diaspora staying in touch all year round.",
    priceCents: 9999,
    currency: "EUR",
    interval: "year",
    recurring: true,
    renewalOptional: true,
    entitlements: { lessonsPro: false, translationPremium: true, arNavigation: true },
    unlimitedHearts: false,
    features: [
      "Douze mois de traduction Premium, sans compteur ni relance",
      "Traduction texte, vocale et conversation en temps réel",
      "Reconnaissance et synthèse vocales : vous entendez la prononciation juste",
      "Traduction caméra si disponible et assistant IA",
      "Vous décidez maintenant si l'offre se reconduit ou s'arrête au bout d'un an",
    ],
    featuresEn: [
      "Twelve months of Premium translation, no counter and no reminders",
      "Text, voice and real-time conversation translation",
      "Speech recognition and synthesis: hear the right pronunciation",
      "Camera translation where available, plus the AI assistant",
      "You decide right now whether it renews or simply ends after a year",
    ],
  },
  {
    id: "GOLD_MONTHLY",
    family: "gold",
    name: "Premium GOLD",
    nameEn: "Premium GOLD",
    tagline: "Plus une seule limite, plus une seule question à se poser.",
    taglineEn: "No limits left, and nothing left to decide.",
    benefit:
      "Tout est ouvert : les 81 leçons, les cœurs illimités, la traduction sans compteur et l'assistant IA. Vous n'arbitrez plus entre apprendre et communiquer, et chaque nouveauté vous revient automatiquement.",
    benefitEn:
      "Everything is open: all 81 lessons, unlimited hearts, uncapped translation and the AI assistant. You never have to choose between learning and communicating, and every new feature lands in your plan automatically.",
    anchor: "19,99 € au lieu de 22,98 € pour Leçons Pro et Traduc Premium pris séparément.",
    anchorEn: "€19.99 instead of €22.98 for Lessons Pro and Premium translation bought separately.",
    loss: "Les offres partielles vous obligent à choisir chaque mois ce que vous laissez de côté.",
    lossEn: "Partial plans force you to decide, every month, what you leave out.",
    bestFor: "Pour qui utilise FonConnect toutes les semaines.",
    bestForEn: "For anyone using FonConnect every week.",
    priceCents: 1999,
    currency: "EUR",
    interval: "month",
    recurring: true,
    highlight: true,
    entitlements: { lessonsPro: true, translationPremium: true, arNavigation: true },
    unlimitedHearts: true,
    features: [
      "Tout Leçons Pro et tout Pro Traduction réunis",
      "Cœurs illimités et les 81 leçons ouvertes",
      "Prononciation corrigée, exercices vocaux et conversations avec l'IA",
      "Traduction texte, vocale, temps réel et caméra si disponible",
      "XP, badges, séries et statistiques : votre progression reste visible",
      "Toutes les fonctions Premium à venir, incluses sans supplément",
    ],
    featuresEn: [
      "Everything in Lessons Pro and Pro Translation combined",
      "Unlimited hearts and all 81 lessons unlocked",
      "Pronunciation feedback, voice exercises and AI conversations",
      "Text, voice, real-time and camera translation where available",
      "XP, badges, streaks and statistics: your progress stays visible",
      "Every upcoming Premium feature, included at no extra cost",
    ],
  },
  {
    id: "GOLD_YEARLY",
    family: "gold",
    name: "Premium GOLD annuel",
    nameEn: "Premium GOLD yearly",
    tagline: "Le meilleur de FonConnect, deux mois offerts.",
    taglineEn: "The best of FonConnect, with two months on us.",
    benefit:
      "Le même accès total, mais réglé une fois pour l'année : vous économisez 89,89 € par rapport au mensuel et vous vous engagez auprès de vous-même — c'est le levier le plus efficace pour tenir sur douze mois.",
    benefitEn:
      "The same complete access, settled once for the year: you save €89.89 compared with monthly billing and you commit to yourself — by far the strongest lever for lasting twelve months.",
    anchor: "149,99 € l'année, soit 12,50 € par mois au lieu de 19,99 €.",
    anchorEn: "€149.99 a year — €12.50 a month instead of €19.99.",
    loss: "En mensuel, la même année revient à 239,88 € : 89,89 € de plus pour un accès identique.",
    lossEn: "Monthly, the same year costs €239.88 — €89.89 more for identical access.",
    bestFor: "Pour ceux qui apprennent le fon sur la durée.",
    bestForEn: "For those learning Fon for the long run.",
    priceCents: 14999,
    currency: "EUR",
    interval: "year",
    recurring: true,
    entitlements: { lessonsPro: true, translationPremium: true, arNavigation: true },
    unlimitedHearts: true,
    features: [
      "Exactement le même accès que Premium GOLD, sur douze mois",
      "Environ deux mois offerts : 89,89 € économisés sur l'année",
      "Cœurs illimités, 81 leçons et traduction sans compteur",
      "Un seul paiement, aucune décision à reprendre chaque mois",
    ],
    featuresEn: [
      "Exactly the same access as Premium GOLD, over twelve months",
      "Roughly two months free: €89.89 saved over the year",
      "Unlimited hearts, 81 lessons and uncapped translation",
      "One single payment, no decision to revisit every month",
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

/** Montant hors taxes correspondant à un prix TTC (TVA 20 %). */
export function netCents(grossCents: number): number {
  return Math.round(grossCents / (1 + VAT_RATE));
}

/** Montant de TVA contenu dans un prix TTC. */
export function vatCents(grossCents: number): number {
  return grossCents - netCents(grossCents);
}

/** Prix mensuel équivalent d'une offre annuelle, pour comparaison. */
export function monthlyEquivalentCents(plan: Plan): number | null {
  return plan.interval === "year" ? Math.round(plan.priceCents / 12) : null;
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
