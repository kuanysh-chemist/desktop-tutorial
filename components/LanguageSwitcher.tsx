"use client";

import { LANGS } from "@/lib/ksp-template";
import type { Lang } from "@/lib/types";

/** Переключает и интерфейс, и язык выходного документа. */
export default function LanguageSwitcher({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (next: Lang) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Язык / Тіл"
      className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5"
    >
      {LANGS.map((item) => {
        const active = item.id === lang;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-pressed={active}
            title={item.label}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-brand-500 text-white"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
