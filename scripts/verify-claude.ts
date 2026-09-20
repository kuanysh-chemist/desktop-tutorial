/**
 * Проверка пути доработки через Claude API без ключа и без сети.
 *
 * Подставляет заглушку клиента и прогоняет тот же код, который выполняется
 * в продакшене: сборку запроса, разбор ответа, обработку отказа и слияние
 * результата с планом. Если ANTHROPIC_API_KEY задан, дополнительно делает
 * один настоящий запрос.
 *
 * Запуск: npx tsx scripts/verify-claude.ts
 */
import {
  ClaudeUnavailableError,
  buildPrompt,
  enhancePlan,
  type ClaudeClient,
} from "../lib/claude";
import { EnhancedSchema, applyEnhancement, type Enhanced } from "../lib/enhance";
import { generatePlan } from "../lib/generator";
import type { KspPlan, LessonInput } from "../lib/types";

const problems: string[] = [];
const check = (ok: boolean, label: string) => {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}`);
  if (!ok) problems.push(label);
};

const INPUT: LessonInput = {
  topic: "Скорость химической реакции",
  objectivesRaw: "9.2.3.1 объяснять влияние температуры на скорость реакции",
  durationMinutes: 40,
  grade: "9",
  teacher: "Иванова А. К.",
  date: "2026-09-20",
  present: "24",
  absent: "1",
};
const { plan } = generatePlan(INPUT, "ru");

const PAYLOAD: Enhanced = {
  start: { teacher: "T1", student: "S1", assessment: "A1", resources: "R1" },
  middle: { teacher: "T2", student: "S2", assessment: "A2", resources: "R2" },
  end: { teacher: "T3", student: "S3", assessment: "A3", resources: "R3" },
  criteria: "C", descriptors: "D",
  differentiationSupport: "DS", differentiationChallenge: "DC", safety: "SF",
};

function stubClient(
  result: { stop_reason?: string | null; parsed_output?: Enhanced | null } | Error,
  captured?: Record<string, unknown>[],
): ClaudeClient {
  return {
    messages: {
      async parse(params) {
        captured?.push(params);
        if (result instanceof Error) throw result;
        return {
          stop_reason: result.stop_reason ?? "end_turn",
          parsed_output: result.parsed_output ?? null,
        };
      },
    },
  };
}

async function expectUnavailable(
  label: string,
  run: () => Promise<unknown>,
): Promise<void> {
  try {
    await run();
    check(false, `${label}: ожидалась ClaudeUnavailableError, ошибки не было`);
  } catch (error) {
    check(error instanceof ClaudeUnavailableError, label);
  }
}

async function main(): Promise<void> {
  console.log("Сборка запроса");
  const { system, user } = buildPrompt(plan, "ru");
  check(system.includes("приказ"), "системный промпт ссылается на форму приказа");
  check(user.includes(INPUT.topic), "тема урока попала в запрос");
  check(user.includes("9.2.3.1"), "код цели обучения попал в запрос");
  check(user.includes("Начало урока"), "черновик этапов попал в запрос");
  const kk = buildPrompt(plan, "kk").user;
  check(kk.includes("казахском"), "язык документа передан для казахского");
  check(kk.includes("Сабақтың басы"), "подписи этапов переключились на казахский");

  console.log("\nСхема ответа");
  check(EnhancedSchema.safeParse(PAYLOAD).success, "корректный ответ проходит схему");
  check(
    !EnhancedSchema.safeParse({ ...PAYLOAD, middle: undefined }).success,
    "ответ без обязательного этапа отклоняется",
  );

  console.log("\nВызов с заглушкой клиента");
  const captured: Record<string, unknown>[] = [];
  const enhanced = await enhancePlan(plan, "ru", stubClient({ parsed_output: PAYLOAD }, captured));
  check(enhanced.middle.teacher === "T2", "ответ возвращён вызывающей стороне");
  const params = captured[0] ?? {};
  check(typeof params.model === "string" && params.model.length > 0, "модель передана");
  check(params.max_tokens === 16000, "max_tokens передан");
  const outputConfig = params.output_config as { format?: { type?: string } } | undefined;
  check(outputConfig?.format?.type === "json_schema", "структурированный вывод включён");

  console.log("\nОтказы");
  await expectUnavailable("отказ модели → ClaudeUnavailableError", () =>
    enhancePlan(plan, "ru", stubClient({ stop_reason: "refusal" })),
  );
  await expectUnavailable("пустой разбор → ClaudeUnavailableError", () =>
    enhancePlan(plan, "ru", stubClient({ parsed_output: null })),
  );
  await expectUnavailable("сетевая ошибка → ClaudeUnavailableError", () =>
    enhancePlan(plan, "ru", stubClient(new Error("ECONNRESET"))),
  );

  const savedKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  await expectUnavailable("нет ключа и нет клиента → ClaudeUnavailableError", () =>
    enhancePlan(plan, "ru"),
  );
  if (savedKey) process.env.ANTHROPIC_API_KEY = savedKey;

  console.log("\nСлияние с планом");
  const merged: KspPlan = applyEnhancement(plan, enhanced);
  check(merged.stages[0].teacher === "T1", "начало урока обновлено");
  check(merged.stages[1].student === "S2", "середина урока обновлена");
  check(merged.stages[2].resources === "R3", "конец урока обновлён");
  check(merged.extras.safety === "SF", "техника безопасности обновлена");
  check(merged.header.topic === plan.header.topic, "шапка не затронута");
  check(merged.stages.length === 3, "число этапов не изменилось");

  const partial = applyEnhancement(plan, { criteria: "", middle: undefined });
  check(
    partial.extras.criteria === plan.extras.criteria,
    "пустое поле не стирает данные базы знаний",
  );
  check(
    partial.stages[1].teacher === plan.stages[1].teacher,
    "отсутствующий этап не стирает данные базы знаний",
  );

  if (savedKey) {
    console.log("\nНастоящий запрос к Claude API");
    try {
      const live = await enhancePlan(plan, "ru");
      check(live.middle.teacher.length > 40, "живой ответ содержательный");
      console.log(`  середина урока, начало ответа: ${live.middle.teacher.slice(0, 120)}…`);
    } catch (error) {
      check(false, `живой запрос не прошёл: ${String(error)}`);
    }
  } else {
    console.log("\nANTHROPIC_API_KEY не задан — живой запрос пропущен.");
  }

  if (problems.length > 0) {
    console.error(`\nНарушений: ${problems.length}`);
    process.exit(1);
  }
  console.log("\nПуть доработки исправен.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
