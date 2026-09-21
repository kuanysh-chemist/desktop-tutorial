/**
 * Проверка экспорта: собирает DOCX и PDF на русском и казахском,
 * кладёт файлы в OUT_DIR и сверяет их содержимое с планом.
 *
 * Раньше скрипт только печатал размеры файлов — это ничего не доказывало.
 * Теперь DOCX распаковывается и проверяется построчно, а у PDF читается
 * карта ToUnicode: в ней перечислены символы, которые документ реально умеет
 * показать. Если бы шрифт не покрывал казахскую букву, в карте её бы не было,
 * а в документе на её месте стоял бы пустой прямоугольник.
 *
 * Запуск: npx tsx scripts/verify-export.ts [OUT_DIR]
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { inflateRawSync, inflateSync } from "node:zlib";
import { join } from "node:path";
import { Packer } from "docx";
import PdfPrinter from "pdfmake";
import { generatePlan } from "../lib/generator";
import { buildDocxDocument } from "../lib/export/docx";
import { buildPdfDefinition } from "../lib/export/pdf";
import { EXTRA_ORDER } from "../lib/ksp-template";
import type { KspPlan, Lang, LessonInput } from "../lib/types";

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


/** Читает один файл из ZIP-контейнера (DOCX) без внешних зависимостей. */
function readZipEntry(zip: Buffer, name: string): string {
  const target = Buffer.from(name, "utf8");
  for (let i = 0; i + 30 < zip.length; i++) {
    if (zip.readUInt32LE(i) !== 0x04034b50) continue;
    const method = zip.readUInt16LE(i + 8);
    const compressed = zip.readUInt32LE(i + 18);
    const nameLength = zip.readUInt16LE(i + 26);
    const extraLength = zip.readUInt16LE(i + 28);
    const start = i + 30;
    if (!zip.subarray(start, start + nameLength).equals(target)) continue;
    const dataStart = start + nameLength + extraLength;
    const data = zip.subarray(dataStart, dataStart + compressed);
    return (method === 0 ? data : inflateRawSync(data)).toString("utf8");
  }
  throw new Error(`В DOCX нет файла ${name}`);
}

/** Текст документа Word без разметки: достаточно для сверки формулировок. */
function docxText(xml: string): string {
  return xml
    .replace(/<w:br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Символы, которые PDF способен показать.
 *
 * Каждый встроенный подшрифт несёт карту ToUnicode — соответствие кода глифа
 * символу Юникода. Объединение правых частей этих карт и есть множество
 * символов, реально попавших в документ.
 *
 * Формат карты у pdfkit — bfrange со списком: «<от> <до> [<символ> …]».
 * Есть и вторая форма, со сдвигом: «<от> <до> <первый символ>». Разбирать их
 * одной регуляркой нельзя: пары внутри списка выглядят как отдельные записи,
 * и в множество попадает каждый второй символ. Поэтому тело секции читается
 * токенами.
 */
function pdfCharacters(pdf: Buffer): Set<string> {
  const found = new Set<string>();
  for (const cmap of inflatedStreams(pdf)) {
    if (!cmap.includes("beginbf")) continue;
    for (const block of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
      for (const pair of block[1].matchAll(
        /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g,
      )) {
        found.add(decodeUtf16be(pair[2]));
      }
    }
    for (const block of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
      collectBfRange(block[1], found);
    }
  }
  return found;
}

type CMapToken = { hex: string } | { list: string };

function collectBfRange(body: string, found: Set<string>): void {
  const tokens: CMapToken[] = [];
  for (const match of body.matchAll(/<([0-9a-fA-F]+)>|\[([^\]]*)\]/g)) {
    tokens.push(
      match[1] !== undefined ? { hex: match[1] } : { list: match[2] ?? "" },
    );
  }
  for (let i = 0; i + 2 < tokens.length; i += 3) {
    const [from, to, value] = tokens.slice(i, i + 3);
    if (!("hex" in from) || !("hex" in to)) break;
    if ("list" in value) {
      for (const unit of value.list.matchAll(/<([0-9a-fA-F]+)>/g)) {
        found.add(decodeUtf16be(unit[1]));
      }
      continue;
    }
    const first = parseInt(from.hex, 16);
    const last = parseInt(to.hex, 16);
    const base = parseInt(value.hex, 16);
    for (let code = first; code <= last && code - first < 65536; code++) {
      found.add(String.fromCodePoint(base + (code - first)));
    }
  }
}

/** Распакованные содержимым потоки PDF. */
function* inflatedStreams(pdf: Buffer): Generator<string> {
  const marker = Buffer.from("stream", "latin1");
  const terminator = Buffer.from("endstream", "latin1");
  for (let i = pdf.indexOf(marker); i >= 0; i = pdf.indexOf(marker, i + 6)) {
    let start = i + 6;
    if (pdf[start] === 0x0d) start++;
    if (pdf[start] === 0x0a) start++;
    const end = pdf.indexOf(terminator, start);
    if (end < 0) continue;
    try {
      yield inflateSync(pdf.subarray(start, end)).toString("latin1");
    } catch {
      continue;
    }
  }
}

function decodeUtf16be(hex: string): string {
  const units: number[] = [];
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    units.push(parseInt(hex.slice(i, i + 4), 16));
  }
  return String.fromCharCode(...units);
}

/** Все строки плана, которые обязаны оказаться в документе. */
function planLines(plan: KspPlan): string[] {
  const cells = [
    plan.header.section,
    plan.header.topic,
    plan.header.teacher,
    ...plan.header.lessonGoals,
    ...plan.stages.flatMap((stage) => [
      stage.teacher,
      stage.student,
      stage.assessment,
      stage.resources,
    ]),
    ...EXTRA_ORDER.filter((key) => plan.enabled[key]).map(
      (key) => plan.extras[key],
    ),
  ];
  return cells
    .flatMap((cell) => cell.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line.length > 3);
}

const problems: string[] = [];

function check(label: string, ok: boolean, detail: string): void {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}: ${detail}`);
  if (!ok) problems.push(`${label}: ${detail}`);
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

    const expected = planLines(plan);

    const docxBuffer = await Packer.toBuffer(buildDocxDocument(plan, testCase.lang));
    const docxPath = join(OUT_DIR, `ksp-${testCase.lang}.docx`);
    writeFileSync(docxPath, docxBuffer);
    console.log(`  DOCX: ${docxPath} (${(docxBuffer.length / 1024).toFixed(1)} КБ)`);

    const xml = readZipEntry(docxBuffer, "word/document.xml");
    const text = docxText(xml);
    const missing = expected.filter((line) => !text.includes(line));
    check(
      "DOCX содержит весь план",
      missing.length === 0,
      missing.length
        ? `потеряно строк: ${missing.length}, первая — «${missing[0].slice(0, 60)}…»`
        : `все ${expected.length} строк на месте`,
    );
    const tables = xml.match(/<w:tbl>/g)?.length ?? 0;
    const expectedTables = EXTRA_ORDER.some((key) => plan.enabled[key]) ? 3 : 2;
    check(
      "таблиц в DOCX",
      tables === expectedTables,
      `${tables} (ожидалось ${expectedTables}: шапка, ход урока, методические блоки)`,
    );
    const flowRows = xml.split("<w:tbl>")[2]?.match(/<w:tr>/g)?.length ?? 0;
    check(
      "строк в таблице «Ход урока»",
      flowRows === 4,
      `${flowRows} (заголовок и три этапа)`,
    );

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

    const shown = pdfCharacters(pdfBuffer);
    const used = new Set(expected.join("").replace(/\s/g, ""));
    const absent = [...used].filter((character) => !shown.has(character));
    check(
      "PDF показывает все символы плана",
      absent.length === 0,
      absent.length
        ? `нет глифов: ${absent.join(" ")}`
        : `${used.size} различных символов, включая казахские`,
    );
    const kazakh = [..."әғқңөұүһіӘҒҚҢӨҰҮҺІ"];
    const kazakhUsed = kazakh.filter((letter) => used.has(letter));
    check(
      "казахские буквы в PDF",
      kazakhUsed.every((letter) => shown.has(letter)),
      testCase.lang === "kk"
        ? `в документе ${kazakhUsed.length} из 18 специфических букв, все с глифами`
        : "русский документ, специфические буквы не требуются",
    );
    const pages = (pdfBuffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [])
      .length;
    check("страниц в PDF", pages >= 1 && pages <= 8, `${pages}`);
  }

  if (problems.length > 0) {
    console.error(`\nНарушений: ${problems.length}`);
    for (const problem of problems) console.error(`  • ${problem}`);
    process.exit(1);
  }
  console.log("\nЭкспорт проверен: документы совпадают с планом.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
