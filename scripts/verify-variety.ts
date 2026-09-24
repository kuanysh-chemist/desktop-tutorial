/**
 * Проверка разнообразия планов.
 *
 * Поводом стала жалоба, которую не ловила ни одна из прежних проверок:
 * планы формально правильные, но почти одинаковые. Здесь измеряется то,
 * на что жаловался учитель: доля уникальных строк в каждой колонке,
 * самая назойливая строка, наличие ИКТ и активных методов в каждом плане.
 *
 * Запуск: npx tsx scripts/verify-variety.ts
 */
import { TOPICS } from "../lib/chemistry-kb";
import { generatePlan } from "../lib/generator";
import { ICT } from "../lib/ict";
import type { LessonInput, LessonOptions } from "../lib/types";

/** Берём темы по всей программе, а не подряд: важен разброс по классам. */
const SAMPLE = TOPICS.filter((_, index) => index % 4 === 0);

function inputFor(topicRu: string, grade: number): LessonInput {
  return {
    topic: topicRu,
    objectivesRaw: `${grade}.1.1.1 объяснять изучаемое явление и применять знание на практике`,
    durationMinutes: 45,
    grade: String(grade),
    teacher: "Педагог",
    date: "2026-09-21",
    present: "24",
    absent: "1",
  };
}

interface ColumnStats {
  total: number;
  unique: number;
  topLine: string;
  topCount: number;
  /** Средняя доля общих строк у двух случайно взятых планов. */
  similarity: number;
}

/**
 * Доля уникальных строк сама по себе обманчива: она ограничена размером
 * пула. Если приёмов оценивания семнадцать, а планов двадцать семь, выше
 * 17/108 эта доля не поднимется никогда, даже при идеальном разбросе.
 * Поэтому решающая метрика здесь — попарное сходство планов (Жаккар):
 * именно его учитель и видит, когда говорит «все КСП почти одинаковы».
 */
function analyse(lines: string[][]): ColumnStats {
  const flat = lines.flat();
  const perPlan = lines.map((l) => new Set(l));
  const counts = new Map<string, number>();
  for (const set of perPlan) {
    for (const line of set) counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  let topLine = "";
  let topCount = 0;
  for (const [line, count] of counts) {
    if (count > topCount) {
      topCount = count;
      topLine = line;
    }
  }

  let similaritySum = 0;
  let pairs = 0;
  for (let a = 0; a < perPlan.length; a++) {
    for (let b = a + 1; b < perPlan.length; b++) {
      const shared = [...perPlan[a]].filter((line) => perPlan[b].has(line)).length;
      const union = new Set([...perPlan[a], ...perPlan[b]]).size;
      similaritySum += union ? shared / union : 0;
      pairs += 1;
    }
  }

  return {
    total: flat.length,
    unique: counts.size,
    topLine,
    topCount,
    similarity: pairs ? similaritySum / pairs : 0,
  };
}

const failures: string[] = [];

function check(label: string, ok: boolean, detail: string): void {
  console.log(`${ok ? "  ok" : "FAIL"}  ${label}: ${detail}`);
  if (!ok) failures.push(`${label}: ${detail}`);
}

// ——— Сбор планов по всей выборке тем ———
const columns: Record<string, string[][]> = {
  teacher: [],
  student: [],
  assessment: [],
  resources: [],
};
let plansWithoutIct = 0;
let stagesWithoutIct = 0;

for (const topic of SAMPLE) {
  // Первое ключевое слово темы — самое близкое к тому, что вводит учитель.
  const query = topic.keywords[0] ?? topic.id;
  const result = generatePlan(inputFor(query, topic.grade), "ru", 0);
  for (const key of Object.keys(columns)) {
    columns[key].push(
      result.plan.stages.flatMap((stage) =>
        String(stage[key as "teacher"]).split("\n").filter(Boolean),
      ),
    );
  }
  const withIct = result.plan.stages.filter((s) => s.resources.includes("ИКТ:"));
  stagesWithoutIct += result.plan.stages.length - withIct.length;
  if (withIct.length === 0) plansWithoutIct += 1;
}

console.log(`Тем в выборке: ${SAMPLE.length}\n`);
console.log("Разнообразие строк по колонкам:");

/**
 * Сколько различных формулировок должно встретиться по колонке на выборке.
 * До перестройки генератора было 131 / 15 / 6 / 22 — отсюда и жалоба.
 */
const UNIQUE_MIN: Record<string, number> = {
  teacher: 150,
  student: 55,
  assessment: 14,
  resources: 55,
};
/** Предельное сходство двух случайных планов по колонке. */
const SIMILARITY_MAX: Record<string, number> = {
  teacher: 0.3,
  student: 0.3,
  assessment: 0.2,
  resources: 0.15,
};
/** Ни одна формулировка не должна стоять почти во всех планах. */
const REPEAT_MAX = 0.6;

for (const [name, lines] of Object.entries(columns)) {
  const stats = analyse(lines);
  const repeat = stats.topCount / SAMPLE.length;
  check(
    `«${name}» различных формулировок`,
    stats.unique >= UNIQUE_MIN[name],
    `${stats.unique} из ${stats.total} строк (порог ${UNIQUE_MIN[name]})`,
  );
  check(
    `«${name}» сходство двух планов`,
    stats.similarity <= SIMILARITY_MAX[name],
    `${(stats.similarity * 100).toFixed(0)} % общих строк (порог ${(SIMILARITY_MAX[name] * 100).toFixed(0)} %)`,
  );
  check(
    `«${name}» самая частая строка`,
    repeat <= REPEAT_MAX,
    `${stats.topCount} из ${SAMPLE.length} планов (${(repeat * 100).toFixed(0)} %) — «${stats.topLine.slice(0, 60)}…»`,
  );
}

console.log("\nИКТ и активные методы:");
check("ИКТ есть в каждом плане", plansWithoutIct === 0, `планов без ИКТ: ${plansWithoutIct}`);
check(
  "ИКТ есть на каждом этапе",
  stagesWithoutIct === 0,
  `этапов без ИКТ: ${stagesWithoutIct} из ${SAMPLE.length * 3}`,
);

// ——— Варианты одной темы должны расходиться ———
console.log("\nПерегенерация того же урока (кнопка «Другой вариант»):");
let sameVariantPairs = 0;
let variantOverlapTotal = 0;
let variantPairs = 0;
for (const topic of SAMPLE) {
  const query = topic.keywords[0] ?? topic.id;
  const sets = [0, 1, 2].map(
    (v) => new Set(generatePlan(inputFor(query, topic.grade), "ru", v).activeMethods),
  );
  for (let a = 0; a < sets.length; a++) {
    for (let b = a + 1; b < sets.length; b++) {
      const overlap = [...sets[a]].filter((m) => sets[b].has(m)).length;
      variantOverlapTotal += overlap;
      variantPairs += 1;
      // Наборы бывают из четырёх приёмов: на опытной теме приём применения
      // не ставится, потому что на него не остаётся времени.
      const identical =
        sets[a].size === sets[b].size && overlap === sets[a].size;
      if (identical) sameVariantPairs += 1;
    }
  }
}
check(
  "варианты не совпадают полностью",
  sameVariantPairs === 0,
  `пар вариантов с полностью совпавшим набором приёмов: ${sameVariantPairs} из ${variantPairs}`,
);
check(
  "среднее пересечение приёмов между вариантами",
  variantOverlapTotal / variantPairs <= 1.5,
  `${(variantOverlapTotal / variantPairs).toFixed(2)} приёма из 4–5`,
);

// ——— Активные методы в каждом плане ———
console.log("\nПокрытие каталога активных методов:");
const usedMethods = new Set<string>();
const usedIct = new Set<string>();
for (const topic of SAMPLE) {
  const query = topic.keywords[0] ?? topic.id;
  for (const v of [0, 1, 2]) {
    const r = generatePlan(inputFor(query, topic.grade), "ru", v);
    r.activeMethods.forEach((m) => usedMethods.add(m));
    r.ictNames.forEach((n) => usedIct.add(n));
  }
}
check("задействовано активных приёмов", usedMethods.size >= 25, `${usedMethods.size}`);
check("задействовано ИКТ-ресурсов", usedIct.size >= 15, `${usedIct.size}`);


// ——— Тумблеры современных подходов обязаны менять сам план ———
console.log("\nТумблеры CLIL, виртуальной лаборатории и геймификации:");
const SIMULATIONS = ICT.filter((r) => r.purpose === "simulation").map((r) => r.inPlan.ru);
const QUIZZES = ICT.filter((r) => r.purpose === "quiz").map((r) => r.inPlan.ru);

function resourcesOf(topicRu: string, grade: number, options: LessonOptions): string {
  const plan = generatePlan(
    { ...inputFor(topicRu, grade), options },
    "ru",
    0,
  ).plan;
  return plan.stages.map((stage) => stage.resources).join("\n");
}

let withoutSimulation = 0;
let withoutQuiz = 0;
let withoutClil = 0;
for (const topic of SAMPLE) {
  const query = topic.keywords[0] ?? topic.id;
  const lab = resourcesOf(query, topic.grade, {
    clil: false,
    virtualLab: true,
    gamification: false,
  });
  if (!SIMULATIONS.some((text) => lab.includes(text))) withoutSimulation += 1;

  const game = resourcesOf(query, topic.grade, {
    clil: false,
    virtualLab: false,
    gamification: true,
  });
  if (!QUIZZES.some((text) => game.includes(text))) withoutQuiz += 1;

  const clil = generatePlan(
    {
      ...inputFor(query, topic.grade),
      options: { clil: true, virtualLab: false, gamification: false },
    },
    "ru",
    0,
  );
  const hasLine = clil.plan.stages.some((stage) => stage.teacher.includes("CLIL:"));
  if (!hasLine || !clil.plan.enabled.languageGoals) withoutClil += 1;
}
check(
  "«Виртуальная лаборатория» даёт симуляцию в каждом плане",
  withoutSimulation === 0,
  `планов без симуляции: ${withoutSimulation} из ${SAMPLE.length}`,
);
check(
  "«Геймификация» даёт сервис викторин в каждом плане",
  withoutQuiz === 0,
  `планов без викторины: ${withoutQuiz} из ${SAMPLE.length}`,
);
check(
  "«CLIL» даёт триплет терминов и языковые цели",
  withoutClil === 0,
  `планов без CLIL: ${withoutClil} из ${SAMPLE.length}`,
);

console.log();
if (failures.length) {
  console.error(`Проверка разнообразия не пройдена: ${failures.length} пункт(ов).`);
  process.exit(1);
}
console.log("Проверка разнообразия пройдена.");
