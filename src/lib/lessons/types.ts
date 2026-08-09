export type VocabItem = {
  fon: string;
  phonetic: string;
  fr: string;
  en: string;
};

export type DialogueLine = {
  speaker: string;
  fon: string;
  fr: string;
};

export type LessonKind = "vocab" | "ai" | "alphabet";

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  kind: LessonKind;
  vocab: VocabItem[];
  dialogue?: DialogueLine[];
  aiTurns?: DialogueLine[];
  culture?: string;
};

export type LearningPath = {
  id: string;
  index: number;
  title: string;
  titleEn: string;
  color: string;
  lessons: Lesson[];
};

export type ExerciseKind =
  | "discover"
  | "mcq"
  | "order"
  | "blank"
  | "translate"
  | "listen";

export type Exercise =
  | { kind: "discover"; id: string; items: VocabItem[] }
  | {
      kind: "mcq";
      id: string;
      item: VocabItem;
      options: string[];
      direction: "toFon" | "fromFon";
    }
  | { kind: "order"; id: string; item: VocabItem; tokens: string[] }
  | { kind: "blank"; id: string; item: VocabItem; masked: string; answer: string }
  | { kind: "translate"; id: string; item: VocabItem }
  | { kind: "listen"; id: string; item: VocabItem };
