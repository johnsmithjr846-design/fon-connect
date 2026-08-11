import bases from "@/assets/lessons/bases.jpg";
import quotidien from "@/assets/lessons/quotidien.jpg";
import marche from "@/assets/lessons/marche.jpg";
import restaurant from "@/assets/lessons/restaurant.jpg";
import voyage from "@/assets/lessons/voyage.jpg";
import urgences from "@/assets/lessons/urgences.jpg";
import conversations from "@/assets/lessons/conversations.jpg";
import professionnel from "@/assets/lessons/professionnel.jpg";

export const PATH_ILLUSTRATIONS: Record<string, string> = {
  bases,
  quotidien,
  marche,
  restaurant,
  voyage,
  urgences,
  conversations,
  professionnel,
};

export const PATH_EMOJI: Record<string, string> = {
  bases: "👋",
  quotidien: "🏡",
  marche: "🧺",
  restaurant: "🍲",
  voyage: "🛵",
  urgences: "🚑",
  conversations: "💬",
  professionnel: "💼",
};

export function pathIllustration(pathId: string): string | undefined {
  return PATH_ILLUSTRATIONS[pathId];
}
