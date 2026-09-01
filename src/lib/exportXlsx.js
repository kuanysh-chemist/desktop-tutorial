import * as XLSX from 'xlsx'
import { tallyByStudent, attendanceRate, activityRate, homeworkRate } from './stats'
import { safeFileName } from './download'

function sheetFromRows(rows) {
  return XLSX.utils.aoa_to_sheet(rows)
}

export function exportClassReportXlsx({ className, periodLabel, students, lessons }) {
  const ids = students.map((s) => s.id)
  const tally = tallyByStudent(lessons, ids)

  const summaryRows = [['Ученик', '% посещаемости', '% активных уроков', 'Замечания', 'Нарушения', '% выполнения д/з']]
  const attendanceRows = [['Ученик', 'Был', 'Опоздал', 'Уваж. причина', 'Отсутствовал', 'Отмечено уроков', '% посещаемости']]
  const activityRows = [['Ученик', 'Активный', 'Тихо, но работает', 'Ничего не делает', 'Отмечено уроков', '% активных']]
  const behaviorRows = [['Ученик', 'Норма', 'Замечание', 'Нарушение', 'Отмечено уроков']]
  const homeworkRows = [['Ученик', 'Выполнено', 'Частично', 'Не выполнено', 'Не задавалось', 'Задано раз', '% выполнения']]

  for (const s of students) {
    const t = tally[s.id]
    summaryRows.push([
      s.name,
      attendanceRate(t) ?? '',
      activityRate(t) ?? '',
      t.behavior.note,
      t.behavior.violation,
      homeworkRate(t) ?? '',
    ])
    attendanceRows.push([
      s.name,
      t.attendance.present,
      t.attendance.late,
      t.attendance.excused,
      t.attendance.absent,
      t.attendance.marked,
      attendanceRate(t) ?? '',
    ])
    activityRows.push([s.name, t.activity.active, t.activity.quiet, t.activity.passive, t.activity.marked, activityRate(t) ?? ''])
    behaviorRows.push([s.name, t.behavior.normal, t.behavior.note, t.behavior.violation, t.behavior.marked])
    homeworkRows.push([
      s.name,
      t.homework.done,
      t.homework.partial,
      t.homework.none,
      t.homework.na,
      t.homework.assigned,
      homeworkRate(t) ?? '',
    ])
  }

  const meta = [[`Класс: ${className}`], [`Период: ${periodLabel}`], []]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheetFromRows([...meta, ...summaryRows]), 'Сводка')
  XLSX.utils.book_append_sheet(wb, sheetFromRows([...meta, ...attendanceRows]), 'Посещаемость')
  XLSX.utils.book_append_sheet(wb, sheetFromRows([...meta, ...activityRows]), 'Активность')
  XLSX.utils.book_append_sheet(wb, sheetFromRows([...meta, ...behaviorRows]), 'Поведение')
  XLSX.utils.book_append_sheet(wb, sheetFromRows([...meta, ...homeworkRows]), 'Домашняя работа')

  const suffix = periodLabel ? `_${safeFileName(periodLabel)}` : ''
  XLSX.writeFile(wb, `Отчёт_${safeFileName(className)}${suffix}.xlsx`)
}
