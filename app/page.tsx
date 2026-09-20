"use client";

import { useCallback, useEffect, useState } from "react";
import BlockToggles from "@/components/BlockToggles";
import KspPreview from "@/components/KspPreview";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LessonForm from "@/components/LessonForm";
import PlanLibrary from "@/components/PlanLibrary";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { applyEnhancement } from "@/lib/enhance";
import { generatePlan } from "@/lib/generator";
import { UI } from "@/lib/i18n";
import { DEFAULT_ENABLED } from "@/lib/ksp-template";
import {
  deletePlan,
  duplicatePlan,
  loadDraft,
  loadLibrary,
  newId,
  savePlan,
  saveDraft,
  storageAvailable,
  type SavedPlan,
} from "@/lib/storage";
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
  "rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50";

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
  const [library, setLibrary] = useState<SavedPlan[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  /** Были ли ручные правки после последней генерации. */
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // localStorage и текущая дата читаются только после монтирования:
  // на сервере их нет, а дата на сервере и клиенте могла бы разойтись.
  useEffect(() => {
    const available = storageAvailable();
    setStorageOk(available);
    if (available) {
      setLibrary(loadLibrary());
      const draft = loadDraft();
      if (draft) {
        setLang(draft.lang);
        setForm(draft.input);
        setEnabled(draft.enabled);
        if (draft.plan) {
          setPlan(draft.plan);
          setNotice(UI.draftRestored[draft.lang]);
        }
      }
    }
    setForm((current) =>
      current.date
        ? current
        : { ...current, date: new Date().toISOString().slice(0, 10) },
    );
  }, []);

  // Автосохранение черновика: перезагрузка страницы не должна терять работу.
  useEffect(() => {
    if (!storageOk) return;
    saveDraft({ lang, input: form, plan, enabled });
  }, [storageOk, lang, form, plan, enabled]);

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
      setDirty(false);
      setJustSaved(false);
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

  /**
   * Смена языка меняет и интерфейс, и документ, поэтому план пересобирается.
   * Ручные правки в ячейках при этом теряются — предупреждаем об этом до того,
   * как они пропадут, а не после.
   */
  const handleLang = (next: Lang) => {
    if (plan && dirty && !window.confirm(UI.langSwitchWarning[lang])) return;
    setLang(next);
    if (plan) build(form, next);
  };

  /** Любая ручная правка ячейки помечает план изменённым. */
  const handlePatch = (next: KspPlan) => {
    setPlan(next);
    setDirty(true);
    setJustSaved(false);
  };

  const handleSave = () => {
    if (!plan || !storageOk) return;
    const id = currentId ?? newId();
    setLibrary(
      savePlan({
        id,
        savedAt: new Date().toISOString(),
        lang,
        input: form,
        plan,
        enabled,
      }),
    );
    setCurrentId(id);
    setDirty(false);
    setJustSaved(true);
  };

  const handleOpen = (id: string) => {
    const entry = library.find((item) => item.id === id);
    if (!entry) return;
    setLang(entry.lang);
    setForm(entry.input);
    setEnabled(entry.enabled);
    setPlan(entry.plan);
    setCurrentId(id);
    setMeta(null);
    setNotice(null);
    setError(null);
    setDirty(false);
    setJustSaved(false);
  };

  const handleDuplicate = (id: string) => setLibrary(duplicatePlan(id));

  const handleDelete = (id: string) => {
    if (!window.confirm(UI.deleteConfirm[lang])) return;
    setLibrary(deletePlan(id));
    if (currentId === id) setCurrentId(null);
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
      setPlan(applyEnhancement(plan, enhanced));
      setDirty(true);
      setJustSaved(false);
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
        <div className="flex flex-wrap items-center gap-2">
          <ThemeSwitcher lang={lang} />
          <LanguageSwitcher lang={lang} onChange={handleLang} />
        </div>
      </header>

      <div className="ksp-layout grid gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
        <section className="no-print space-y-6 self-start rounded-xl border border-ink-200 bg-surface p-4 shadow-sm sm:p-5">
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

          <PlanLibrary
            lang={lang}
            items={library}
            currentId={currentId}
            available={storageOk}
            onOpen={handleOpen}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
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
            <p className="rounded-lg bg-warn-bg p-3 text-xs text-warn-text">
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
                <button
                  type="button"
                  className={BUTTON_SECONDARY}
                  onClick={() => window.print()}
                >
                  {UI.print[lang]}
                </button>
                <button
                  type="button"
                  className={BUTTON_SECONDARY}
                  disabled={!storageOk || justSaved}
                  onClick={handleSave}
                >
                  {justSaved ? UI.saved[lang] : UI.saveToLibrary[lang]}
                </button>
              </div>
              <KspPreview lang={lang} plan={plan} onPatch={handlePatch} />
            </>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-ink-200 bg-surface/50 p-8 text-center text-sm text-ink-400">
              {UI.emptyState[lang]}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
