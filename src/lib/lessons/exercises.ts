import { TRILINGUAL_CORPUS } from "./corpus";
import { getPath } from "./index";
import type { Exercise, Lesson, VocabItem } from "./types";

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
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

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ɖɛɔŋ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function similarity(a: string, b: string): number {
  const s = normalize(a);
  const t = normalize(b);
  if (!s || !t) return 0;
  if (s === t) return 1;
  const rows = s.length + 1;
  const cols = t.length + 1;
  const dp: number[] = new Array(cols).fill(0).map((_, i) => i);
  for (let i = 1; i < rows; i += 1) {
    let prev = dp[0] as number;
    dp[0] = i;
    for (let j = 1; j < cols; j += 1) {
      const tmp = dp[j] as number;
      dp[j] = Math.min(
        (dp[j] as number) + 1,
        (dp[j - 1] as number) + 1,
        prev + (s[i - 1] === t[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  const distance = dp[cols - 1] as number;
  return Math.max(0, 1 - distance / Math.max(s.length, t.length));
}

function distractorPool(pathId: string, exclude: string): string[] {
  const path = getPath(pathId);
  const local = (path?.lessons ?? []).flatMap((l) => l.vocab.map((v) => v.fon));
  const global = TRILINGUAL_CORPUS.map((c) => c.fon);
  const seen = new Set<string>([exclude]);
  const out: string[] = [];
  for (const candidate of [...local, ...global]) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  return out;
}

function maskWord(word: string, rand: () => number): string {
  const chars = [...word];
  const letterPositions = chars
    .map((c, i) => (/\s/.test(c) ? -1 : i))
    .filter((i) => i >= 0);
  const hideCount = Math.max(1, Math.round(letterPositions.length * 0.35));
  const hidden = new Set(shuffle(letterPositions, rand).slice(0, hideCount));
  return chars.map((c, i) => (hidden.has(i) ? "_" : c)).join("");
}

export function buildExercises(pathId: string, lesson: Lesson): Exercise[] {
  const rand = seeded(`${pathId}:${lesson.id}`);
  const vocab = lesson.vocab;
  if (vocab.length === 0) return [];

  const exercises: Exercise[] = [
    { kind: "discover", id: `${lesson.id}-discover`, items: vocab },
  ];

  const pool = distractorPool(pathId, "");
  const selection = vocab.slice(0, 8);

  selection.forEach((item, i) => {
    const wrong = shuffle(
      distractorPool(pathId, item.fon).slice(0, 40),
      seeded(`${lesson.id}-${i}`),
    ).slice(0, 3);
    const cycle = i % 4;

    if (cycle === 0) {
      exercises.push({
        kind: "mcq",
        id: `${lesson.id}-mcq-${i}`,
        item,
        direction: "toFon",
        options: shuffle([item.fon, ...wrong], seeded(`${lesson.id}-o-${i}`)),
      });
      return;
    }
    if (cycle === 1) {
      const tokens = item.fon.split(/\s+/).filter(Boolean);
      if (tokens.length >= 2) {
        exercises.push({
          kind: "order",
          id: `${lesson.id}-order-${i}`,
          item,
          tokens: shuffle(tokens, seeded(`${lesson.id}-t-${i}`)),
        });
        return;
      }
    }
    if (cycle === 2) {
      exercises.push({
        kind: "blank",
        id: `${lesson.id}-blank-${i}`,
        item,
        masked: maskWord(item.fon, seeded(`${lesson.id}-b-${i}`)),
        answer: item.fon,
      });
      return;
    }
    exercises.push({ kind: "translate", id: `${lesson.id}-translate-${i}`, item });
  });

  const listenItem = vocab[Math.floor(rand() * vocab.length)] as VocabItem;
  exercises.push({ kind: "listen", id: `${lesson.id}-listen`, item: listenItem });

  void pool;
  return exercises;
}

export function checkAnswer(exercise: Exercise, answer: string): boolean {
  switch (exercise.kind) {
    case "mcq":
      return normalize(answer) === normalize(exercise.item.fon);
    case "order":
      return normalize(answer) === normalize(exercise.item.fon);
    case "blank":
      return normalize(answer) === normalize(exercise.answer);
    case "translate":
      return similarity(answer, exercise.item.fon) >= 0.82;
    case "listen":
      return similarity(answer, exercise.item.fon) >= 0.6;
    default:
      return true;
  }
}
