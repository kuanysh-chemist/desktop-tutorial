import { NextResponse } from "next/server";
import { ClaudeUnavailableError, enhancePlan } from "@/lib/claude";
import type { KspPlan, Lang, LessonOptions } from "@/lib/types";

export const runtime = "nodejs";

interface SuggestBody {
  plan: KspPlan;
  lang: Lang;
  /** Галочки современных подходов. Необязательны: без них правил не добавляем. */
  options?: LessonOptions;
}

/**
 * Дорабатывает готовый план через Claude API.
 *
 * Клиент обязан пережить отказ: при 503 он остаётся на плане из локальной базы
 * знаний. Ключ ANTHROPIC_API_KEY читается только на сервере.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: SuggestBody;
  try {
    body = (await request.json()) as SuggestBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  if (!body?.plan?.stages?.length || (body.lang !== "ru" && body.lang !== "kk")) {
    return NextResponse.json(
      { error: "Ожидаются поля plan и lang" },
      { status: 400 },
    );
  }

  try {
    const enhanced = await enhancePlan(body.plan, body.lang, {
      options: body.options,
    });
    return NextResponse.json({ enhanced });
  } catch (error) {
    if (error instanceof ClaudeUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Внутренняя ошибка при обращении к Claude API" },
      { status: 500 },
    );
  }
}
