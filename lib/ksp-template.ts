/**
 * ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ для формулировок формы КСП.
 *
 * Здесь и только здесь хранятся надписи полей краткосрочного плана на русском
 * и казахском. Интерфейс, экспорт в DOCX и экспорт в PDF читают строки отсюда,
 * поэтому сверка с официальным текстом приказа — это правка одного файла.
 *
 * Нормативная опора: приказ Министра образования и науки РК от 06.04.2020 № 130
 * с изменениями (в т.ч. приказ МП РК № 319 от 29.10.2024 и № 98 от 30.04.2025).
 *
 * ┌─ ТРЕБУЕТ СВЕРКИ С ОФИЦИАЛЬНЫМ PDF ────────────────────────────────────────┐
 * │ Состав полей (8 в шапке, 5 колонок × 3 этапа) подтверждён перекрёстно по   │
 * │ нескольким источникам. Под вопросом остаются падежные варианты:            │
 * │   • "Действия ученика" ↔ "Действия обучающихся"                            │
 * │   • "Оқу мақсаттары"   ↔ "Оқыту мақсаттары"                                │
 * │ Исследование и список источников: docs/01-issledovanie-ksp.md              │
 * └────────────────────────────────────────────────────────────────────────────┘
 */
import type { Bilingual, ExtraKey, Lang, StageId } from "./types";

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "ru", label: "Русский", short: "RU" },
  { id: "kk", label: "Қазақша", short: "KZ" },
];

/** Заголовок документа. */
export const DOC_TITLE: Bilingual = {
  ru: "Краткосрочный план (поурочный план)",
  kk: "Қысқа мерзімді жоспар (сабақ жоспары)",
};

/** Восемь обязательных полей шапки — уровень A (строгая форма приказа). */
export const HEADER_LABELS = {
  section: {
    ru: "Раздел долгосрочного плана",
    kk: "Ұзақ мерзімді жоспар бөлімі",
  },
  teacher: { ru: "ФИО педагога", kk: "Педагогтің аты-жөні" },
  date: { ru: "Дата", kk: "Күні" },
  grade: { ru: "Класс", kk: "Сынып" },
  present: { ru: "Количество присутствующих", kk: "Қатысқандар саны" },
  absent: { ru: "Количество отсутствующих", kk: "Қатыспағандар саны" },
  topic: { ru: "Тема урока", kk: "Сабақтың тақырыбы" },
  objectives: {
    ru: "Цели обучения в соответствии с учебной программой",
    kk: "Оқу бағдарламасына сәйкес оқу мақсаттары",
  },
  lessonGoals: { ru: "Цели урока", kk: "Сабақтың мақсаты" },
} satisfies Record<string, Bilingual>;

/** Заголовок таблицы хода урока. */
export const FLOW_TITLE: Bilingual = {
  ru: "Ход урока",
  kk: "Сабақтың барысы",
};

/** Пять обязательных колонок таблицы «Ход урока». Порядок нормативный. */
export const FLOW_COLUMNS: { key: string; label: Bilingual; width: number }[] = [
  {
    key: "stage",
    label: { ru: "Этап урока / Время", kk: "Сабақтың кезеңі / Уақыты" },
    width: 14,
  },
  {
    key: "teacher",
    label: { ru: "Действия педагога", kk: "Педагогтің әрекеті" },
    width: 26,
  },
  {
    key: "student",
    label: { ru: "Действия обучающихся", kk: "Оқушының әрекеті" },
    width: 26,
  },
  { key: "assessment", label: { ru: "Оценивание", kk: "Бағалау" }, width: 17 },
  { key: "resources", label: { ru: "Ресурсы", kk: "Ресурстар" }, width: 17 },
];

/** Три обязательные строки таблицы. */
export const STAGE_LABELS: Record<StageId, Bilingual> = {
  start: { ru: "Начало урока", kk: "Сабақтың басы" },
  middle: { ru: "Середина урока", kk: "Сабақтың ортасы" },
  end: { ru: "Конец урока", kk: "Сабақтың соңы" },
};

/** Расширенные методические блоки — уровень B, включаются тумблерами. */
export const EXTRA_LABELS: Record<ExtraKey, Bilingual> = {
  criteria: { ru: "Критерии оценивания", kk: "Бағалау критерийлері" },
  descriptors: { ru: "Дескрипторы", kk: "Дескрипторлар" },
  languageGoals: { ru: "Языковые цели", kk: "Тілдік мақсаттар" },
  values: { ru: "Привитие ценностей", kk: "Құндылықтарды дарыту" },
  crossCurricular: { ru: "Межпредметные связи", kk: "Пәнаралық байланыс" },
  priorKnowledge: { ru: "Предварительные знания", kk: "Алдыңғы білім" },
  differentiationSupport: {
    ru: "Дифференциация: поддержка",
    kk: "Саралау: қолдау көрсету",
  },
  differentiationChallenge: {
    ru: "Дифференциация: усложнение",
    kk: "Саралау: тапсырманы күрделендіру",
  },
  safety: {
    ru: "Здоровье и соблюдение техники безопасности",
    kk: "Денсаулық және қауіпсіздік техникасын сақтау",
  },
  reflection: { ru: "Рефлексия по уроку", kk: "Сабақ бойынша рефлексия" },
};

/** Порядок вывода расширенных блоков в документе. */
export const EXTRA_ORDER: ExtraKey[] = [
  "priorKnowledge",
  "criteria",
  "descriptors",
  "languageGoals",
  "values",
  "crossCurricular",
  "differentiationSupport",
  "differentiationChallenge",
  "safety",
  "reflection",
];

/**
 * Блоки, включённые по умолчанию. Для химии техника безопасности и
 * дифференциация включены всегда: без них план не принимает методист.
 */
export const DEFAULT_ENABLED: Record<ExtraKey, boolean> = {
  priorKnowledge: true,
  criteria: true,
  descriptors: true,
  languageGoals: false,
  values: false,
  crossCurricular: true,
  differentiationSupport: true,
  differentiationChallenge: true,
  safety: true,
  reflection: true,
};

/** Выбрать нужный язык из двуязычной строки. */
export function t(value: Bilingual, lang: Lang): string {
  return value[lang];
}
