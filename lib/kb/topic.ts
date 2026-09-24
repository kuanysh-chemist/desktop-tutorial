/** Типы базы знаний по химии. Сами темы лежат в lib/kb/grade*.ts. */
import type { Bilingual, StageId } from "../types";

/** Термин в триплете для языковых целей CLIL. */
export interface Term {
  ru: string;
  kk: string;
  en: string;
}

export interface Experiment {
  title: Bilingual;
  materials: Bilingual;
  procedure: Bilingual;
  safety: Bilingual;
  /** Чем заменить опыт, если нет реактивов, вытяжки или он опасен для класса. */
  virtual: Bilingual;
}

/** Характер темы — определяет пару «поддержка / усложнение». */
export type TopicKind = "concept" | "experiment" | "calculation" | "equation";

export interface TopicEntry {
  id: string;
  grade: number;
  /** Идентификатор раздела из lib/kb/curriculum.ts, например «9.2». */
  unit: string;
  /** Ключевые слова для сопоставления с темой урока (RU и KZ, в нижнем регистре). */
  keywords: string[];
  kind: TopicKind;
  experiments: Experiment[];
  priorKnowledge: Bilingual;
  crossCurricular: Bilingual;
  terms: Term[];
  /** Идентификаторы методик из lib/pedagogy.ts. */
  methods: string[];
  /**
   * Приёмы и цифровые ресурсы, закреплённые за этапами урока.
   *
   * Поле необязательное и намеренно неполное. Если закрепить всё за всеми
   * темами, вернётся ровно то, на что жаловался учитель: одинаковые планы.
   * Поэтому здесь указывают один-два пункта на этап — те, без которых тема
   * методически проседает, — а остальные позиции генератор по-прежнему
   * подбирает из пулов и меняет от варианта к варианту.
   *
   * Идентификатор может указывать на приём из lib/active-methods.ts, на
   * цифровой ресурс из lib/ict.ts или на приём оценивания из lib/pedagogy.ts;
   * каждый занимает свою позицию в плане. Если на одну позицию закреплено
   * несколько пунктов, кнопка «Другой вариант» перебирает их.
   *
   * Разрешимость идентификаторов проверяет npm run verify:coverage.
   */
  stagePlan?: Partial<Record<StageId, string[]>>;
  criteria: Bilingual[];
  descriptors: Bilingual[];
}
