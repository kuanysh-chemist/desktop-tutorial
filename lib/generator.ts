/**
 * Детерминированный движок генерации КСП.
 *
 * Вход — три поля, которые заполняет учитель (тема, цели обучения, время
 * урока) плюс реквизиты шапки. Выход — заполненный краткосрочный план,
 * пригодный к ручному редактированию и экспорту.
 *
 * Работает офлайн: содержание собирается из lib/chemistry-kb.ts и
 * lib/pedagogy.ts. Claude API подключается поверх как необязательная
 * доработка формулировок.
 */
import {
  matchTopic,
  sectionTitle,
  type Experiment,
  type TopicEntry,
} from "./chemistry-kb";
import {
  ASSESSMENT,
  BASE_SAFETY,
  DIFFERENTIATION,
  METHODS,
  VALUES,
  type TeachingMethod,
} from "./pedagogy";
import { DEFAULT_ENABLED, STAGE_LABELS } from "./ksp-template";
import { UI } from "./i18n";
import type {
  Bilingual,
  KspExtras,
  KspPlan,
  Lang,
  LearningObjective,
  LessonInput,
  LessonStage,
  StageId,
} from "./types";

/** Устойчивый хеш строки — чтобы выбор вариантов был стабильным для темы. */
function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

/**
 * Разбирает поле «Цели обучения»: каждая строка — одна цель, код вида
 * 9.3.4.1 в начале строки распознаётся и отделяется от текста.
 */
export function parseObjectives(raw: string): LearningObjective[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+\.\d+\.\d+\.\d+)\s*[-–—:.)]?\s*(.*)$/);
      if (match && match[2]) return { code: match[1], text: match[2].trim() };
      if (match) return { code: match[1], text: "" };
      return { code: "", text: line };
    });
}

/** Убирает завершающую точку — чтобы цель встроилась в предложение. */
function trimDot(text: string): string {
  return text.replace(/\s*[.;]\s*$/, "");
}

/**
 * Опускает первую букву, чтобы фраза встроилась в предложение после двоеточия
 * или тире.
 *
 * Химические формулы при этом не трогаются: в «NaCl» регистр несёт смысл,
 * «naCl» — запись другого вещества, а «CO» и «Co» — угарный газ и кобальт.
 * Поэтому если первое слово содержит заглавную букву не в начале или цифровой
 * индекс, текст остаётся как есть.
 */
function lowerFirst(text: string): string {
  const firstWord = text.split(/\s/, 1)[0] ?? "";
  const looksLikeFormula =
    /[A-ZА-Я]/.test(firstWord.slice(1)) || /[0-9₀-₉]/.test(firstWord);
  if (looksLikeFormula) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Приводит формулировку цели к форме «что обучающийся сможет сделать». */
function asAbility(objective: LearningObjective, lang: Lang): string {
  const text = trimDot(objective.text || objective.code);
  if (!text) return lang === "ru" ? "достичь цели урока" : "сабақ мақсатына жету";
  return lowerFirst(text);
}

/**
 * Три уровня целей урока. Форма приказа требует одно поле «Цели урока»,
 * но трёхуровневая запись прямо поддерживает блок дифференциации,
 * поэтому генерируется именно она.
 */
function buildLessonGoals(
  objectives: LearningObjective[],
  topic: TopicEntry,
  lang: Lang,
): string[] {
  const primary = objectives[0];
  const secondary = objectives[1] ?? objectives[0];
  if (!primary) return [];

  const base = asAbility(primary, lang);
  const extra = asAbility(secondary, lang);
  const kindExtra: Record<TopicEntry["kind"], Bilingual> = {
    concept: {
      ru: "обосновать закономерность и привести контрпример",
      kk: "заңдылықты негіздеп, қарсы мысал келтіру",
    },
    experiment: {
      ru: "самостоятельно спланировать опыт и оценить достоверность результата",
      kk: "тәжірибені өз бетінше жоспарлап, нәтиженің дәйектілігін бағалау",
    },
    calculation: {
      ru: "решить задачу с обратным ходом и оценить погрешность",
      kk: "кері жүрісті есепті шығарып, қателікті бағалау",
    },
    equation: {
      ru: "составить цепочку превращений и предложить альтернативный путь",
      kk: "түрлену тізбегін құрып, баламалы жол ұсыну",
    },
  };

  if (lang === "ru") {
    return [
      `Все обучающиеся смогут: ${base}.`,
      `Большинство обучающихся смогут: ${extra}, объясняя ход рассуждения.`,
      `Некоторые обучающиеся смогут: ${kindExtra[topic.kind].ru}.`,
    ];
  }
  return [
    `Барлық оқушылар: ${base}.`,
    `Оқушылардың көпшілігі: ${extra}, ой қорытындысының барысын түсіндіре отырып.`,
    `Кейбір оқушылар: ${kindExtra[topic.kind].kk}.`,
  ];
}

/** Распределение времени по трём этапам. Середина получает остаток. */
export function splitTime(total: number): Record<StageId, number> {
  const safeTotal = Math.max(10, Math.round(total));
  const start = Math.min(10, Math.max(5, Math.round(safeTotal * 0.17)));
  const end = Math.min(8, Math.max(4, Math.round(safeTotal * 0.15)));
  const middle = Math.max(1, safeTotal - start - end);
  return { start, middle, end };
}

/** Подпись строки таблицы: «Начало урока (0–7 мин)». */
export function stageTitle(
  stage: LessonStage,
  lang: Lang,
  compact = false,
): string {
  const label = STAGE_LABELS[stage.id][lang];
  const to = stage.fromMinute + stage.minutes;
  const unit = UI.minutesShort[lang];
  const range = `${stage.fromMinute}–${to} ${unit}`;
  return compact ? `${label}\n${range}` : `${label} (${range})`;
}

function methodById(id: string): TeachingMethod {
  return METHODS.find((m) => m.id === id) ?? METHODS[0];
}

function assessmentFor(stage: StageId, seed: number, offset: number): Bilingual {
  const pool = ASSESSMENT.filter((a) => a.stages.includes(stage));
  return pick(pool, seed, offset).inPlan;
}

/** Собирает содержимое трёх этапов урока. */
function buildStages(
  topic: TopicEntry,
  experiment: Experiment,
  lang: Lang,
  duration: number,
  seed: number,
): LessonStage[] {
  const time = splitTime(duration);
  const primaryMethod = methodById(topic.methods[0] ?? "critical");
  const secondMethod = methodById(topic.methods[1] ?? "group");
  const diff = DIFFERENTIATION[topic.kind];

  const ru = lang === "ru";

  const start: LessonStage = {
    id: "start",
    fromMinute: 0,
    minutes: time.start,
    teacher: ru
      ? [
          "Организационный момент: приветствие, проверка готовности рабочих мест и наличия тетрадей.",
          "Создание коллаборативной среды: приём «Комплимент соседу» для настроя на совместную работу.",
          `Актуализация: фронтальный опрос по опорным знаниям — ${lowerFirst(trimDot(topic.priorKnowledge.ru))}.`,
          `Постановка проблемы: ${primaryMethod.teacher.ru}`,
          "Совместное формулирование целей урока и критериев успеха, запись темы в тетрадь.",
        ].join("\n")
      : [
          "Ұйымдастыру кезеңі: сәлемдесу, жұмыс орындарының дайындығы мен дәптерлердің болуын тексеру.",
          "Ынтымақтастық ортасын құру: бірлескен жұмысқа көңіл-күй орнату үшін «Көршіңе мақтау» тәсілі.",
          `Өзектендіру: тірек білім бойынша фронталды сұрау — ${lowerFirst(trimDot(topic.priorKnowledge.kk))}.`,
          `Проблема қою: ${primaryMethod.teacher.kk}`,
          "Сабақ мақсаттары мен табыс критерийлерін бірлесіп тұжырымдау, тақырыпты дәптерге жазу.",
        ].join("\n"),
    student: ru
      ? [
          "Отвечают на вопросы по ранее изученному, вспоминают нужные понятия и обозначения.",
          `${primaryMethod.student.ru}`,
          "Записывают тему и проговаривают, по каким признакам поймут, что цель урока достигнута.",
        ].join("\n")
      : [
          "Бұрын өтілген бойынша сұрақтарға жауап береді, қажетті ұғымдар мен белгілеулерді еске түсіреді.",
          `${primaryMethod.student.kk}`,
          "Тақырыпты жазып, сабақ мақсатына жеткенін қандай белгілер бойынша түсінетінін айтады.",
        ].join("\n"),
    assessment: assessmentFor("start", seed, 0)[lang],
    resources: ru
      ? "Презентация, периодическая таблица, тетрадь, доска; карточки с опорными вопросами."
      : "Презентация, периодтық кесте, дәптер, тақта; тірек сұрақтары бар карточкалар.",
  };

  const middle: LessonStage = {
    id: "middle",
    fromMinute: time.start,
    minutes: time.middle,
    teacher: ru
      ? [
          `Объяснение нового материала порциями с остановками на обсуждение: ${lowerFirst(trimDot(sectionTitle(topic, "ru")))}.`,
          `Инструктаж по технике безопасности перед практической частью: ${trimDot(experiment.safety.ru)}.`,
          `Организация опыта «${experiment.title.ru}». Оборудование и реактивы: ${lowerFirst(trimDot(experiment.materials.ru))}.`,
          `Ход работы: ${trimDot(experiment.procedure.ru)}.`,
          `${secondMethod.teacher.ru}`,
          `Дифференциация. Поддержка: ${lowerFirst(trimDot(diff.support.ru))}. Усложнение: ${lowerFirst(trimDot(diff.challenge.ru))}.`,
          `Если реактивов или вытяжного шкафа нет: ${lowerFirst(trimDot(experiment.virtual.ru))}.`,
        ].join("\n")
      : [
          `Жаңа материалды талқылауға тоқтай отырып, бөліктеп түсіндіру: ${lowerFirst(trimDot(sectionTitle(topic, "kk")))}.`,
          `Практикалық бөлім алдында қауіпсіздік техникасы бойынша нұсқаулық: ${trimDot(experiment.safety.kk)}.`,
          `«${experiment.title.kk}» тәжірибесін ұйымдастыру. Жабдық пен реактивтер: ${lowerFirst(trimDot(experiment.materials.kk))}.`,
          `Жұмыс барысы: ${trimDot(experiment.procedure.kk)}.`,
          `${secondMethod.teacher.kk}`,
          `Саралау. Қолдау: ${lowerFirst(trimDot(diff.support.kk))}. Күрделендіру: ${lowerFirst(trimDot(diff.challenge.kk))}.`,
          `Реактивтер немесе сору шкафы болмаса: ${lowerFirst(trimDot(experiment.virtual.kk))}.`,
        ].join("\n"),
    student: ru
      ? [
          "Конспектируют ключевые положения, задают уточняющие вопросы.",
          "Выполняют опыт в группе по ролям: экспериментатор, хронометрист, секретарь, спикер.",
          "Фиксируют наблюдения в таблице, записывают уравнения реакций и формулируют вывод.",
          `${secondMethod.student.ru}`,
          "Спикеры групп представляют результат классу, остальные дополняют и уточняют.",
        ].join("\n")
      : [
          "Негізгі тұжырымдарды конспектілейді, нақтылаушы сұрақ қояды.",
          "Тәжірибені топта рөлдер бойынша орындайды: эксперимент жүргізуші, уақыт өлшеуші, хатшы, спикер.",
          "Бақылауларды кестеге түсіреді, реакция теңдеулерін жазып, қорытынды тұжырымдайды.",
          `${secondMethod.student.kk}`,
          "Топ спикерлері нәтижені сыныпқа таныстырады, қалғандары толықтырып, нақтылайды.",
        ].join("\n"),
    assessment: [
      assessmentFor("middle", seed, 1)[lang],
      assessmentFor("middle", seed, 2)[lang],
    ].join("\n"),
    resources: ru
      ? `Лабораторное оборудование и реактивы по списку опыта; таблица наблюдений; карточки дифференциации; ${lowerFirst(trimDot(experiment.virtual.ru))}.`
      : `Тәжірибе тізімі бойынша зертханалық жабдық пен реактивтер; бақылау кестесі; саралау карточкалары; ${lowerFirst(trimDot(experiment.virtual.kk))}.`,
  };

  const end: LessonStage = {
    id: "end",
    fromMinute: time.start + time.middle,
    minutes: time.end,
    teacher: ru
      ? [
          "Закрепление: возврат к проблемному вопросу начала урока, проверка первоначальной гипотезы.",
          "Соотнесение результата с критериями успеха, краткая обратная связь группам.",
          "Рефлексия по приёму «Три предложения»: что узнал, что получилось, что осталось непонятным.",
          "Домашнее задание с комментарием: обязательная часть для всех и задание повышенного уровня по выбору.",
        ].join("\n")
      : [
          "Бекіту: сабақ басындағы проблемалық сұраққа оралу, бастапқы болжамды тексеру.",
          "Нәтижені табыс критерийлерімен салыстыру, топтарға қысқаша кері байланыс.",
          "«Үш сөйлем» тәсілі бойынша рефлексия: не білдім, не сәтті шықты, не түсініксіз қалды.",
          "Түсініктемесі бар үй тапсырмасы: барлығына міндетті бөлім және таңдау бойынша жоғары деңгейдегі тапсырма.",
        ].join("\n"),
    student: ru
      ? [
          "Возвращаются к гипотезе и формулируют итоговый вывод урока.",
          "Проводят самооценивание по критериям и заполняют рефлексивный лист.",
          "Записывают домашнее задание и уточняют непонятное.",
        ].join("\n")
      : [
          "Болжамға оралып, сабақтың қорытынды тұжырымын жасайды.",
          "Критерийлер бойынша өзін-өзі бағалап, рефлексия парағын толтырады.",
          "Үй тапсырмасын жазып, түсініксіз тұстарын нақтылайды.",
        ].join("\n"),
    assessment: assessmentFor("end", seed, 3)[lang],
    resources: ru
      ? "Стикеры для выходного билета, рефлексивный лист, учебник, дневник."
      : "Шығу билетіне арналған стикерлер, рефлексия парағы, оқулық, күнделік.",
  };

  return [start, middle, end];
}

/** Собирает расширенные методические блоки (уровень B). */
function buildExtras(
  topic: TopicEntry,
  experiment: Experiment,
  lang: Lang,
  seed: number,
): KspExtras {
  const diff = DIFFERENTIATION[topic.kind];
  const ru = lang === "ru";

  const languageGoals = topic.terms.length
    ? (ru
        ? "Ключевая лексика и терминология: "
        : "Негізгі лексика және терминология: ") +
      topic.terms
        .map((term) => `${term.ru} — ${term.kk} — ${term.en}`)
        .join("; ") +
      (ru
        ? ". Речевой образец для описания наблюдения: «При добавлении … наблюдается …, следовательно, произошла реакция …»."
        : ". Бақылауды сипаттауға арналған тілдік үлгі: «… қосқанда … байқалады, демек, … реакциясы жүрді».")
    : ru
      ? "Термины темы вводятся в триплете казахский — русский — английский; речевые опоры даются для описания наблюдений."
      : "Тақырып терминдері қазақша — орысша — ағылшынша үштікте енгізіледі; бақылауды сипаттауға тілдік тіректер беріледі.";

  return {
    criteria: topic.criteria
      .map((criterion, index) => `${index + 1}. ${criterion[lang]}`)
      .join("\n"),
    descriptors:
      (ru ? "Обучающийся:\n" : "Оқушы:\n") +
      topic.descriptors
        .map((descriptor) => `— ${descriptor[lang]};`)
        .join("\n"),
    languageGoals,
    values: pick(VALUES, seed, 0)[lang],
    crossCurricular: topic.crossCurricular[lang],
    priorKnowledge: topic.priorKnowledge[lang],
    differentiationSupport: diff.support[lang],
    differentiationChallenge: diff.challenge[lang],
    safety: `${BASE_SAFETY[lang]}\n${experiment.safety[lang]}`,
    reflection: ru
      ? "Достигнуты ли цели урока? Все ли обучающиеся справились с опытом и записью уравнений? Что в объяснении стоит изменить на следующем уроке? Кому нужна дополнительная поддержка?"
      : "Сабақ мақсаттарына қол жеткізілді ме? Барлық оқушы тәжірибе мен теңдеулерді жазуды орындай алды ма? Келесі сабақта түсіндіруде нені өзгерту керек? Кімге қосымша қолдау қажет?",
  };
}

export interface GenerateResult {
  plan: KspPlan;
  /** Тема найдена в базе знаний или собран универсальный каркас. */
  matched: boolean;
  topicId: string;
  experimentTitle: string;
  methodName: string;
}

/** Главная точка входа: три поля учителя → готовый краткосрочный план. */
export function generatePlan(input: LessonInput, lang: Lang): GenerateResult {
  const { topic, matched } = matchTopic(input.topic, input.grade);
  const seed = hash(input.topic || topic.id);
  const experiment = pick(topic.experiments, seed);
  const objectives = parseObjectives(input.objectivesRaw);
  const stages = buildStages(topic, experiment, lang, input.durationMinutes, seed);
  const extras = buildExtras(topic, experiment, lang, seed);
  const primaryMethod = methodById(topic.methods[0] ?? "critical");

  const plan: KspPlan = {
    header: {
      section: sectionTitle(topic, lang),
      teacher: input.teacher,
      date: input.date,
      grade: input.grade,
      present: input.present,
      absent: input.absent,
      topic: input.topic,
      objectives,
      lessonGoals: buildLessonGoals(objectives, topic, lang),
    },
    durationMinutes: input.durationMinutes,
    stages,
    extras,
    enabled: { ...DEFAULT_ENABLED },
  };

  return {
    plan,
    matched,
    topicId: topic.id,
    experimentTitle: experiment.title[lang],
    methodName: primaryMethod.name[lang],
  };
}
