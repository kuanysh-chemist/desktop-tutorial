/**
 * Формат доработки плана и её применение.
 *
 * Модуль не зависит от серверного окружения: схему используют и API-роут,
 * и тест, а слияние выполняется на клиенте после ответа сервера.
 */
import { z } from "zod";
import type { KspPlan } from "./types";

const StageSchema = z.object({
  teacher: z.string(),
  student: z.string(),
  assessment: z.string(),
  resources: z.string(),
});

export const EnhancedSchema = z.object({
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

/**
 * Накладывает доработку на план. Пустые строки и отсутствующие поля
 * игнорируются: доработка не должна стирать то, что уже собрано базой знаний.
 */
export function applyEnhancement(
  plan: KspPlan,
  enhanced: Partial<Enhanced>,
): KspPlan {
  const keep = (next: string | undefined, current: string) =>
    next && next.trim() ? next : current;

  return {
    ...plan,
    stages: plan.stages.map((stage) => {
      const patch = enhanced[stage.id];
      if (!patch) return stage;
      return {
        ...stage,
        teacher: keep(patch.teacher, stage.teacher),
        student: keep(patch.student, stage.student),
        assessment: keep(patch.assessment, stage.assessment),
        resources: keep(patch.resources, stage.resources),
      };
    }),
    extras: {
      ...plan.extras,
      criteria: keep(enhanced.criteria, plan.extras.criteria),
      descriptors: keep(enhanced.descriptors, plan.extras.descriptors),
      differentiationSupport: keep(
        enhanced.differentiationSupport,
        plan.extras.differentiationSupport,
      ),
      differentiationChallenge: keep(
        enhanced.differentiationChallenge,
        plan.extras.differentiationChallenge,
      ),
      safety: keep(enhanced.safety, plan.extras.safety),
    },
  };
}
