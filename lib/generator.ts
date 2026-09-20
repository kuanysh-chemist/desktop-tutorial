/**
 * Детерминированный движок генерации КСП.
 *
 * Вход — три поля, которые заполняет учитель (тема, цели обучения, время
 * урока) плюс реквизиты шапки. Выход — заполненный краткосрочный план,
 * пригодный к ручному редактированию и экспорту.
 *
 * Работает офлайн: содержание собирается из lib/chemistry-kb.ts,
 * lib/active-methods.ts, lib/ict.ts, lib/pedagogy.ts и lib/lesson-blocks.ts.
 * Claude API подключается поверх как необязательная доработка формулировок.
 *
 * Сценарий урока не зашит в код: сначала собирается «рецепт» — набор приёмов,
 * цифровых ресурсов и связующих формулировок, — и только потом из него
 * складываются три этапа. Параметр variant сдвигает выбор, поэтому по одной
 * и той же теме можно получить другой урок, а не тот же текст.
 */
import {
  matchTopic,
  sectionTitle,
  type Experiment,
  type TopicEntry,
} from "./chemistry-kb";
import {
  activePool,
  boundReflection,
  type ActiveMethod,
} from "./active-methods";
import { ictPool, type IctResource } from "./ict";
import {
  ASSESSMENT,
  BASE_SAFETY,
  DIFFERENTIATION,
  HOMEWORK,
  METHODS,
  VALUES,
  type DifferentiationPattern,
  type HomeworkOption,
  type TeachingMethod,
} from "./pedagogy";
import {
  BASE_RESOURCES,
  CONSOLIDATION,
  CONSOLIDATION_STUDENT,
  EXPERIMENT_STUDENT,
  FEEDBACK_LINE,
  GOAL_SETTING,
  GOAL_SETTING_STUDENT,
  HOMEWORK_STUDENT,
  ORG_MOMENT,
  REPORT_LINE,
} from "./lesson-blocks";
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

/**
 * Выбор элементов из пулов.
 *
 * Стартовая позиция каждого пула берётся из хеша «тема + номер позиции»,
 * поэтому разные позиции плана начинают с разных мест и не движутся строем.
 * Номер варианта добавляет ровно единицу: это гарантирует, что при переходе
 * к следующему варианту каждый пул длиннее одного элемента отдаёт другой
 * элемент. Умножать сдвиг на номер варианта нельзя — множитель может
 * оказаться кратным длине пула, и тогда приём не меняется никогда.
 */
function makePicker(seed: number, variant: number) {
  let slot = 0;
  return function pick<T>(items: T[]): T {
    if (items.length === 0) throw new Error("Пустой пул вариантов");
    slot += 1;
    const base = hash(`${seed}|${slot}`);
    return items[(base + variant) % items.length];
  };
}

/** Отбрасывает уже использованные элементы, если после этого пул не пуст. */
function without<T extends { id: string }>(pool: T[], used: Set<string>): T[] {
  const rest = pool.filter((item) => !used.has(item.id));
  return rest.length ? rest : pool;
}

/**
 * Оставляет приёмы, укладывающиеся в отведённое время этапа. Если не влезает
 * ни один, возвращаются самые короткие: взять весь пул означало бы поставить
 * в сорокаминутный урок восемнадцатиминутную ротацию по станциям.
 */
function fitting(pool: ActiveMethod[], budget: number): ActiveMethod[] {
  const fits = pool.filter((m) => m.minutes <= budget);
  if (fits.length) return fits;
  const shortest = Math.min(...pool.map((m) => m.minutes));
  return pool.filter((m) => m.minutes === shortest);
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
 * Признак первый и главный: слово начинается с латиницы. В русском и
 * казахском тексте так начинаются только обозначения — «NaCl», «PhET»,
 * «U-образная трубка», «I» (ток), — и опускать у них регистр нельзя.
 * Остальные два признака ловят кириллические сокращения («ЗХУ») и записи
 * с индексами («H₂O»).
 */
function lowerFirst(text: string): string {
  const raw = text.split(/\s/, 1)[0] ?? "";
  const firstWord = raw.replace(/[.,;:!?)»"'"]+$/, "");
  const looksLikeFormula =
    /^[A-Za-z]/.test(firstWord) ||
    /[A-ZА-Я]/.test(firstWord.slice(1)) ||
    /[0-9₀-₉]/.test(firstWord);
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

/**
 * Набор блоков, из которых собирается урок. Собирается один раз, чтобы
 * этапы и методические блоки (дифференциация, ценности) не расходились
 * между собой.
 */
interface Recipe {
  warmup: ActiveMethod;
  activation: ActiveMethod;
  study: ActiveMethod;
  /** Приём применения. Его может не быть: на опытном уроке не остаётся времени. */
  practice?: ActiveMethod;
  reflection: ActiveMethod;
  primaryMethod: TeachingMethod;
  diff: DifferentiationPattern;
  homework: HomeworkOption;
  ict: Record<StageId, IctResource>;
  ictExtra: IctResource;
  assessment: Record<"start" | "middleA" | "middleB" | "end", Bilingual>;
  org: Bilingual;
  goalIndex: number;
  consolidationIndex: number;
  experimentStudent: Bilingual;
  report: Bilingual;
  feedback: Bilingual;
  homeworkStudent: Bilingual;
  baseResources: Record<StageId, Bilingual>;
  value: Bilingual;
}

function buildRecipe(
  topic: TopicEntry,
  duration: number,
  seed: number,
  variant: number,
): Recipe {
  const pick = makePicker(seed, variant);
  const time = splitTime(duration);
  const kind = topic.kind;

  const warmup = pick(activePool("warmup", kind));
  const activation = pick(activePool("activation", kind));
  // Середина урока раскладывается по времени. Практическая часть занимает
  // её ядро — на лабораторной теме почти половину, — и приёмы подбираются
  // из того, что останется. Если на приём применения времени не хватает,
  // его не будет вовсе: лучше пустая строка, чем план на 60 минут в
  // сорокаминутном уроке.
  const freeMinutes = Math.max(
    4,
    Math.round(time.middle * (kind === "experiment" ? 0.55 : 0.75)),
  );
  const study = pick(
    fitting(activePool("study", kind), Math.max(4, Math.round(freeMinutes * 0.6))),
  );
  const practiceBudget = freeMinutes - study.minutes;
  const practicePool = activePool("practice", kind).filter(
    (m) => m.minutes <= practiceBudget,
  );
  const practice = practicePool.length ? pick(practicePool) : undefined;
  // Если начало урока оставило артефакт — таблицу ЗХУ, кластер, лист
  // утверждений, — рефлексия возвращает класс именно к нему.
  const reflection =
    boundReflection(activation.id) ?? pick(activePool("reflection", kind));

  const assessmentStart = pick(ASSESSMENT.filter((a) => a.stages.includes("start")));
  // Один и тот же приём дважды за урок — это не оценивание, а привычка,
  // поэтому каждый следующий этап выбирает из ещё не занятых.
  const middlePool = without(
    ASSESSMENT.filter((a) => a.stages.includes("middle")),
    new Set([assessmentStart.id]),
  );
  const middleA = pick(middlePool);
  const middleB = pick(without(middlePool, new Set([middleA.id])));
  const assessmentEnd = pick(
    without(
      ASSESSMENT.filter((a) => a.stages.includes("end")),
      new Set([assessmentStart.id, middleA.id, middleB.id]),
    ),
  );

  // Если срез проводится цифровым опросом, сервис для него обязан оказаться
  // в графе «Ресурсы» — иначе оценивание ссылается на то, чего в плане нет.
  const quizOnly = (pool: IctResource[]) => {
    const quiz = pool.filter((r) => r.purpose === "quiz");
    return quiz.length ? quiz : pool;
  };
  const startIctPool =
    assessmentStart.id === "quiz-instant"
      ? quizOnly(ictPool("start", kind))
      : ictPool("start", kind);
  const ictStart = pick(startIctPool);
  const ictMiddle = pick(without(ictPool("middle", kind), new Set([ictStart.id])));
  const ictExtra = pick(
    without(ictPool("middle", kind), new Set([ictStart.id, ictMiddle.id])),
  );
  const endIctPool = without(
    assessmentEnd.id === "quiz-instant"
      ? quizOnly(ictPool("end", kind))
      : ictPool("end", kind),
    new Set([ictStart.id, ictMiddle.id, ictExtra.id]),
  );
  const ictEnd = pick(endIctPool);

  const homeworkPool = HOMEWORK.filter(
    (h) => h.kinds.length === 0 || h.kinds.includes(kind),
  );

  return {
    warmup,
    activation,
    study,
    practice,
    reflection,
    primaryMethod: methodById(topic.methods[0] ?? "critical"),
    diff: pick(DIFFERENTIATION[kind]),
    homework: pick(homeworkPool),
    ict: { start: ictStart, middle: ictMiddle, end: ictEnd },
    ictExtra,
    assessment: {
      start: assessmentStart.inPlan,
      middleA: middleA.inPlan,
      middleB: middleB.inPlan,
      end: assessmentEnd.inPlan,
    },
    org: pick(ORG_MOMENT),
    goalIndex: pick(GOAL_SETTING.map((_, i) => i)),
    consolidationIndex: pick(CONSOLIDATION.map((_, i) => i)),
    experimentStudent: pick(EXPERIMENT_STUDENT),
    report: pick(REPORT_LINE),
    feedback: pick(FEEDBACK_LINE),
    homeworkStudent: pick(HOMEWORK_STUDENT),
    baseResources: {
      start: pick(BASE_RESOURCES.start),
      middle: pick(BASE_RESOURCES.middle),
      end: pick(BASE_RESOURCES.end),
    },
    value: pick(VALUES),
  };
}

/** Строка ресурсов: материальная часть плюс обязательный цифровой ресурс. */
function resourceLine(
  base: Bilingual,
  ict: IctResource[],
  lang: Lang,
): string {
  const label = lang === "ru" ? "ИКТ" : "АКТ";
  const digital = ict.map((r) => r.inPlan[lang]).join(" ");
  return `${trimDot(base[lang])}. ${label}: ${digital}`;
}

/** Собирает содержимое трёх этапов урока из рецепта. */
function buildStages(
  topic: TopicEntry,
  experiment: Experiment,
  lang: Lang,
  duration: number,
  recipe: Recipe,
): LessonStage[] {
  const time = splitTime(duration);
  const ru = lang === "ru";
  const L = <T extends Bilingual>(b: T): string => b[lang];

  const start: LessonStage = {
    id: "start",
    fromMinute: 0,
    minutes: time.start,
    teacher: [
      L(recipe.org),
      `${L(recipe.warmup.name)}. ${L(recipe.warmup.teacher)}`,
      `${L(recipe.activation.name)}. ${L(recipe.activation.teacher)} ${
        ru ? "Опора на изученное ранее: " : "Бұрын меңгерілгенге сүйену: "
      }${lowerFirst(trimDot(L(topic.priorKnowledge)))}.`,
      L(GOAL_SETTING[recipe.goalIndex]),
    ].join("\n"),
    student: [
      L(recipe.warmup.student),
      L(recipe.activation.student),
      L(GOAL_SETTING_STUDENT[recipe.goalIndex]),
    ].join("\n"),
    assessment: L(recipe.assessment.start),
    resources: resourceLine(recipe.baseResources.start, [recipe.ict.start], lang),
  };

  const middle: LessonStage = {
    id: "middle",
    fromMinute: time.start,
    minutes: time.middle,
    teacher: [
      `${ru ? "Ведущая методика урока — " : "Сабақтың жетекші әдістемесі — "}${lowerFirst(L(recipe.primaryMethod.name))}. ${L(recipe.primaryMethod.teacher)}`,
      `${ru ? "Изучение нового материала раздела" : "Бөлімнің жаңа материалын меңгеру"} «${sectionTitle(topic, lang)}». ${L(recipe.study.name)}. ${L(recipe.study.teacher)}`,
      `${
        ru
          ? "Инструктаж по технике безопасности перед практической частью: "
          : "Практикалық бөлім алдында қауіпсіздік техникасы бойынша нұсқаулық: "
      }${lowerFirst(trimDot(L(experiment.safety)))}.`,
      `${ru ? "Организация опыта" : "Тәжірибені ұйымдастыру"} «${L(experiment.title)}». ${
        ru ? "Оборудование и реактивы: " : "Жабдық пен реактивтер: "
      }${lowerFirst(trimDot(L(experiment.materials)))}. ${ru ? "Ход работы: " : "Жұмыс барысы: "}${lowerFirst(trimDot(L(experiment.procedure)))}.`,
      recipe.practice
        ? `${L(recipe.practice.name)}. ${L(recipe.practice.teacher)}`
        : "",
      `${ru ? "Дифференциация. Поддержка: " : "Саралау. Қолдау: "}${lowerFirst(trimDot(L(recipe.diff.support)))}. ${
        ru ? "Усложнение: " : "Күрделендіру: "
      }${lowerFirst(trimDot(L(recipe.diff.challenge)))}.`,
      `${
        ru
          ? "Если реактивов или вытяжного шкафа нет: "
          : "Реактивтер немесе сору шкафы болмаса: "
      }${lowerFirst(trimDot(L(experiment.virtual)))}.`,
    ]
      .filter(Boolean)
      .join("\n"),
    student: [
      L(recipe.primaryMethod.student),
      L(recipe.study.student),
      L(recipe.experimentStudent),
      recipe.practice ? L(recipe.practice.student) : "",
      L(recipe.report),
    ]
      .filter(Boolean)
      .join("\n"),
    assessment: [L(recipe.assessment.middleA), L(recipe.assessment.middleB)].join("\n"),
    resources: resourceLine(
      recipe.baseResources.middle,
      [recipe.ict.middle, recipe.ictExtra],
      lang,
    ),
  };

  const end: LessonStage = {
    id: "end",
    fromMinute: time.start + time.middle,
    minutes: time.end,
    teacher: [
      L(CONSOLIDATION[recipe.consolidationIndex]),
      `${L(recipe.reflection.name)}. ${L(recipe.reflection.teacher)}`,
      L(recipe.feedback),
      `${ru ? "Домашнее задание. " : "Үй тапсырмасы. "}${L(recipe.homework.text)}`,
    ].join("\n"),
    student: [
      L(CONSOLIDATION_STUDENT[recipe.consolidationIndex]),
      L(recipe.reflection.student),
      L(recipe.homeworkStudent),
    ].join("\n"),
    assessment: L(recipe.assessment.end),
    resources: resourceLine(recipe.baseResources.end, [recipe.ict.end], lang),
  };

  return [start, middle, end];
}

/** Собирает расширенные методические блоки (уровень B). */
function buildExtras(
  topic: TopicEntry,
  experiment: Experiment,
  lang: Lang,
  recipe: Recipe,
): KspExtras {
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
    values: recipe.value[lang],
    crossCurricular: topic.crossCurricular[lang],
    priorKnowledge: topic.priorKnowledge[lang],
    differentiationSupport: recipe.diff.support[lang],
    differentiationChallenge: recipe.diff.challenge[lang],
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
  /** Номер сценария: та же тема с другим variant даёт другой урок. */
  variant: number;
  /** Названия активных приёмов урока — для подсказки в интерфейсе. */
  activeMethods: string[];
  /** Названия задействованных цифровых ресурсов. */
  ictNames: string[];
}

/** Главная точка входа: три поля учителя → готовый краткосрочный план. */
export function generatePlan(
  input: LessonInput,
  lang: Lang,
  variant = 0,
): GenerateResult {
  const { topic, matched } = matchTopic(input.topic, input.grade);
  const seed = hash(input.topic || topic.id);
  const safeVariant = Math.max(0, Math.round(variant));
  const experiment =
    topic.experiments[(seed + safeVariant) % topic.experiments.length];
  const objectives = parseObjectives(input.objectivesRaw);
  const recipe = buildRecipe(topic, input.durationMinutes, seed, safeVariant);
  const stages = buildStages(topic, experiment, lang, input.durationMinutes, recipe);
  const extras = buildExtras(topic, experiment, lang, recipe);

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
    methodName: recipe.primaryMethod.name[lang],
    variant: safeVariant,
    activeMethods: [
      recipe.warmup,
      recipe.activation,
      recipe.study,
      recipe.practice,
      recipe.reflection,
    ]
      .filter((m): m is ActiveMethod => Boolean(m))
      .map((m) => m.name[lang]),
    ictNames: [
      recipe.ict.start,
      recipe.ict.middle,
      recipe.ictExtra,
      recipe.ict.end,
    ].map((r) => r.name[lang]),
  };
}
