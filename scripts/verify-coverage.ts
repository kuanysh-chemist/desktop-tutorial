/**
 * Проверка покрытия типовой учебной программы базой знаний.
 *
 * Запуск: npx tsx scripts/verify-coverage.ts
 * Падает с ненулевым кодом, если найдено хотя бы одно нарушение.
 */
import { CURRICULUM, TOPICS, sectionTitle } from "../lib/chemistry-kb";
import { generatePlan } from "../lib/generator";
import { ACTIVE_METHODS } from "../lib/active-methods";
import { ICT } from "../lib/ict";
import { ASSESSMENT, DIFFERENTIATION, METHODS } from "../lib/pedagogy";
import type { KspPlan, Lang, StageId } from "../lib/types";

const problems: string[] = [];
const methodIds = new Set(METHODS.map((method) => method.id));
const unitIds = new Set(CURRICULUM.map((unit) => unit.id));

// 1. Уникальность идентификаторов тем
const seen = new Map<string, number>();
for (const topic of TOPICS) {
  seen.set(topic.id, (seen.get(topic.id) ?? 0) + 1);
}
for (const [id, count] of seen) {
  if (count > 1) problems.push(`дубль идентификатора темы: ${id} (${count} раза)`);
}

// 2. Ссылки тем на разделы, классы и справочники
for (const topic of TOPICS) {
  if (!unitIds.has(topic.unit)) {
    problems.push(`${topic.id}: раздел «${topic.unit}» отсутствует в программе`);
    continue;
  }
  const unit = CURRICULUM.find((item) => item.id === topic.unit)!;
  if (unit.grade !== topic.grade) {
    problems.push(
      `${topic.id}: класс темы ${topic.grade} не совпадает с классом раздела ${unit.id} (${unit.grade})`,
    );
  }
  if (!DIFFERENTIATION[topic.kind]) {
    problems.push(`${topic.id}: нет пары дифференциации для вида «${topic.kind}»`);
  }
  for (const method of topic.methods) {
    if (!methodIds.has(method)) {
      problems.push(`${topic.id}: неизвестная методика «${method}»`);
    }
  }
  if (topic.experiments.length === 0) {
    problems.push(`${topic.id}: нет ни одного опыта`);
  }
  if (topic.criteria.length === 0 || topic.descriptors.length === 0) {
    problems.push(`${topic.id}: нет критериев или дескрипторов`);
  }
  if (topic.keywords.length < 3) {
    problems.push(`${topic.id}: меньше трёх ключевых слов — тема будет плохо находиться`);
  }
}

// 3. Покрытие: в каждом разделе программы есть не меньше трёх тем.
//    Одной темы на раздел мало: учитель, скорее всего, ведёт по разделу
//    несколько уроков, и все они получали бы один и тот же опыт.
const MIN_TOPICS_PER_UNIT = 3;
const byUnit = new Map<string, number>();
for (const topic of TOPICS) {
  byUnit.set(topic.unit, (byUnit.get(topic.unit) ?? 0) + 1);
}

console.log("Покрытие разделов типовой учебной программы\n");
let currentGrade = 0;
for (const unit of CURRICULUM) {
  if (unit.grade !== currentGrade) {
    currentGrade = unit.grade;
    console.log(`  ── ${currentGrade} класс ──`);
  }
  const count = byUnit.get(unit.id) ?? 0;
  if (count < MIN_TOPICS_PER_UNIT) {
    problems.push(
      `раздел ${unit.id} «${unit.title.ru}»: тем ${count}, минимум ${MIN_TOPICS_PER_UNIT}`,
    );
  }
  console.log(
    `  ${count >= MIN_TOPICS_PER_UNIT ? "ok  " : "МАЛО"} ${unit.id.padEnd(5)} ${unit.title.ru.padEnd(46)} тем: ${count}`,
  );
}


// 4a. Закрепления stagePlan должны разрешаться и подходить своему этапу.
//     Идентификатор с опечаткой генератор молча пропустит, и учитель никогда
//     не узнает, что закрепление не сработало, — поэтому ловим здесь.
const ROLE_STAGE: Record<string, StageId> = {
  warmup: "start",
  activation: "start",
  study: "middle",
  practice: "middle",
  reflection: "end",
};

let pinChecks = 0;
for (const topic of TOPICS) {
  if (!topic.stagePlan) continue;
  for (const [stage, ids] of Object.entries(topic.stagePlan)) {
    for (const id of ids ?? []) {
      pinChecks++;
      const method = ACTIVE_METHODS.find((m) => m.id === id);
      if (method) {
        if (ROLE_STAGE[method.role] !== stage) {
          problems.push(
            `${topic.id}: приём «${id}» относится к этапу «${ROLE_STAGE[method.role]}», а закреплён за «${stage}»`,
          );
        }
        if (method.kinds.length && !method.kinds.includes(topic.kind)) {
          problems.push(
            `${topic.id}: приём «${id}» не предназначен для тем вида «${topic.kind}»`,
          );
        }
        continue;
      }
      const resource = ICT.find((r) => r.id === id);
      if (resource) {
        if (!resource.stages.includes(stage as StageId)) {
          problems.push(
            `${topic.id}: ресурс «${id}» не рассчитан на этап «${stage}»`,
          );
        }
        continue;
      }
      const check = ASSESSMENT.find((a) => a.id === id);
      if (check) {
        if (!check.stages.includes(stage as StageId)) {
          problems.push(
            `${topic.id}: приём оценивания «${id}» не рассчитан на этап «${stage}»`,
          );
        }
        continue;
      }
      problems.push(`${topic.id}: закрепление «${id}» ни на что не указывает`);
    }
  }
}

// 4. Генерация не должна портить регистр химических формул.
//    В «NaCl» регистр несёт смысл: «naCl» — запись другого вещества,
//    а «CO» и «Co» — угарный газ и кобальт.
function formulasIn(text: string): string[] {
  return [...new Set(text.match(/[A-Z][A-Za-z]*[\u2080-\u2089\d]*/g) ?? [])];
}

/**
 * Ищет обозначение как отдельное слово.
 *
 * Простая подстрока здесь не годится: односимвольная «U» (U-образная трубка)
 * находится внутри «phet.colorado.edu», и проверка объявляла испорченной
 * формулу, которой в плане вообще не было. Границы слова по латинице
 * оставляют настоящие случаи — «u-образная», «nacl» — и отсеивают чужие
 * слова и адреса.
 */
function occursAsToken(text: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`).test(text);
}

function planText(plan: KspPlan): string {
  return [
    ...plan.stages.flatMap((stage) => [
      stage.teacher,
      stage.student,
      stage.assessment,
      stage.resources,
    ]),
    ...Object.values(plan.extras),
  ].join("\n");
}

let formulaChecks = 0;
for (const topic of TOPICS) {
  for (const lang of ["ru", "kk"] as Lang[]) {
    const { plan } = generatePlan(
      {
        topic: topic.keywords[0] ?? topic.id,
        objectivesRaw: "9.1.1.1 проверка сохранения формул",
        durationMinutes: 40,
        grade: String(topic.grade),
        teacher: "",
        date: "2026-09-20",
        present: "",
        absent: "",
      },
      lang,
    );
    const text = planText(plan);
    // Опыт выбирается по хешу темы, поэтому проверяются формулы всех опытов,
    // а не только первого: в план может попасть любой из них.
    const formulas = new Set(
      topic.experiments.flatMap((experiment) => [
        ...formulasIn(experiment.materials[lang]),
        ...formulasIn(experiment.procedure[lang]),
      ]),
    );
    for (const formula of formulas) {
      formulaChecks++;
      if (
        occursAsToken(text, formula.toLowerCase()) &&
        !occursAsToken(text, formula)
      ) {
        problems.push(
          `${topic.id} (${lang}): формула «${formula}» попала в план как «${formula.toLowerCase()}»`,
        );
      }
    }
  }
}

// 5. Название раздела действительно подставляется в шапку КСП
const sample = TOPICS[0];
if (!sectionTitle(sample, "ru") || !sectionTitle(sample, "kk")) {
  problems.push("sectionTitle вернул пустую строку — шапка КСП останется без раздела");
}

const byGrade = new Map<number, number>();
for (const topic of TOPICS) byGrade.set(topic.grade, (byGrade.get(topic.grade) ?? 0) + 1);

console.log(
  `\nПроверено сохранение регистра у ${formulaChecks} химических формул` +
    ` и ${pinChecks} закреплений stagePlan.`,
);

console.log(
  `Итого: ${TOPICS.length} тем в ${CURRICULUM.length} разделах` +
    ` (${[...byGrade.entries()].sort().map(([g, c]) => `${g} кл. — ${c}`).join(", ")})`,
);

if (problems.length > 0) {
  console.error(`\nНарушений: ${problems.length}`);
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}
console.log("Нарушений не найдено.");
