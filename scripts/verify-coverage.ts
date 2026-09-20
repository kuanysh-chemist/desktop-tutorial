/**
 * Проверка покрытия типовой учебной программы базой знаний.
 *
 * Запуск: npx tsx scripts/verify-coverage.ts
 * Падает с ненулевым кодом, если найдено хотя бы одно нарушение.
 */
import { CURRICULUM, TOPICS, sectionTitle } from "../lib/chemistry-kb";
import { DIFFERENTIATION, METHODS } from "../lib/pedagogy";

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

// 3. Покрытие: в каждом разделе программы есть хотя бы одна тема
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
  if (count === 0) problems.push(`раздел ${unit.id} «${unit.title.ru}» не покрыт ни одной темой`);
  console.log(
    `  ${count > 0 ? "ok  " : "ПУСТО"} ${unit.id.padEnd(5)} ${unit.title.ru.padEnd(46)} тем: ${count}`,
  );
}

// 4. Название раздела действительно подставляется в шапку КСП
const sample = TOPICS[0];
if (!sectionTitle(sample, "ru") || !sectionTitle(sample, "kk")) {
  problems.push("sectionTitle вернул пустую строку — шапка КСП останется без раздела");
}

const byGrade = new Map<number, number>();
for (const topic of TOPICS) byGrade.set(topic.grade, (byGrade.get(topic.grade) ?? 0) + 1);

console.log(
  `\nИтого: ${TOPICS.length} тем в ${CURRICULUM.length} разделах` +
    ` (${[...byGrade.entries()].sort().map(([g, c]) => `${g} кл. — ${c}`).join(", ")})`,
);

if (problems.length > 0) {
  console.error(`\nНарушений: ${problems.length}`);
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}
console.log("Нарушений не найдено.");
