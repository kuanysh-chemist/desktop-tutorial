"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "ksp-theme";

/** Применяет тему к документу: «системная» просто снимает переопределение. */
function apply(theme: Theme): void {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

/** Переключатель светлой, тёмной и системной темы. Выбор запоминается. */
export default function ThemeSwitcher({ lang }: { lang: Lang }) {
  const [theme, setTheme] = useState<Theme>("system");

  // Читаем сохранённый выбор после монтирования: на сервере localStorage нет.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // Хранилище недоступно — остаёмся на системной теме.
    }
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    apply(next);
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Тема всё равно применится до конца сеанса.
    }
  };

  const options: { id: Theme; label: string }[] = [
    { id: "system", label: UI.themeSystem[lang] },
    { id: "light", label: UI.themeLight[lang] },
    { id: "dark", label: UI.themeDark[lang] },
  ];

  return (
    <div
      role="group"
      aria-label={UI.theme[lang]}
      className="inline-flex rounded-lg border border-ink-200 bg-surface p-0.5"
    >
      {options.map((option) => {
        const active = option.id === theme;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => choose(option.id)}
            aria-pressed={active}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-brand-500 text-white"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
