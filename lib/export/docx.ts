/**
 * Экспорт КСП в .DOCX со строгим сохранением табличной структуры формы:
 * шапка, таблица «Ход урока» из пяти колонок и трёх этапов, затем включённые
 * методические блоки.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
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
import { downloadBlob } from "./download";
import { buildFileName } from "./filename";

const EDGE = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const TABLE_BORDERS = {
  top: EDGE,
  bottom: EDGE,
  left: EDGE,
  right: EDGE,
  insideHorizontal: EDGE,
  insideVertical: EDGE,
};
const LABEL_FILL = "EFEFEF";

/** Многострочный текст ячейки → набор абзацев. */
function textCell(
  text: string,
  options: { bold?: boolean; fill?: string; widthPercent?: number } = {},
): TableCell {
  const lines = (text || "").split("\n");
  return new TableCell({
    shading: options.fill ? { fill: options.fill } : undefined,
    width: options.widthPercent
      ? { size: options.widthPercent, type: WidthType.PERCENTAGE }
      : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: lines.map(
      (line) =>
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: line, bold: options.bold, size: 18 })],
        }),
    ),
  });
}

function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      textCell(label, { bold: true, fill: LABEL_FILL, widthPercent: 30 }),
      textCell(value, { widthPercent: 70 }),
    ],
  });
}

function buildHeaderTable(plan: KspPlan, lang: Lang): Table {
  const objectives = plan.header.objectives
    .map((objective) =>
      [objective.code, objective.text].filter(Boolean).join(" "),
    )
    .join("\n");

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      labelValueRow(HEADER_LABELS.section[lang], plan.header.section),
      labelValueRow(HEADER_LABELS.teacher[lang], plan.header.teacher),
      labelValueRow(HEADER_LABELS.date[lang], plan.header.date),
      labelValueRow(HEADER_LABELS.grade[lang], plan.header.grade),
      labelValueRow(HEADER_LABELS.present[lang], plan.header.present),
      labelValueRow(HEADER_LABELS.absent[lang], plan.header.absent),
      labelValueRow(HEADER_LABELS.topic[lang], plan.header.topic),
      labelValueRow(HEADER_LABELS.objectives[lang], objectives),
      labelValueRow(
        HEADER_LABELS.lessonGoals[lang],
        plan.header.lessonGoals.join("\n"),
      ),
    ],
  });
}

function buildFlowTable(plan: KspPlan, lang: Lang): Table {
  const head = new TableRow({
    tableHeader: true,
    children: FLOW_COLUMNS.map((column) =>
      textCell(column.label[lang], {
        bold: true,
        fill: LABEL_FILL,
        widthPercent: column.width,
      }),
    ),
  });

  const rows = plan.stages.map(
    (stage) =>
      new TableRow({
        children: [
          textCell(stageTitle(stage, lang, true), {
            bold: true,
            widthPercent: FLOW_COLUMNS[0].width,
          }),
          textCell(stage.teacher, { widthPercent: FLOW_COLUMNS[1].width }),
          textCell(stage.student, { widthPercent: FLOW_COLUMNS[2].width }),
          textCell(stage.assessment, { widthPercent: FLOW_COLUMNS[3].width }),
          textCell(stage.resources, { widthPercent: FLOW_COLUMNS[4].width }),
        ],
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [head, ...rows],
  });
}

function buildExtrasTable(plan: KspPlan, lang: Lang): Table | null {
  const active = EXTRA_ORDER.filter((key: ExtraKey) => plan.enabled[key]);
  if (active.length === 0) return null;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: active.map((key) =>
      labelValueRow(EXTRA_LABELS[key][lang], plan.extras[key]),
    ),
  });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 22 })],
  });
}

/** Строит объект документа. Вынесено отдельно, чтобы покрывать тестами. */
export function buildDocxDocument(plan: KspPlan, lang: Lang): Document {
  const extras = buildExtrasTable(plan, lang);

  return new Document({
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 18 } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 1080 } },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: DOC_TITLE[lang], bold: true, size: 26 }),
            ],
          }),
          buildHeaderTable(plan, lang),
          heading(FLOW_TITLE[lang]),
          buildFlowTable(plan, lang),
          ...(extras ? [new Paragraph({ spacing: { after: 160 } }), extras] : []),
        ],
      },
    ],
  });
}

/** Собирает документ и отдаёт его браузеру на скачивание. */
export async function exportDocx(plan: KspPlan, lang: Lang): Promise<void> {
  const blob = await Packer.toBlob(buildDocxDocument(plan, lang));
  downloadBlob(blob, buildFileName(plan, lang, "docx"));
}
