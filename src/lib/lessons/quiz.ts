import type { LearningPath, VocabItem } from "./types";
import { LEARNING_PATHS } from "./content";

export const QUIZ_PASS_RATIO = 0.7;

export type QuizQuestion = {
  id: string;
  prompt: string;
  promptEn: string;
  options: string[];
  answer: string;
};

function seeded(seedText: string) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i += 1) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/** 10 QCM déterministes construits à partir du vocabulaire du parcours. */
export function buildPathQuiz(path: LearningPath, count = 10): QuizQuestion[] {
  const rand = seeded(`quiz:${path.id}`);
  const all: VocabItem[] = path.lessons.flatMap((l) => l.vocab);
  const unique = new Map<string, VocabItem>();
  for (const item of all) if (!unique.has(item.fon)) unique.set(item.fon, item);
  const pool = [...unique.values()];
  if (pool.length === 0) return [];

  const picked = shuffle(pool, rand).slice(0, Math.min(count, pool.length));
  return picked.map((item, i) => {
    const wrong = shuffle(
      pool.filter((p) => p.fon !== item.fon),
      seeded(`${path.id}-q-${i}`),
    )
      .slice(0, 3)
      .map((p) => p.fon);
    return {
      id: `${path.id}-q-${i}`,
      prompt: `Comment dit-on « ${item.fr} » en fon ?`,
      promptEn: `How do you say "${item.en}" in Fon?`,
      options: shuffle([item.fon, ...wrong], seeded(`${path.id}-o-${i}`)),
      answer: item.fon,
    };
  });
}

export function getQuizPath(pathId: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === pathId);
}
