/** Проверка сопоставления темы урока с базой знаний. Запуск: npx tsx scripts/verify-match.ts */
import { matchTopic } from "../lib/chemistry-kb";

const CASES: [string, string, string][] = [
  ["Разделение смесей фильтрованием", "7", "7-mixtures"],
  ["Атомы и молекулы", "7", "7-atoms"],
  ["Относительная молекулярная масса вещества", "7", "7-formulas"],
  ["Признаки химических реакций", "7", "7-reactions"],
  ["Получение кислорода и его свойства", "7", "7-oxygen"],
  ["Периодический закон Д. И. Менделеева", "8", "8-periodic-law"],
  ["Ковалентная полярная связь", "8", "8-bond"],
  ["Моль. Молярная масса вещества", "8", "8-mole"],
  ["Оксиды, кислоты, основания и соли", "8", "8-classes"],
  ["Типы химических реакций", "8", "8-reaction-types"],
  ["Массовая доля растворённого вещества", "8", "8-solutions"],
  ["Электролитическая диссоциация кислот и щелочей", "9", "9-dissociation"],
  ["Скорость химической реакции", "9", "9-rate"],
  ["Химическое равновесие и принцип Ле Шателье", "9", "9-rate"],
  ["Металлы и их коррозия", "9", "9-metals"],
  ["Алканы и алкены: изомерия и номенклатура", "10", "10-hydrocarbons"],
  ["Карбоновые кислоты", "10", "10-oxygen-organic"],
  ["Белки и аминокислоты", "11", "11-biopolymers"],
  ["Тепловой эффект химической реакции", "11", "11-thermochemistry"],
  ["Электролиттік диссоциация", "9", "9-dissociation"],
  ["Химиялық реакция жылдамдығы", "9", "9-rate"],
  ["Көмірсутектер: алкандар", "10", "10-hydrocarbons"],
  ["Ақуыздар және аминқышқылдары", "11", "11-biopolymers"],
  ["Вальс цветов в кабинете директора", "9", "generic"],
];

let failed = 0;
for (const [topic, grade, expected] of CASES) {
  const { topic: found, score, matched } = matchTopic(topic, grade);
  const actual = matched ? found.id : "generic";
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${topic.padEnd(46)} → ${actual.padEnd(20)} (score ${score.toFixed(0)}${ok ? "" : `, ожидалось ${expected}`})`,
  );
}
console.log(`\n${CASES.length - failed}/${CASES.length} совпадений`);
process.exit(failed > 0 ? 1 : 0);
