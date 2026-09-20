"use client";

import { UI } from "@/lib/i18n";
import type { SavedPlan } from "@/lib/storage";
import type { Lang } from "@/lib/types";

const ACTION =
  "rounded px-2 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-100 hover:text-brand-700";

/** Список сохранённых планов: открыть, дублировать, удалить. */
export default function PlanLibrary({
  lang,
  items,
  currentId,
  available,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  lang: Lang;
  items: SavedPlan[];
  currentId: string | null;
  available: boolean;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-600">
        {UI.library[lang]}
        {items.length > 0 && (
          <span className="ml-1.5 text-xs text-ink-400">{items.length}</span>
        )}
      </p>

      {!available ? (
        <p className="rounded-lg bg-warn-bg p-3 text-xs text-warn-text">
          {UI.storageOff[lang]}
        </p>
      ) : items.length === 0 ? (
        <p className="text-xs text-ink-400">{UI.libraryEmpty[lang]}</p>
      ) : (
        <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {items.map((item) => {
            const active = item.id === currentId;
            return (
              <li
                key={item.id}
                className={`rounded-lg border px-2.5 py-2 text-xs transition ${
                  active
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200 bg-surface"
                }`}
              >
                <p className="truncate font-medium text-ink-900" title={item.input.topic}>
                  {item.input.topic || "—"}
                </p>
                <p className="mt-0.5 text-ink-400">
                  {item.input.grade} {lang === "ru" ? "кл." : "сын."} ·{" "}
                  {item.lang.toUpperCase()} ·{" "}
                  {new Date(item.savedAt).toLocaleString(
                    lang === "ru" ? "ru-RU" : "kk-KZ",
                    { dateStyle: "short", timeStyle: "short" },
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  <button type="button" className={ACTION} onClick={() => onOpen(item.id)}>
                    {UI.openPlan[lang]}
                  </button>
                  <button type="button" className={ACTION} onClick={() => onDuplicate(item.id)}>
                    {UI.duplicatePlan[lang]}
                  </button>
                  <button
                    type="button"
                    className={`${ACTION} hover:text-red-600`}
                    onClick={() => onDelete(item.id)}
                  >
                    {UI.deletePlan[lang]}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
