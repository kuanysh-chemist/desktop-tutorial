"use client";

import { UI } from "@/lib/i18n";
import type { Lang, LessonOptions } from "@/lib/types";

/**
 * Галочки современных подходов.
 *
 * Сознательно не перегенерируют план сами: у учителя могут быть ручные правки
 * в ячейках, и молча их стереть нельзя. План пересобирается кнопкой.
 */
const ITEMS: {
  key: keyof LessonOptions;
  label: keyof typeof UI;
  hint: keyof typeof UI;
}[] = [
  { key: "clil", label: "optionClil", hint: "optionClilHint" },
  {
    key: "virtualLab",
    label: "optionVirtualLab",
    hint: "optionVirtualLabHint",
  },
  {
    key: "gamification",
    label: "optionGamification",
    hint: "optionGamificationHint",
  },
];

export default function ApproachToggles({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: LessonOptions;
  onChange: (next: LessonOptions) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-ink-600">
        {UI.approaches[lang]}
      </p>
      <p className="mb-2.5 text-xs text-ink-400">{UI.approachesHint[lang]}</p>
      <div className="space-y-1.5">
        {ITEMS.map((item) => {
          const active = value[item.key];
          return (
            <button
              key={item.key}
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => onChange({ ...value, [item.key]: !active })}
              className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition ${
                active
                  ? "border-brand-500 bg-brand-50"
                  : "border-ink-200 bg-surface hover:border-ink-400"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition ${
                  active
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-ink-400 text-transparent"
                }`}
              >
                <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
                  <path d="M8.2 13.6 4.6 10l1.2-1.2 2.4 2.4 6-6L15.4 6z" />
                </svg>
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-semibold ${
                    active ? "text-brand-700" : "text-ink-600"
                  }`}
                >
                  {UI[item.label][lang]}
                </span>
                <span className="mt-0.5 block text-xs text-ink-400">
                  {UI[item.hint][lang]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
