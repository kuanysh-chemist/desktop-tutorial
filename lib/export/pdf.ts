/**
 * Экспорт КСП в .PDF через pdfmake.
 *
 * Шрифт Roboto, встроенный в pdfmake, проверенно содержит все 18 казахских
 * кириллических букв (ә ғ қ ң ө ұ ү һ і и заглавные), поэтому документ
 * корректен и на казахском языке. Табличная структура формы сохраняется:
 * ширины колонок заданы в пунктах и повторяют пропорции ksp-template.ts.
 */
import {
  DOC_TITLE,
  EXTRA_LABELS,
  EXTRA_ORDER,
  FLOW_COLUMNS,
  FLOW_TITLE,
  HEADER_LABELS,
} from "../ksp-template";
import { stageTitle } from "../generator";
import type { ExtraKey, KspPlan, Lang } from "../types";
import { buildFileName } from "./filename";

/** A4 книжная: ширина 595,28 пт, поля по 28 пт. */
const PAGE_WIDTH = 595.28;
const MARGIN = 28;

/** Запас на внутренние отступы ячеек и линии рамки. */
function usableWidth(columns: number): number {
  return PAGE_WIDTH - MARGIN * 2 - columns * 8 - (columns + 1);
}

const LABEL_FILL = "#efefef";

type Cell = { text: string; bold?: boolean; fillColor?: string };

function cell(text: string, bold = false, fill?: string): Cell {
  return { text: text || "", bold, fillColor: fill };
}

function labelRow(label: string, value: string): Cell[] {
  return [cell(label, true, LABEL_FILL), cell(value)];
}

/** Строит описание документа для pdfmake. Вынесено отдельно для тестов. */
export function buildPdfDefinition(plan: KspPlan, lang: Lang) {
  const twoColumn = usableWidth(2);
  const headerWidths = [twoColumn * 0.3, twoColumn * 0.7];
  const flowWidths = FLOW_COLUMNS.map(
    (column) => (usableWidth(FLOW_COLUMNS.length) * column.width) / 100,
  );

  const objectives = plan.header.objectives
    .map((objective) =>
      [objective.code, objective.text].filter(Boolean).join(" "),
    )
    .join("\n");

  const headerBody: Cell[][] = [
    labelRow(HEADER_LABELS.section[lang], plan.header.section),
    labelRow(HEADER_LABELS.teacher[lang], plan.header.teacher),
    labelRow(HEADER_LABELS.date[lang], plan.header.date),
    labelRow(HEADER_LABELS.grade[lang], plan.header.grade),
    labelRow(HEADER_LABELS.present[lang], plan.header.present),
    labelRow(HEADER_LABELS.absent[lang], plan.header.absent),
    labelRow(HEADER_LABELS.topic[lang], plan.header.topic),
    labelRow(HEADER_LABELS.objectives[lang], objectives),
    labelRow(HEADER_LABELS.lessonGoals[lang], plan.header.lessonGoals.join("\n")),
  ];

  const flowBody: Cell[][] = [
    FLOW_COLUMNS.map((column) => cell(column.label[lang], true, LABEL_FILL)),
    ...plan.stages.map((stage) => [
      cell(stageTitle(stage, lang, true), true),
      cell(stage.teacher),
      cell(stage.student),
      cell(stage.assessment),
      cell(stage.resources),
    ]),
  ];

  const activeExtras = EXTRA_ORDER.filter((key: ExtraKey) => plan.enabled[key]);

  const content: unknown[] = [
    { text: DOC_TITLE[lang], style: "title" },
    {
      table: { widths: headerWidths, body: headerBody },
      layout: "grid",
    },
    { text: FLOW_TITLE[lang], style: "section" },
    {
      table: { headerRows: 1, widths: flowWidths, body: flowBody },
      layout: "grid",
    },
  ];

  if (activeExtras.length > 0) {
    content.push({
      margin: [0, 14, 0, 0],
      table: {
        widths: headerWidths,
        body: activeExtras.map((key) =>
          labelRow(EXTRA_LABELS[key][lang], plan.extras[key]),
        ),
      },
      layout: "grid",
    });
  }

  return {
    pageSize: "A4",
    pageMargins: [MARGIN, MARGIN, MARGIN, MARGIN],
    defaultStyle: { font: "Roboto", fontSize: 8, lineHeight: 1.15 },
    styles: {
      title: {
        fontSize: 12,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      section: { fontSize: 10, bold: true, margin: [0, 14, 0, 6] },
    },
    content,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Загружает pdfmake и подключает встроенные шрифты. */
async function loadPdfMake(): Promise<any> {
  const pdfMakeModule: any = await import("pdfmake/build/pdfmake");
  const pdfMake: any = pdfMakeModule.default ?? pdfMakeModule;
  const vfsModule: any = await import("pdfmake/build/vfs_fonts");
  const vfs: any = vfsModule.default ?? vfsModule;

  if (typeof pdfMake.addVirtualFileSystem === "function") {
    pdfMake.addVirtualFileSystem(vfs);
  } else {
    pdfMake.vfs = vfs?.pdfMake?.vfs ?? vfs;
  }
  return pdfMake;
}

/** Собирает PDF и отдаёт его браузеру на скачивание. */
export async function exportPdf(plan: KspPlan, lang: Lang): Promise<void> {
  const pdfMake = await loadPdfMake();
  const definition = buildPdfDefinition(plan, lang) as any;
  pdfMake.createPdf(definition).download(buildFileName(plan, lang, "pdf"));
}
