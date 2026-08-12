export type LevelRank = {
  level: number;
  minXp: number;
  title: string;
  titleEn: string;
};

export const LEVELS: LevelRank[] = [
  { level: 1, minXp: 0, title: "Débutant", titleEn: "Beginner" },
  { level: 2, minXp: 100, title: "Apprenti", titleEn: "Apprentice" },
  { level: 3, minXp: 250, title: "Curieux", titleEn: "Curious" },
  { level: 4, minXp: 450, title: "Voyageur", titleEn: "Traveller" },
  { level: 5, minXp: 700, title: "Converseur", titleEn: "Conversationalist" },
  { level: 6, minXp: 1000, title: "Confirmé", titleEn: "Confident" },
  { level: 7, minXp: 1400, title: "Avancé", titleEn: "Advanced" },
  { level: 8, minXp: 1900, title: "Expert", titleEn: "Expert" },
  { level: 9, minXp: 2500, title: "Maître", titleEn: "Master" },
  { level: 10, minXp: 3200, title: "Grand Maître", titleEn: "Grandmaster" },
];

export function levelForXp(xp: number): LevelRank {
  let current = LEVELS[0] as LevelRank;
  for (const rank of LEVELS) if (xp >= rank.minXp) current = rank;
  return current;
}

export function nextLevel(xp: number): LevelRank | null {
  return LEVELS.find((r) => r.minXp > xp) ?? null;
}

export type BadgeDef = {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
};

export const BADGES: BadgeDef[] = [
  {
    id: "supporter",
    icon: "💚",
    title: "Soutien",
    titleEn: "Supporter",
    description: "Soutenir FonConnect avec une offre payante.",
    descriptionEn: "Support FonConnect with a paid plan.",
  },
  {
    id: "first-lesson",
    icon: "🌱",
    title: "Premiers pas",
    titleEn: "First steps",
    description: "Terminer votre première leçon.",
    descriptionEn: "Complete your first lesson.",
  },
  {
    id: "perfect-lesson",
    icon: "🎯",
    title: "Sans faute",
    titleEn: "Flawless",
    description: "Terminer une leçon sans aucune erreur.",
    descriptionEn: "Finish a lesson without a single mistake.",
  },
  {
    id: "streak-7",
    icon: "🔥",
    title: "Série de 7",
    titleEn: "7-day streak",
    description: "Apprendre 7 jours d'affilée.",
    descriptionEn: "Learn 7 days in a row.",
  },
  {
    id: "streak-30",
    icon: "⚡",
    title: "Série de 30",
    titleEn: "30-day streak",
    description: "Apprendre 30 jours d'affilée.",
    descriptionEn: "Learn 30 days in a row.",
  },
  {
    id: "xp-500",
    icon: "⭐",
    title: "500 XP",
    titleEn: "500 XP",
    description: "Cumuler 500 XP.",
    descriptionEn: "Earn 500 XP.",
  },
  {
    id: "xp-2000",
    icon: "🌟",
    title: "2000 XP",
    titleEn: "2000 XP",
    description: "Cumuler 2000 XP.",
    descriptionEn: "Earn 2000 XP.",
  },
  {
    id: "first-ai",
    icon: "💬",
    title: "Premier dialogue",
    titleEn: "First dialogue",
    description: "Terminer une leçon de conversation avec l'IA.",
    descriptionEn: "Complete an AI conversation lesson.",
  },
  {
    id: "path-bases",
    icon: "🟢",
    title: "Les bases",
    titleEn: "The basics",
    description: "Terminer le parcours Les bases.",
    descriptionEn: "Complete the Basics path.",
  },
  {
    id: "path-quotidien",
    icon: "🔵",
    title: "Vie quotidienne",
    titleEn: "Daily life",
    description: "Terminer le parcours Vie quotidienne.",
    descriptionEn: "Complete the Daily life path.",
  },
  {
    id: "path-marche",
    icon: "🟡",
    title: "Roi du marché",
    titleEn: "Market king",
    description: "Terminer le parcours Marché et achats.",
    descriptionEn: "Complete the Market path.",
  },
  {
    id: "path-restaurant",
    icon: "🍽️",
    title: "Gourmet",
    titleEn: "Gourmet",
    description: "Terminer le parcours Restaurant.",
    descriptionEn: "Complete the Restaurant path.",
  },
  {
    id: "path-voyage",
    icon: "✈️",
    title: "Grand voyageur",
    titleEn: "Globetrotter",
    description: "Terminer le parcours Voyage.",
    descriptionEn: "Complete the Travel path.",
  },
  {
    id: "path-urgences",
    icon: "🚨",
    title: "Prêt à tout",
    titleEn: "Always ready",
    description: "Terminer le parcours Urgences.",
    descriptionEn: "Complete the Emergencies path.",
  },
  {
    id: "path-conversations",
    icon: "🗣️",
    title: "Beau parleur",
    titleEn: "Smooth talker",
    description: "Terminer le parcours Conversations avec l'IA.",
    descriptionEn: "Complete the AI conversations path.",
  },
  {
    id: "path-professionnel",
    icon: "💼",
    title: "Business Fon",
    titleEn: "Business Fon",
    description: "Terminer le parcours Professionnel.",
    descriptionEn: "Complete the Professional path.",
  },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

export function streakBonus(streak: number): number {
  if (streak >= 30) return 0.5;
  if (streak >= 14) return 0.3;
  if (streak >= 7) return 0.2;
  if (streak >= 3) return 0.1;
  return 0;
}
