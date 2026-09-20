/**
 * База знаний по химии 7–11 классов.
 *
 * Темы разложены по файлам классов в lib/kb/, разделы типовой учебной
 * программы описаны в lib/kb/curriculum.ts. Здесь — сборка, сопоставление
 * темы урока с базой и универсальный каркас для тем вне покрытия.
 *
 * База работает офлайн и является основным источником генерации.
 * Claude API подключается поверх неё как необязательная доработка.
 */
import { CURRICULUM, findUnit } from "./kb/curriculum";
import { GRADE_7 } from "./kb/grade7";
import { GRADE_8 } from "./kb/grade8";
import { GRADE_9 } from "./kb/grade9";
import { GRADE_10 } from "./kb/grade10";
import { GRADE_11 } from "./kb/grade11";
import type { Bilingual, Lang } from "./types";
import type { Experiment, Term, TopicEntry, TopicKind } from "./kb/topic";

export type { Experiment, Term, TopicEntry, TopicKind };
export { CURRICULUM, findUnit };
export type { CurriculumUnit } from "./kb/curriculum";

export const TOPICS: TopicEntry[] = [
  ...GRADE_7,
  ...GRADE_8,
  ...GRADE_9,
  ...GRADE_10,
  ...GRADE_11,
];

/** Раздел для темы, которой нет в базе. */
const FALLBACK_SECTION: Bilingual = {
  ru: "Раздел учебной программы",
  kk: "Оқу бағдарламасының бөлімі",
};

/** Название раздела долгосрочного плана для шапки КСП. */
export function sectionTitle(topic: TopicEntry, lang: Lang): string {
  return (findUnit(topic.unit)?.title ?? FALLBACK_SECTION)[lang];
}

/** Универсальный каркас: используется, если тема не найдена в базе. */
export const FALLBACK_TOPIC: TopicEntry = {
  id: "generic",
  grade: 0,
  unit: "",
  keywords: [],
  kind: "concept",
  experiments: [
    {
      title: {
        ru: "Демонстрационный опыт по теме урока",
        kk: "Сабақ тақырыбы бойынша демонстрациялық тәжірибе",
      },
      materials: {
        ru: "Реактивы и оборудование подбираются педагогом в соответствии с темой и оснащением кабинета.",
        kk: "Реактивтер мен жабдықты педагог тақырыпқа және кабинет жарақтандырылуына сәйкес таңдайды.",
      },
      procedure: {
        ru: "Обучающиеся наблюдают опыт, фиксируют признаки реакции в таблице наблюдений и формулируют вывод, связывая его с целью обучения.",
        kk: "Оқушылар тәжірибені бақылап, реакция белгілерін бақылау кестесіне түсіреді және оқу мақсатымен байланыстыра отырып қорытынды жасайды.",
      },
      safety: {
        ru: "Провести инструктаж с учётом конкретных реактивов; при отсутствии вытяжного шкафа заменить опыт видеозаписью или виртуальной лабораторией.",
        kk: "Нақты реактивтерді ескере отырып нұсқаулық жүргізу; сору шкафы болмаса тәжірибені видеожазбамен немесе виртуалды зертханамен ауыстыру.",
      },
      virtual: {
        ru: "Виртуальная лаборатория или видеоопыт по теме урока.",
        kk: "Сабақ тақырыбы бойынша виртуалды зертхана немесе видеотәжірибе.",
      },
    },
  ],
  priorKnowledge: {
    ru: "Материал предыдущих уроков раздела, базовые понятия и обозначения по теме.",
    kk: "Бөлімнің алдыңғы сабақтарының материалы, тақырып бойынша негізгі ұғымдар мен белгілеулер.",
  },
  crossCurricular: {
    ru: "Физика, биология, география — по содержанию темы урока.",
    kk: "Физика, биология, география — сабақ тақырыбының мазмұны бойынша.",
  },
  terms: [],
  methods: ["critical", "group", "problem"],
  criteria: [
    { ru: "Достигает цели обучения, заявленной в плане", kk: "Жоспарда мәлімделген оқу мақсатына қол жеткізеді" },
    { ru: "Применяет изученное при решении учебной задачи", kk: "Оқу міндетін шешуде үйренгенін қолданады" },
  ],
  descriptors: [
    { ru: "называет ключевые понятия темы", kk: "тақырыптың негізгі ұғымдарын атайды" },
    { ru: "выполняет задание по образцу", kk: "тапсырманы үлгі бойынша орындайды" },
    { ru: "формулирует вывод по итогам урока", kk: "сабақ қорытындысы бойынша тұжырым жасайды" },
  ],
};

/** Нормализация: нижний регистр, ё→е, всё кроме букв и цифр → пробел. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalize(text);
  return normalized ? normalized.split(" ") : [];
}

/** Длина общего префикса двух токенов. */
function commonPrefix(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let i = 0;
  while (i < limit && a[i] === b[i]) i++;
  return i;
}

/**
 * Сопоставление токенов без морфологического анализатора.
 * Короткий ключ (до 4 букв) требует точного совпадения, иначе «ион» цеплялся
 * бы к посторонним темам. Ключ-основа ловится префиксом: «реакц» → «реакции».
 * Общий префикс от шести букв покрывает расхождение окончаний с обеих сторон
 * («карбоновая» ↔ «карбоновые»), но не сводит «кислоту» с «кислородом»:
 * у них общего всего пять букв.
 */
function tokensMatch(keywordToken: string, topicToken: string): boolean {
  if (keywordToken.length < 4) return topicToken === keywordToken;
  if (topicToken.startsWith(keywordToken)) return true;
  if (keywordToken.length < 6 || topicToken.length < 6) return false;
  return commonPrefix(keywordToken, topicToken) >= 6;
}

/** Ключевое слово засчитывается, если каждый его токен нашёлся в теме. */
function keywordMatches(keywordTokens: string[], topicTokens: string[]): boolean {
  return keywordTokens.every((keywordToken) =>
    topicTokens.some((topicToken) => tokensMatch(keywordToken, topicToken)),
  );
}

export interface TopicMatch {
  topic: TopicEntry;
  score: number;
  matched: boolean;
}

/**
 * Подбирает тему из базы знаний. Вес ключевого слова — его длина:
 * «электролитическая диссоциация» весомее, чем «ион». Указанный класс
 * повышает вес тем своей параллели в полтора раза.
 */
export function matchTopic(topicText: string, grade?: string): TopicMatch {
  const topicTokens = tokenize(topicText);
  if (topicTokens.length === 0) {
    return { topic: FALLBACK_TOPIC, score: 0, matched: false };
  }

  const gradeNum = grade ? parseInt(grade, 10) : NaN;
  let best: TopicEntry | null = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    let score = 0;
    // Один и тот же ключ может встретиться в русском и казахском списках —
    // засчитываем его один раз, иначе вес темы удваивается на ровном месте.
    for (const keyword of new Set(topic.keywords)) {
      if (keywordMatches(tokenize(keyword), topicTokens)) {
        score += keyword.length;
      }
    }
    if (score > 0 && !Number.isNaN(gradeNum) && topic.grade === gradeNum) {
      score *= 1.5;
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (!best) return { topic: FALLBACK_TOPIC, score: 0, matched: false };
  return { topic: best, score: bestScore, matched: true };
}
