/** Язык интерфейса и выходного документа. */
export type Lang = "ru" | "kk";

/** Двуязычная строка. Все пользовательские надписи хранятся парами. */
export interface Bilingual {
  ru: string;
  kk: string;
}

/** Цель обучения из Типовой учебной программы: код вида 8.2.1.1 + формулировка. */
export interface LearningObjective {
  code: string;
  text: string;
}

/** Идентификаторы трёх обязательных этапов урока по форме приказа № 130. */
export type StageId = "start" | "middle" | "end";

/** Одна строка таблицы «Ход урока» — пять обязательных колонок. */
export interface LessonStage {
  id: StageId;
  /** Смещение начала этапа от начала урока, мин. */
  fromMinute: number;
  /** Длительность этапа, мин. */
  minutes: number;
  teacher: string;
  student: string;
  assessment: string;
  resources: string;
}

/** Методически расширенные блоки (уровень B). Включаются тумблерами. */
export interface KspExtras {
  criteria: string;
  descriptors: string;
  languageGoals: string;
  values: string;
  crossCurricular: string;
  priorKnowledge: string;
  differentiationSupport: string;
  differentiationChallenge: string;
  safety: string;
  reflection: string;
}

/** Ключи расширенных блоков — используются для тумблеров и экспорта. */
export type ExtraKey = keyof KspExtras;

/** Шапка КСП: восемь обязательных полей формы приказа № 130. */
export interface KspHeader {
  section: string;
  teacher: string;
  date: string;
  grade: string;
  present: string;
  absent: string;
  topic: string;
  objectives: LearningObjective[];
  lessonGoals: string[];
}

/** Полный краткосрочный план. */
export interface KspPlan {
  header: KspHeader;
  durationMinutes: number;
  stages: LessonStage[];
  extras: KspExtras;
  /** Какие расширенные блоки попадут в документ. */
  enabled: Record<ExtraKey, boolean>;
}

/**
 * Современные подходы, которые учитель включает галочкой.
 *
 * Тумблеры меняют сам локальный план, а не только запрос к Claude: иначе у
 * школы без ключа API галочки ничего бы не делали.
 */
export interface LessonOptions {
  /** Предметно-языковая интеграция: термины в триплете и речевые образцы. */
  clil: boolean;
  /** Обязательная виртуальная лаборатория или симуляция в середине урока. */
  virtualLab: boolean;
  /** Игровые форматы и сервисы викторин. */
  gamification: boolean;
}

export const NO_OPTIONS: LessonOptions = {
  clil: false,
  virtualLab: false,
  gamification: false,
};

/** Данные, которые учитель вводит вручную (Шаг 2 техзадания). */
export interface LessonInput {
  topic: string;
  objectivesRaw: string;
  durationMinutes: number;
  grade: string;
  teacher: string;
  date: string;
  present: string;
  absent: string;
  /** Необязательно: старые сохранённые планы этого поля не содержат. */
  options?: LessonOptions;
}
