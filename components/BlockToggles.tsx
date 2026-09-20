"use client";

import { EXTRA_LABELS, EXTRA_ORDER } from "@/lib/ksp-template";
import { UI } from "@/lib/i18n";
import type { ExtraKey, Lang } from "@/lib/types";

/**
 * Тумблеры методических блоков. Все выключены — остаётся строгая форма
 * приказа № 130: шапка плюс пять колонок хода урока.
 */
export default function BlockToggles({
  lang,
  enabled,
  onToggle,
}: {
  lang: Lang;
  enabled: Record<ExtraKey, boolean>;
  onToggle: (key: ExtraKey, next: boolean) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-ink-600">{UI.blocks[lang]}</p>
      <p className="mb-3 text-xs text-ink-400">{UI.strictHint[lang]}</p>
      <div className="flex flex-wrap gap-2">
        {EXTRA_ORDER.map((key) => {
          const active = enabled[key];
          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => onToggle(key, !active)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-surface text-ink-400 hover:border-ink-400"
              }`}
            >
              {EXTRA_LABELS[key][lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
