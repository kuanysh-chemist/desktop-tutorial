"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  activeMethods: string[];
  ictNames: string[];
}

const BUTTON_PRIMARY =
  "rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_SECONDARY =
  "rounded-lg border border-ink-200 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-brand-500 hover:text-brand-700 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";
const CARD =
  "rounded-xl border border-ink-200 bg-surface p-4 shadow-sm sm:p-5";
const CARD_TITLE =
  "mb-4 text-xs font-semibold tracking-[0.08em] text-ink-400 uppercase";

/** Колба — единственный рисунок в интерфейсе, знак предмета. */
function FlaskMark() {
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-sm"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6" />
        <path d="M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3" />
        <path d="M7.4 14h9.2" />
      </svg>
    </span>
  );
}

/**
 * Всё приложение целиком. Вынесено из страницы Next.js, потому что этот же
 * код собирается вторым, автономным способом — в один HTML-файл, который
 * учитель открывает с флешки двойным щелчком.
 *
 * offline — сборка без сервера: обращаться к /api/suggest неоткуда, поэтому
 * кнопка доработки через Claude в таком режиме не показывается.
 */
export default function KspApp({ offline = false }: { offline?: boolean }) {
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
  /**
   * Номер сценария урока. Та же тема с другим номером собирается из других
   * приёмов и цифровых ресурсов — это и есть кнопка «Другой вариант».
   */
  const [variant, setVariant] = useState(0);
  /** На узком экране готовый план оказывается далеко внизу — прокручиваем к нему. */
  const previewRef = useRef<HTMLElement>(null);
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
    (input: LessonInput, targetLang: Lang, targetVariant: number) => {
      const result = generatePlan(input, targetLang, targetVariant);
      setPlan({ ...result.plan, enabled });
      setMeta({
        matched: result.matched,
        experimentTitle: result.experimentTitle,
        methodName: result.methodName,
        activeMethods: result.activeMethods,
        ictNames: result.ictNames,
      });
      setNotice(result.matched ? null : UI.noMatch[targetLang]);
      setDirty(false);
      setJustSaved(false);
      if (window.innerWidth < 1024) {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
    build(form, lang, variant);
  };

  /**
   * Собирает тот же урок из других приёмов. Правки в ячейках при этом
   * теряются, поэтому предупреждаем до того, как они пропадут.
   */
  const handleAnotherVariant = () => {
    if (!plan) return;
    if (dirty && !window.confirm(UI.variantWarning[lang])) return;
    const next = variant + 1;
    setVariant(next);
    build(form, lang, next);
  };

  /**
   * Смена языка меняет и интерфейс, и документ, поэтому план пересобирается.
   * Ручные правки в ячейках при этом теряются — предупреждаем об этом до того,
   * как они пропадут, а не после.
   */
  const handleLang = (next: Lang) => {
    if (plan && dirty && !window.confirm(UI.langSwitchWarning[lang])) return;
    setLang(next);
    if (plan) build(form, next, variant);
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
    setVariant(0);
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

  /**
   * Ctrl/Cmd + Enter собирает план прямо из поля ввода: учителю не нужно
   * тянуться к кнопке после того, как он дописал цели обучения.
   */
  const handleFormKeys = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    handleGenerate();
  };

  const metaRows =
    meta && plan
      ? [
          { label: UI.experiment[lang], value: meta.experimentTitle },
          { label: UI.method[lang], value: meta.methodName },
          { label: UI.activeMethodsLabel[lang], value: meta.activeMethods.join(" · ") },
          { label: UI.ictLabel[lang], value: meta.ictNames.join(" · ") },
          { label: UI.variantLabel[lang], value: `№ ${variant + 1}` },
        ]
      : [];

  return (
    <main className="mx-auto max-w-[1500px] px-4 pt-5 pb-10 sm:px-6 lg:px-8">
      <header className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FlaskMark />
          <div>
            <h1 className="text-lg leading-tight font-bold text-ink-900 sm:text-xl">
              {UI.appTitle[lang]}
            </h1>
            <p className="mt-0.5 text-xs text-ink-400 sm:text-sm">
              {UI.appSubtitle[lang]}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeSwitcher lang={lang} />
          <LanguageSwitcher lang={lang} onChange={handleLang} />
        </div>
      </header>

      <div className="ksp-layout grid gap-4 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <div className="no-print space-y-4 self-start">
          <section className={CARD} onKeyDown={handleFormKeys}>
            <h2 className={CARD_TITLE}>{UI.inputSection[lang]}</h2>
            <LessonForm
              lang={lang}
              value={form}
              onChange={setForm}
              error={error}
            />

            <div className="mt-5 flex flex-wrap gap-2">
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
                disabled={!plan}
                onClick={handleAnotherVariant}
              >
                {UI.anotherVariant[lang]}
              </button>
              {!offline && (
                <button
                  type="button"
                  className={BUTTON_SECONDARY}
                  disabled={!plan || enhancing}
                  onClick={handleEnhance}
                >
                  {enhancing ? UI.enhancing[lang] : UI.enhance[lang]}
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-ink-400">{UI.generateHint[lang]}</p>

            {meta && plan && (
              <div className="mt-4 rounded-lg border border-ink-200 bg-ink-50 p-3">
                {meta.matched && (
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brand-700">
                    <svg aria-hidden viewBox="0 0 20 20" className="size-4 shrink-0" fill="currentColor">
                      <path d="M8.2 13.6 4.6 10l1.2-1.2 2.4 2.4 6-6L15.4 6z" />
                    </svg>
                    {UI.matchedTopic[lang]}
                  </p>
                )}
                <dl className="space-y-2 text-xs">
                  {metaRows.map((row) => (
                    <div key={row.label}>
                      <dt className="text-ink-400">{row.label}</dt>
                      <dd className="mt-0.5 text-ink-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {plan && !form.teacher.trim() && (
              <p className="mt-3 rounded-lg bg-warn-bg p-3 text-xs text-warn-text">
                {UI.fillTeacher[lang]}
              </p>
            )}

            {notice && (
              <p className="mt-3 rounded-lg bg-warn-bg p-3 text-xs text-warn-text">
                {notice}
              </p>
            )}
          </section>

          <section className={CARD}>
            <BlockToggles lang={lang} enabled={enabled} onToggle={handleToggle} />
          </section>

          <section className={CARD}>
            <PlanLibrary
              lang={lang}
              items={library}
              currentId={currentId}
              available={storageOk}
              onOpen={handleOpen}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          </section>
        </div>

        <section className="min-w-0" ref={previewRef}>
          {plan ? (
            <>
              <div className="no-print sticky top-0 z-10 mb-3 flex flex-wrap gap-2 rounded-b-xl bg-ink-50/95 py-2 shadow-[0_10px_16px_-14px_rgba(15,23,42,0.6)] backdrop-blur">
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
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-surface/60 p-8 text-center">
              <FlaskMark />
              <p className="max-w-sm text-sm text-ink-600">
                {UI.emptyState[lang]}
              </p>
              <p className="max-w-sm text-xs text-ink-400">
                {UI.emptyHint[lang]}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
