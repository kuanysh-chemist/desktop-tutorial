/** Типы базы знаний по химии. Сами темы лежат в lib/kb/grade*.ts. */
import type { Bilingual } from "../types";

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
  criteria: Bilingual[];
  descriptors: Bilingual[];
}
