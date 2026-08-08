import { PHRASEBOOK, type PhraseEntry } from "./phrasebook-data";

export type LessonItem = PhraseEntry;

export type QuizQuestion = {
  id: string;
  prompt: string;
  promptEn: string;
  answer: string;
  options: string[];
};

export type Lesson = {
  id: string;
  title: string;
  titleEn: string;
  objective: string;
  objectiveEn: string;
  items: LessonItem[];
};

export type LessonModule = {
  id: string;
  title: string;
  titleEn: string;
  level: string;
  levelEn: string;
  description: string;
  descriptionEn: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
};

function categoryEntries(id: string): PhraseEntry[] {
  return PHRASEBOOK.find((c) => c.id === id)?.entries ?? [];
}

/** Distracteurs déterministes pris parmi les autres phrases du module. */
function buildQuiz(moduleId: string, items: LessonItem[]): QuizQuestion[] {
  const pool = items.map((i) => i.fon);
  return items.slice(0, 6).map((item, index) => {
    const distractors: string[] = [];
    let cursor = index;
    while (distractors.length < 3 && distractors.length < pool.length - 1) {
      cursor = (cursor + 3) % pool.length;
      const candidate = pool[cursor];
      if (candidate && candidate !== item.fon && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }
    const options = [...distractors];
    options.splice(index % (options.length + 1), 0, item.fon);
    return {
      id: `${moduleId}-q${index + 1}`,
      prompt: `Comment dit-on « ${item.fr} » en fon ?`,
      promptEn: `How do you say “${item.en}” in Fon?`,
      answer: item.fon,
      options,
    };
  });
}

const decouverteLessons: Lesson[] = [
  {
    id: "salutations",
    title: "Saluer au quotidien",
    titleEn: "Everyday greetings",
    objective: "Ouvrir une conversation avec respect au Bénin.",
    objectiveEn: "Open a conversation respectfully in Benin.",
    items: categoryEntries("salutations"),
  },
  {
    id: "politesse",
    title: "Les formules de politesse",
    titleEn: "Polite expressions",
    objective: "Remercier, s'excuser et demander poliment.",
    objectiveEn: "Thank, apologise and ask politely.",
    items: categoryEntries("politesse"),
  },
  {
    id: "presentation",
    title: "Se présenter",
    titleEn: "Introducing yourself",
    objective: "Dire qui vous êtes et d'où vous venez.",
    objectiveEn: "Say who you are and where you come from.",
    items: categoryEntries("presentation"),
  },
];

export const LESSON_MODULES: LessonModule[] = [
  {
    id: "decouverte",
    title: "Découverte du fon",
    titleEn: "Discovering Fon",
    level: "Débutant",
    levelEn: "Beginner",
    description:
      "Module de démonstration construit à partir des phrases validées du Phrasebook : saluer, remercier et se présenter.",
    descriptionEn:
      "Starter module built from the validated Phrasebook sentences: greeting, thanking and introducing yourself.",
    lessons: decouverteLessons,
    quiz: buildQuiz("decouverte", decouverteLessons.flatMap((l) => l.items)),
  },
];

export const QUIZ_PASS_RATIO = 0.8;

export function getModule(moduleId: string) {
  return LESSON_MODULES.find((m) => m.id === moduleId);
}

export function getLesson(moduleId: string, lessonId: string) {
  return getModule(moduleId)?.lessons.find((l) => l.id === lessonId);
}

export function totalLessons() {
  return LESSON_MODULES.reduce((n, m) => n + m.lessons.length, 0);
}
