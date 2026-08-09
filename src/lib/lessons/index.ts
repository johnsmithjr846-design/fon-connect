import { LEARNING_PATHS, FON_ALPHABET } from "./content";
import type { LearningPath, Lesson } from "./types";

export { LEARNING_PATHS, FON_ALPHABET };
export type * from "./types";

export const XP_PER_LESSON = 10;
export const MAX_HEARTS = 5;
export const HEART_REFILL_MINUTES = 20;
export const CHEST_EVERY = 5;

export function getPath(pathId: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === pathId);
}

export function getLesson(pathId: string, lessonId: string): Lesson | undefined {
  return getPath(pathId)?.lessons.find((l) => l.id === lessonId);
}

export function lessonIndex(pathId: string, lessonId: string): number {
  return getPath(pathId)?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
}

export function totalLessons(): number {
  return LEARNING_PATHS.reduce((n, p) => n + p.lessons.length, 0);
}

/** Un coffre est placé après chaque bloc de CHEST_EVERY leçons. */
export function chestPositions(path: LearningPath): number[] {
  const out: number[] = [];
  for (let i = CHEST_EVERY; i <= path.lessons.length; i += CHEST_EVERY) out.push(i);
  return out;
}

export function chestId(pathId: string, position: number): string {
  return `${pathId}-chest-${position}`;
}
