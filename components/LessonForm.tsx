"use client";

import { UI } from "@/lib/i18n";
import type { Lang, LessonInput } from "@/lib/types";

const FIELD =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const LABEL = "mb-1.5 block text-sm font-medium text-ink-600";

/**
 * Три поля, которые учитель заполняет вручную (тема, цели, время урока),
 * плюс реквизиты шапки. Всё остальное генерируется.
 */
export default function LessonForm({
  lang,
  value,
  onChange,
  error,
}: {
  lang: Lang;
  value: LessonInput;
  onChange: (next: LessonInput) => void;
  error: string | null;
}) {
  const set = <K extends keyof LessonInput>(key: K, next: LessonInput[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL} htmlFor="topic">
          {UI.topic[lang]} <span className="text-brand-500">*</span>
        </label>
        <input
          id="topic"
          className={FIELD}
          value={value.topic}
          placeholder={UI.topicPlaceholder[lang]}
          onChange={(event) => set("topic", event.target.value)}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="objectives">
          {UI.objectives[lang]} <span className="text-brand-500">*</span>
        </label>
        <textarea
          id="objectives"
          className={`${FIELD} min-h-28 leading-relaxed`}
          value={value.objectivesRaw}
          placeholder={UI.objectivesPlaceholder[lang]}
          onChange={(event) => set("objectivesRaw", event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="duration">
            {UI.duration[lang]} <span className="text-brand-500">*</span>
          </label>
          <input
            id="duration"
            type="number"
            min={10}
            max={120}
            step={5}
            className={FIELD}
            value={value.durationMinutes}
            onChange={(event) =>
              set("durationMinutes", Number(event.target.value) || 40)
            }
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="grade">
            {UI.grade[lang]}
          </label>
          <select
            id="grade"
            className={FIELD}
            value={value.grade}
            onChange={(event) => set("grade", event.target.value)}
          >
            {["7", "8", "9", "10", "11"].map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details className="rounded-lg border border-ink-200 bg-white/60 px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium text-ink-600">
          {lang === "ru" ? "Реквизиты шапки" : "Бас бөлім деректемелері"}
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className={LABEL} htmlFor="teacher">
              {UI.teacher[lang]}
            </label>
            <input
              id="teacher"
              className={FIELD}
              value={value.teacher}
              onChange={(event) => set("teacher", event.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL} htmlFor="date">
                {UI.date[lang]}
              </label>
              <input
                id="date"
                type="date"
                className={FIELD}
                value={value.date}
                onChange={(event) => set("date", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="present">
                {UI.present[lang]}
              </label>
              <input
                id="present"
                className={FIELD}
                value={value.present}
                onChange={(event) => set("present", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="absent">
                {UI.absent[lang]}
              </label>
              <input
                id="absent"
                className={FIELD}
                value={value.absent}
                onChange={(event) => set("absent", event.target.value)}
              />
            </div>
          </div>
        </div>
      </details>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
