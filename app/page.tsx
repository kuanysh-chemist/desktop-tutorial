"use client";

import { useCallback, useEffect, useState } from "react";
import BlockToggles from "@/components/BlockToggles";
import KspPreview from "@/components/KspPreview";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LessonForm from "@/components/LessonForm";
import { generatePlan } from "@/lib/generator";
import { UI } from "@/lib/i18n";
import { DEFAULT_ENABLED } from "@/lib/ksp-template";
import type { ExtraKey, KspPlan, Lang, LessonInput } from "@/lib/types";

const EMPTY_INPUT: LessonInput = {
  topic: "",
  objectivesRaw: "",
  durationMinutes: 40,
  grade: "8",
  teacher: "",
  date: "",
  present: "",
  absent: "",
};

interface Meta {
  matched: boolean;
  experimentTitle: string;
  methodName: string;
}

const BUTTON_PRIMARY =
  "rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_SECONDARY =
  "rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50";

export default function Home() {
  const [lang, setLang] = useState<Lang>("ru");
  const [form, setForm] = useState<LessonInput>(EMPTY_INPUT);
  const [plan, setPlan] = useState<KspPlan | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [enabled, setEnabled] =
    useState<Record<ExtraKey, boolean>>(DEFAULT_ENABLED);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);

  // Дата ставится после монтирования: на сервере и клиенте она могла бы разойтись.
  useEffect(() => {
    setForm((current) =>
      current.date
        ? current
        : { ...current, date: new Date().toISOString().slice(0, 10) },
    );
  }, []);

  const build = useCallback(
    (input: LessonInput, targetLang: Lang) => {
      const result = generatePlan(input, targetLang);
      setPlan({ ...result.plan, enabled });
      setMeta({
        matched: result.matched,
        experimentTitle: result.experimentTitle,
        methodName: result.methodName,
      });
      setNotice(result.matched ? null : UI.noMatch[targetLang]);
    },
    [enabled],
  );

  const handleGenerate = () => {
    if (!form.topic.trim()) {
      setError(UI.topicRequired[lang]);
      return;
    }
    if (!form.objectivesRaw.trim()) {
      setError(UI.objectivesRequired[lang]);
      return;
    }
    setError(null);
    build(form, lang);
  };

  /** Смена языка меняет и интерфейс, и документ: план пересобирается. */
  const handleLang = (next: Lang) => {
    setLang(next);
    if (plan) build(form, next);
  };

  const handleToggle = (key: ExtraKey, next: boolean) => {
    const updated = { ...enabled, [key]: next };
    setEnabled(updated);
    if (plan) setPlan({ ...plan, enabled: updated });
  };

  const handleEnhance = async () => {
    if (!plan) return;
    setEnhancing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, lang }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const { enhanced } = await response.json();
      setPlan({
        ...plan,
        stages: plan.stages.map((stage) => ({
          ...stage,
          ...(enhanced[stage.id] ?? {}),
        })),
        extras: {
          ...plan.extras,
          criteria: enhanced.criteria ?? plan.extras.criteria,
          descriptors: enhanced.descriptors ?? plan.extras.descriptors,
          differentiationSupport:
            enhanced.differentiationSupport ??
            plan.extras.differentiationSupport,
          differentiationChallenge:
            enhanced.differentiationChallenge ??
            plan.extras.differentiationChallenge,
          safety: enhanced.safety ?? plan.extras.safety,
        },
      });
    } catch {
      setNotice(UI.enhanceFailed[lang]);
    } finally {
      setEnhancing(false);
    }
  };

  const handleExport = async (format: "docx" | "pdf") => {
    if (!plan) return;
    if (format === "docx") {
      const { exportDocx } = await import("@/lib/export/docx");
      await exportDocx(plan, lang);
    } else {
      const { exportPdf } = await import("@/lib/export/pdf");
      await exportPdf(plan, lang);
    }
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="no-print mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
            {UI.appTitle[lang]}
          </h1>
          <p className="mt-1 text-sm text-ink-400">{UI.appSubtitle[lang]}</p>
        </div>
        <LanguageSwitcher lang={lang} onChange={handleLang} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <section className="no-print space-y-6 self-start rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-ink-900 uppercase">
              {UI.inputSection[lang]}
            </h2>
            <LessonForm
              lang={lang}
              value={form}
              onChange={setForm}
              error={error}
            />
          </div>

          <BlockToggles
            lang={lang}
            enabled={enabled}
            onToggle={handleToggle}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={BUTTON_PRIMARY}
              onClick={handleGenerate}
            >
              {plan ? UI.regenerate[lang] : UI.generate[lang]}
            </button>
            <button
              type="button"
              className={BUTTON_SECONDARY}
              disabled={!plan || enhancing}
              onClick={handleEnhance}
            >
              {enhancing ? UI.enhancing[lang] : UI.enhance[lang]}
            </button>
          </div>

          {meta && plan && (
            <dl className="space-y-1.5 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold">{UI.experiment[lang]}:</dt>
                <dd>{meta.experimentTitle}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 font-semibold">{UI.method[lang]}:</dt>
                <dd>{meta.methodName}</dd>
              </div>
            </dl>
          )}

          {notice && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              {notice}
            </p>
          )}
        </section>

        <section className="min-w-0">
          {plan ? (
            <>
              <div className="no-print mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={BUTTON_SECONDARY}
                  onClick={() => handleExport("docx")}
                >
                  {UI.exportDocx[lang]}
                </button>
                <button
                  type="button"
                  className={BUTTON_SECONDARY}
                  onClick={() => handleExport("pdf")}
                >
                  {UI.exportPdf[lang]}
                </button>
              </div>
              <KspPreview lang={lang} plan={plan} onPatch={setPlan} />
            </>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white/50 p-8 text-center text-sm text-ink-400">
              {UI.emptyState[lang]}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
