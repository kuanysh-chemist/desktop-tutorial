import { downloadText, safeFileName } from './download'
import { ATTENDANCE, ACTIVITY, BEHAVIOR, HOMEWORK } from './dictionaries'
import { formatRu } from './dates'

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])
}

const BASE_STYLE = `
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; margin: 24px; background: #fff; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #0f4c4c; }
  h2 { font-size: 14px; margin: 22px 0 6px; color: #0f4c4c; border-bottom: 2px solid #0f4c4c; padding-bottom: 3px; }
  .subtitle { color: #64748b; font-size: 12px; margin-bottom: 10px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 4px; font-size: 12px; }
  th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; }
  th { background: #e6efee; color: #0f4c4c; }
  tr:nth-child(even) td { background: #f8fafa; }
  .legend { font-size: 11.5px; color: #334155; margin-top: 6px; }
  .legend b { color: #0f4c4c; }
  .toolbar { margin-bottom: 16px; }
  button.print-btn {
    background: #0f4c4c; color: #fff; border: none; padding: 8px 16px;
    border-radius: 4px; font-size: 13px; cursor: pointer;
  }
  button.print-btn:hover { background: #0b3737; }
  @media print {
    .toolbar { display: none; }
    body { margin: 6mm; }
  }
`

function documentShell({ title, subtitle, bodyHtml }) {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>${BASE_STYLE}</style>
</head>
<body>
  <div class="toolbar"><button class="print-btn" onclick="window.print()">Печать / Сохранить как PDF</button></div>
  <h1>${esc(title)}</h1>
  ${subtitle ? `<div class="subtitle">${esc(subtitle)}</div>` : ''}
  ${bodyHtml}
</body>
</html>`
}

function legendBlock() {
  const line = (dict, title) =>
    `<div><b>${esc(title)}:</b> ${dict.map((d) => `${esc(d.letter)} — ${esc(d.label)}`).join('; ')}</div>`
  return `<div class="legend">
    ${line(ATTENDANCE, 'Посещаемость')}
    ${line(ACTIVITY, 'Активность')}
    ${line(BEHAVIOR, 'Поведение')}
    ${line(HOMEWORK, 'Д/З')}
  </div>`
}

// Пустой печатный бланк на дату урока: имена учеников + пустые графы.
export function downloadBlankForm({ className, date, students }) {
  const rows = students
    .map(
      (s, i) => `<tr><td>${i + 1}</td><td>${esc(s.name)}</td>
      <td style="width:110px"></td><td style="width:90px"></td><td style="width:90px"></td><td style="width:90px"></td></tr>`
    )
    .join('')
  const bodyHtml = `
    <table>
      <thead><tr><th>#</th><th>Ученик</th><th>Посещаемость</th><th>Активность</th><th>Поведение</th><th>Д/З</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${legendBlock()}
  `
  const html = documentShell({
    title: `Бланк урока — ${className}`,
    subtitle: `Дата: ${formatRu(date)}`,
    bodyHtml,
  })
  downloadText(`Бланк_${safeFileName(className)}_${date}.html`, html, 'text/html;charset=utf-8')
}

// Универсальный экспорт отчёта: blocks = [{ heading, note, columns, rows }]
export function downloadReportHtml({ title, subtitle, blocks }) {
  const bodyHtml = blocks
    .map((block) => {
      const heading = block.heading ? `<h2>${esc(block.heading)}</h2>` : ''
      const note = block.note ? `<div class="subtitle">${esc(block.note)}</div>` : ''
      let table = ''
      if (block.columns && block.rows) {
        const thead = `<tr>${block.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>`
        const tbody = block.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`)
          .join('')
        table = `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`
      }
      return heading + note + table
    })
    .join('\n')
  const html = documentShell({ title, subtitle, bodyHtml })
  downloadText(`${safeFileName(title)}.html`, html, 'text/html;charset=utf-8')
}
