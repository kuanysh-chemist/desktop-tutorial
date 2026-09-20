"use client";

import AutoTextarea from "./AutoTextarea";
import { UI } from "@/lib/i18n";
import {
  DOC_TITLE,
  EXTRA_LABELS,
  EXTRA_ORDER,
  FLOW_COLUMNS,
  FLOW_TITLE,
  HEADER_LABELS,
} from "@/lib/ksp-template";
import { stageTitle } from "@/lib/generator";
import type { ExtraKey, KspPlan, Lang, LessonStage } from "@/lib/types";

type StageField = "teacher" | "student" | "assessment" | "resources";

const TH =
  "border border-ink-400 bg-ink-100 px-2 py-2 text-left align-top text-xs font-semibold text-ink-900";
const TD = "border border-ink-400 px-2 py-2 align-top text-xs text-ink-900";
const LABEL_CELL =
  "border border-ink-400 bg-ink-100 px-2 py-2 align-top text-xs font-semibold text-ink-900 w-1/3";

/** Предпросмотр КСП. Любая ячейка редактируется прямо в таблице. */
export default function KspPreview({
  lang,
  plan,
  onPatch,
}: {
  lang: Lang;
  plan: KspPlan;
  onPatch: (next: KspPlan) => void;
}) {
  const setHeader = (key: keyof typeof HEADER_LABELS, value: string) => {
    if (key === "objectives" || key === "lessonGoals") return;
    onPatch({ ...plan, header: { ...plan.header, [key]: value } });
  };

  const setObjective = (index: number, value: string) => {
    const objectives = plan.header.objectives.map((objective, i) =>
      i === index ? { ...objective, text: value } : objective,
    );
    onPatch({ ...plan, header: { ...plan.header, objectives } });
  };

  const setGoal = (index: number, value: string) => {
    const lessonGoals = plan.header.lessonGoals.map((goal, i) =>
      i === index ? value : goal,
    );
    onPatch({ ...plan, header: { ...plan.header, lessonGoals } });
  };

  const setStage = (index: number, field: StageField, value: string) => {
    const stages = plan.stages.map((stage, i) =>
      i === index ? { ...stage, [field]: value } : stage,
    );
    onPatch({ ...plan, stages });
  };

  const setExtra = (key: ExtraKey, value: string) => {
    onPatch({ ...plan, extras: { ...plan.extras, [key]: value } });
  };

  const simpleHeaderRows: (keyof typeof HEADER_LABELS)[] = [
    "section",
    "teacher",
    "date",
    "grade",
    "present",
    "absent",
    "topic",
  ];

  const activeExtras = EXTRA_ORDER.filter((key) => plan.enabled[key]);

  return (
    <div className="print-area rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-1 text-center text-base font-bold text-ink-900">
        {DOC_TITLE[lang]}
      </h2>
      <p className="no-print mb-4 text-center text-xs text-ink-400">
        {UI.previewHint[lang]}
      </p>

      {/* Шапка: восемь обязательных полей формы приказа № 130 */}
      <table className="mb-6 w-full table-fixed border-collapse">
        <tbody>
          {simpleHeaderRows.map((key) => (
            <tr key={key}>
              <th scope="row" className={LABEL_CELL}>
                {HEADER_LABELS[key][lang]}
              </th>
              <td className={TD}>
                <AutoTextarea
                  ariaLabel={HEADER_LABELS[key][lang]}
                  value={String(plan.header[key] ?? "")}
                  onChange={(next) => setHeader(key, next)}
                />
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row" className={LABEL_CELL}>
              {HEADER_LABELS.objectives[lang]}
            </th>
            <td className={TD}>
              {plan.header.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  {objective.code && (
                    <span className="shrink-0 font-mono text-[11px] text-brand-600">
                      {objective.code}
                    </span>
                  )}
                  <AutoTextarea
                    ariaLabel={`${HEADER_LABELS.objectives[lang]} ${index + 1}`}
                    value={objective.text}
                    onChange={(next) => setObjective(index, next)}
                  />
                </div>
              ))}
            </td>
          </tr>
          <tr>
            <th scope="row" className={LABEL_CELL}>
              {HEADER_LABELS.lessonGoals[lang]}
            </th>
            <td className={TD}>
              {plan.header.lessonGoals.map((goal, index) => (
                <AutoTextarea
                  key={index}
                  ariaLabel={`${HEADER_LABELS.lessonGoals[lang]} ${index + 1}`}
                  value={goal}
                  onChange={(next) => setGoal(index, next)}
                />
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Ход урока: пять обязательных колонок × три этапа */}
      <h3 className="mb-2 text-sm font-bold text-ink-900">{FLOW_TITLE[lang]}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse">
          <colgroup>
            {FLOW_COLUMNS.map((column) => (
              <col key={column.key} style={{ width: `${column.width}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {FLOW_COLUMNS.map((column) => (
                <th key={column.key} scope="col" className={TH}>
                  {column.label[lang]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plan.stages.map((stage: LessonStage, index) => (
              <tr key={stage.id}>
                <td className={`${TD} whitespace-pre-line font-medium`}>
                  {stageTitle(stage, lang, true)}
                </td>
                {(
                  ["teacher", "student", "assessment", "resources"] as StageField[]
                ).map((field) => (
                  <td key={field} className={TD}>
                    <AutoTextarea
                      ariaLabel={`${stageTitle(stage, lang)} — ${field}`}
                      value={stage[field]}
                      onChange={(next) => setStage(index, field, next)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Расширенные методические блоки — по тумблерам */}
      {activeExtras.length > 0 && (
        <table className="mt-6 w-full table-fixed border-collapse">
          <tbody>
            {activeExtras.map((key) => (
              <tr key={key}>
                <th scope="row" className={LABEL_CELL}>
                  {EXTRA_LABELS[key][lang]}
                </th>
                <td className={TD}>
                  <AutoTextarea
                    ariaLabel={EXTRA_LABELS[key][lang]}
                    value={plan.extras[key]}
                    onChange={(next) => setExtra(key, next)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
