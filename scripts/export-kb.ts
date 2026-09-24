/**
 * Выгрузка базы знаний в JSON.
 *
 * Источник правды — TypeScript-каталоги в lib/: они типизированы, их проверяют
 * tsc, eslint и скрипты verify, а генератор читает их напрямую. JSON здесь
 * порождённый: его удобно импортировать, показывать методисту или отдать
 * другому инструменту, но править нужно каталоги, иначе через месяц две копии
 * данных разойдутся.
 *
 * Запуск: npm run export:kb [OUT_DIR]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ACTIVE_METHODS, GAME_LIKE } from "../lib/active-methods";
import { ICT } from "../lib/ict";
import {
  ASSESSMENT,
  DIFFERENTIATION,
  DIFFERENTIATION_STRATEGIES,
  METHODS,
} from "../lib/pedagogy";
import { TOPICS, sectionTitle } from "../lib/chemistry-kb";
import type { Bilingual } from "../lib/types";

const OUT_DIR = process.argv[2] ?? "data";
mkdirSync(OUT_DIR, { recursive: true });

const NOTE =
  "Порождённый файл. Источник правды — каталоги в lib/, правьте их и " +
  "перезапустите npm run export:kb.";

/**
 * Раскладывает двуязычную строку в пару полей.
 *
 * Поля названы так, как просил заказчик (name, description, chemistry_example),
 * а казахский вынесен в соседнее поле с суффиксом: сплющить его в одну строку
 * значило бы потерять половину базы — документ выпускается на двух языках.
 */
function pair(prefix: string, value: Bilingual | undefined) {
  if (!value) return {};
  return { [prefix]: value.ru, [`${prefix}_kk`]: value.kk };
}

const methods = {
  note: NOTE,
  categories: {
    pedagogy: {
      title: "Ведущие методики урока",
      title_kk: "Сабақтың жетекші әдістемелері",
      items: METHODS.map((method) => ({
        id: method.id,
        ...pair("name", method.name),
        ...pair("description", method.description),
        ...pair("chemistry_example", method.example),
        ...pair("teacher_actions", method.teacher),
        ...pair("student_actions", method.student),
      })),
    },
    active_techniques: {
      title: "Активные приёмы обучения",
      title_kk: "Белсенді оқыту тәсілдері",
      items: ACTIVE_METHODS.map((method) => ({
        id: method.id,
        role: method.role,
        stage: {
          warmup: "start",
          activation: "start",
          study: "middle",
          practice: "middle",
          reflection: "end",
        }[method.role],
        minutes: method.minutes,
        topic_kinds: method.kinds,
        game_like: GAME_LIKE.has(method.id),
        requires: method.requires ?? null,
        ...pair("name", method.name),
        ...pair("chemistry_example", method.teacher),
        ...pair("student_actions", method.student),
      })),
    },
    edtech: {
      title: "Цифровые образовательные технологии",
      title_kk: "Цифрлық білім беру технологиялары",
      items: ICT.map((resource) => ({
        id: resource.id,
        purpose: resource.purpose,
        stages: resource.stages,
        topic_kinds: resource.kinds,
        needs_student_device: resource.needsStudentDevice,
        ...pair("name", resource.name),
        ...pair("chemistry_example", resource.inPlan),
      })),
    },
    assessment: {
      title: "Формативное оценивание",
      title_kk: "Формативті бағалау",
      items: ASSESSMENT.map((technique) => ({
        id: technique.id,
        stages: technique.stages,
        ...pair("name", technique.name),
        ...pair("chemistry_example", technique.inPlan),
      })),
    },
    differentiation: {
      title: "Дифференциация и инклюзия",
      title_kk: "Саралау және инклюзия",
      items: DIFFERENTIATION_STRATEGIES.map((strategy) => ({
        id: strategy.id,
        ...pair("name", strategy.name),
        ...pair("description", strategy.description),
        ...pair("chemistry_example", strategy.example),
        // Готовые формулировки, которые движок ставит в документ.
        patterns: Object.entries(DIFFERENTIATION).flatMap(([kind, list]) =>
          list
            .filter((pattern) => pattern.strategy === strategy.id)
            .map((pattern) => ({
              topic_kind: kind,
              ...pair("support", pattern.support),
              ...pair("challenge", pattern.challenge),
            })),
        ),
      })),
    },
  },
};

/** Разворачивает закрепление в понятную запись: что это и из какого каталога. */
function resolvePin(id: string) {
  const method = ACTIVE_METHODS.find((m) => m.id === id);
  if (method) {
    return { id, category: "active_techniques", name: method.name.ru };
  }
  const resource = ICT.find((r) => r.id === id);
  if (resource) return { id, category: "edtech", name: resource.name.ru };
  const check = ASSESSMENT.find((a) => a.id === id);
  if (check) return { id, category: "assessment", name: check.name.ru };
  return { id, category: "unknown", name: null };
}

const topics = {
  note: NOTE,
  schema: {
    stage_plan:
      "Приёмы и цифровые ресурсы, закреплённые за этапами урока. Поле " +
      "необязательное и намеренно неполное: если закрепить всё за всеми темами, " +
      "планы снова станут одинаковыми. Незакреплённые позиции генератор " +
      "подбирает из пулов и меняет от варианта к варианту.",
    stage_keys: ["start", "middle", "end"],
  },
  items: TOPICS.map((topic) => ({
    id: topic.id,
    grade: topic.grade,
    unit: topic.unit,
    unit_title: sectionTitle(topic, "ru"),
    unit_title_kk: sectionTitle(topic, "kk"),
    kind: topic.kind,
    keywords: topic.keywords,
    lead_methods: topic.methods,
    stage_plan: topic.stagePlan ?? null,
    stage_plan_resolved: topic.stagePlan
      ? Object.fromEntries(
          Object.entries(topic.stagePlan).map(([stage, ids]) => [
            stage,
            (ids ?? []).map(resolvePin),
          ]),
        )
      : null,
    ...pair("prior_knowledge", topic.priorKnowledge),
    ...pair("cross_curricular", topic.crossCurricular),
    terms: topic.terms,
    experiments: topic.experiments.map((experiment) => ({
      ...pair("title", experiment.title),
      ...pair("materials", experiment.materials),
      ...pair("procedure", experiment.procedure),
      ...pair("safety", experiment.safety),
      ...pair("virtual_alternative", experiment.virtual),
    })),
    criteria: topic.criteria.map((c) => c.ru),
    criteria_kk: topic.criteria.map((c) => c.kk),
    descriptors: topic.descriptors.map((d) => d.ru),
    descriptors_kk: topic.descriptors.map((d) => d.kk),
  })),
};

/** Три темы с закреплениями — компактный пример для импорта и обсуждения. */
const sample = {
  note: NOTE,
  schema: topics.schema,
  items: topics.items.filter((topic) => topic.stage_plan),
};

for (const [name, value] of [
  ["methods.json", methods],
  ["topics.json", topics],
  ["topics-sample.json", sample],
] as const) {
  const path = join(OUT_DIR, name);
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
  const size = Buffer.byteLength(JSON.stringify(value)) / 1024;
  console.log(`  ${path} (${size.toFixed(0)} КБ)`);
}

const counts = Object.entries(methods.categories).map(
  ([key, group]) => `${key}: ${group.items.length}`,
);
console.log(`\nКатегорий методик: ${counts.join(", ")}`);
console.log(`Тем: ${topics.items.length}, из них с закреплениями: ${sample.items.length}`);
