/**
 * Проверка экспорта: собирает DOCX и PDF на русском и казахском,
 * кладёт файлы в OUT_DIR и печатает результат.
 *
 * Запуск: npx tsx scripts/verify-export.ts [OUT_DIR]
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Packer } from "docx";
import PdfPrinter from "pdfmake";
import { generatePlan } from "../lib/generator";
import { buildDocxDocument } from "../lib/export/docx";
import { buildPdfDefinition } from "../lib/export/pdf";
import type { Lang, LessonInput } from "../lib/types";

const OUT_DIR = process.argv[2] ?? "/tmp/ksp-verify";
mkdirSync(OUT_DIR, { recursive: true });

/** Достаёт встроенный в pdfmake Roboto и кладёт на диск для PdfPrinter. */
function extractFonts(dir: string): Record<string, Record<string, string>> {
  const source = readFileSync(
    "node_modules/pdfmake/build/vfs_fonts.js",
    "utf8",
  );
  const names = [
    "Roboto-Regular.ttf",
    "Roboto-Medium.ttf",
    "Roboto-Italic.ttf",
    "Roboto-MediumItalic.ttf",
  ];
  for (const name of names) {
    const match = source.match(
      new RegExp(`"${name.replace(".", "\\.")}":\\s*"([A-Za-z0-9+/=]+)"`),
    );
    if (!match) throw new Error(`Шрифт ${name} не найден в vfs_fonts.js`);
    writeFileSync(join(dir, name), Buffer.from(match[1], "base64"));
  }
  return {
    Roboto: {
      normal: join(dir, "Roboto-Regular.ttf"),
      bold: join(dir, "Roboto-Medium.ttf"),
      italics: join(dir, "Roboto-Italic.ttf"),
      bolditalics: join(dir, "Roboto-MediumItalic.ttf"),
    },
  };
}

const CASES: { lang: Lang; input: LessonInput }[] = [
  {
    lang: "ru",
    input: {
      topic: "Скорость химической реакции",
      objectivesRaw:
        "9.3.4.1 объяснять влияние концентрации, температуры, площади поверхности и катализатора на скорость реакции\n9.3.4.2 планировать эксперимент по исследованию скорости реакции",
      durationMinutes: 40,
      grade: "9",
      teacher: "Иванова А. К.",
      date: "2026-09-21",
      present: "24",
      absent: "1",
    },
  },
  {
    lang: "kk",
    input: {
      topic: "Электролиттік диссоциация",
      objectivesRaw:
        "9.1.1.1 электролиттік диссоциация теориясының негізгі қағидаларын түсіндіру\n9.1.1.2 қышқылдар, негіздер және тұздардың диссоциация теңдеулерін жазу",
      durationMinutes: 45,
      grade: "9",
      teacher: "Қасымова Ә. Ғ.",
      date: "2026-09-21",
      present: "26",
      absent: "0",
    },
  },
];

async function main(): Promise<void> {
  const fonts = extractFonts(OUT_DIR);
  const printer = new PdfPrinter(fonts);

  for (const testCase of CASES) {
    const { plan, matched, experimentTitle } = generatePlan(
      testCase.input,
      testCase.lang,
    );
    console.log(
      `\n[${testCase.lang}] «${testCase.input.topic}» — в базе: ${matched ? "да" : "нет"}; опыт: ${experimentTitle}`,
    );
    console.log(
      `  этапы: ${plan.stages.map((s) => `${s.fromMinute}–${s.fromMinute + s.minutes}`).join(", ")} (всего ${plan.durationMinutes} мин)`,
    );

    const docxBuffer = await Packer.toBuffer(buildDocxDocument(plan, testCase.lang));
    const docxPath = join(OUT_DIR, `ksp-${testCase.lang}.docx`);
    writeFileSync(docxPath, docxBuffer);
    console.log(`  DOCX: ${docxPath} (${(docxBuffer.length / 1024).toFixed(1)} КБ)`);

    const definition = buildPdfDefinition(plan, testCase.lang);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = printer.createPdfKitDocument(definition as any);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve());
      pdfDoc.on("error", reject);
      pdfDoc.end();
    });
    const pdfBuffer = Buffer.concat(chunks);
    const pdfPath = join(OUT_DIR, `ksp-${testCase.lang}.pdf`);
    writeFileSync(pdfPath, pdfBuffer);
    console.log(`  PDF:  ${pdfPath} (${(pdfBuffer.length / 1024).toFixed(1)} КБ)`);
  }

  console.log("\nГотово.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
