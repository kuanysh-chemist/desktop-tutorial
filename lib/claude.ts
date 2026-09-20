/**
 * Необязательная доработка КСП через Claude API.
 *
 * Локальная база знаний остаётся основным источником: она работает офлайн и
 * даёт методологически корректный каркас. Этот модуль лишь дошлифовывает
 * формулировки под конкретную тему — например, когда темы нет в базе.
 * Любая ошибка здесь не должна ломать работу приложения.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { STAGE_LABELS } from "./ksp-template";
import type { KspPlan, Lang } from "./types";

/** Модель по умолчанию; переопределяется переменной окружения. */
const DEFAULT_MODEL = "claude-opus-5";

const StageSchema = z.object({
  teacher: z.string(),
  student: z.string(),
  assessment: z.string(),
  resources: z.string(),
});

const EnhancedSchema = z.object({
  start: StageSchema,
  middle: StageSchema,
  end: StageSchema,
  criteria: z.string(),
  descriptors: z.string(),
  differentiationSupport: z.string(),
  differentiationChallenge: z.string(),
  safety: z.string(),
});

export type Enhanced = z.infer<typeof EnhancedSchema>;

const SYSTEM_PROMPT = `Ты — методист по химии в системе среднего образования Республики Казахстан.

Ты дорабатываешь краткосрочный план урока (КСП), составленный по форме приказа
Министра образования и науки РК от 6 апреля 2020 года № 130.

Жёсткие требования:
1. Структура неизменна: три этапа урока (начало, середина, конец), у каждого —
   действия педагога, действия обучающихся, оценивание, ресурсы.
2. Пиши на том языке, который указан в запросе. Казахский — литературный,
   с корректной терминологией химии.
3. Химическое содержание должно быть фактически верным: формулы, уравнения,
   наблюдения, условия протекания реакций.
4. Техника безопасности — реалистичная для школьного кабинета Казахстана.
   Если опыт опасен или требует вытяжного шкафа, прямо укажи это и предложи
   демонстрацию либо виртуальную лабораторию.
5. Опирайся на методики обновлённого содержания: проблемное обучение,
   развитие критического мышления, исследовательский подход (STEM), CLIL,
   групповая работа, формативное оценивание с дескрипторами.
6. Дифференциация — конкретная: что именно получает слабый обучающийся и чем
   именно усложняется задание для сильного. Без общих слов.
7. Сохраняй деловой стиль методического документа. Не используй markdown,
   эмодзи и заголовки. Абзацы разделяй переводом строки.`;

/** Ошибка, по которой клиент понимает, что нужно остаться на локальном плане. */
export class ClaudeUnavailableError extends Error {}

/**
 * Дорабатывает план. Бросает ClaudeUnavailableError, если ключ не настроен
 * или сервис недоступен — вызывающая сторона обязана это обработать.
 */
export async function enhancePlan(
  plan: KspPlan,
  lang: Lang,
): Promise<Enhanced> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ClaudeUnavailableError("ANTHROPIC_API_KEY не задан");
  }

  const client = new Anthropic();
  const languageName = lang === "ru" ? "русском" : "казахском";

  const objectives = plan.header.objectives
    .map((objective) =>
      [objective.code, objective.text].filter(Boolean).join(" "),
    )
    .join("\n");

  const draft = plan.stages
    .map(
      (stage) =>
        `[${STAGE_LABELS[stage.id][lang]} — ${stage.minutes} мин]\n` +
        `Действия педагога: ${stage.teacher}\n` +
        `Действия обучающихся: ${stage.student}\n` +
        `Оценивание: ${stage.assessment}\n` +
        `Ресурсы: ${stage.resources}`,
    )
    .join("\n\n");

  const userPrompt = `Язык документа: ${languageName}.

Тема урока: ${plan.header.topic}
Класс: ${plan.header.grade}
Длительность урока: ${plan.durationMinutes} мин
Распределение по этапам: ${plan.stages.map((s) => `${STAGE_LABELS[s.id][lang]} — ${s.minutes} мин`).join(", ")}

Цели обучения:
${objectives}

Цели урока:
${plan.header.lessonGoals.join("\n")}

Черновик, собранный из базы знаний:
${draft}

Доработай черновик под эту конкретную тему: уточни химическое содержание,
подбери уместный опыт с реальными реактивами и наблюдениями, конкретизируй
приёмы оценивания, дескрипторы и дифференциацию. Объём каждого поля —
сопоставим с черновиком.`;

  try {
    const response = await client.messages.parse({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      output_config: { format: zodOutputFormat(EnhancedSchema) },
    });

    if (response.stop_reason === "refusal") {
      throw new ClaudeUnavailableError("Запрос отклонён моделью");
    }
    if (!response.parsed_output) {
      throw new ClaudeUnavailableError("Не удалось разобрать ответ модели");
    }
    return response.parsed_output;
  } catch (error) {
    if (error instanceof ClaudeUnavailableError) throw error;
    if (error instanceof Anthropic.APIError) {
      throw new ClaudeUnavailableError(
        `Claude API вернул ошибку ${error.status}`,
      );
    }
    throw new ClaudeUnavailableError("Claude API недоступен");
  }
}
