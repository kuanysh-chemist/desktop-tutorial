import { isInRange, weekStart } from './dates'

// Все функции работают с копиями массивов — .sort() никогда не применяется
// к входным данным напрямую, чтобы сортировка в одном разделе отчёта
// не портила порядок в другом.

// lessons: [{ date, records: { [studentId]: record } }]
export function lessonsInRange(lessons, start, end) {
  return lessons.filter((l) => isInRange(l.date, start, end)).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

const emptyTally = () => ({
  attendance: { present: 0, late: 0, excused: 0, absent: 0, marked: 0 },
  activity: { active: 0, quiet: 0, passive: 0, marked: 0 },
  behavior: { normal: 0, note: 0, violation: 0, marked: 0 },
  homework: { done: 0, partial: 0, none: 0, na: 0, assigned: 0 },
})

// Считает статистику по каждому ученику за переданный список уроков.
// Проценты считаются только по фактически отмеченным урокам.
export function tallyByStudent(lessons, studentIds) {
  const map = {}
  for (const id of studentIds) map[id] = emptyTally()

  for (const lesson of lessons) {
    for (const [studentId, rec] of Object.entries(lesson.records || {})) {
      if (!map[studentId]) continue
      const t = map[studentId]
      if (rec.attendance) {
        t.attendance.marked++
        t.attendance[rec.attendance] = (t.attendance[rec.attendance] || 0) + 1
      }
      if (rec.activity) {
        t.activity.marked++
        t.activity[rec.activity] = (t.activity[rec.activity] || 0) + 1
      }
      if (rec.behavior) {
        t.behavior.marked++
        t.behavior[rec.behavior] = (t.behavior[rec.behavior] || 0) + 1
      }
      if (rec.homework && rec.homework !== 'na') {
        t.homework.assigned++
        t.homework[rec.homework] = (t.homework[rec.homework] || 0) + 1
      } else if (rec.homework === 'na') {
        t.homework.na++
      }
    }
  }
  return map
}

// Суммарная раскладка по классу (для круговых/столбчатых диаграмм распределения).
export function classDistribution(lessons) {
  const dist = emptyTally()
  for (const lesson of lessons) {
    for (const rec of Object.values(lesson.records || {})) {
      if (rec.attendance) {
        dist.attendance.marked++
        dist.attendance[rec.attendance]++
      }
      if (rec.activity) {
        dist.activity.marked++
        dist.activity[rec.activity]++
      }
      if (rec.behavior) {
        dist.behavior.marked++
        dist.behavior[rec.behavior]++
      }
      if (rec.homework && rec.homework !== 'na') {
        dist.homework.assigned++
        dist.homework[rec.homework]++
      } else if (rec.homework === 'na') {
        dist.homework.na++
      }
    }
  }
  return dist
}

export function pct(part, total) {
  if (!total) return null
  return Math.round((part / total) * 1000) / 10
}

export function attendanceRate(t) {
  return pct(t.attendance.present + t.attendance.late, t.attendance.marked)
}

export function activityRate(t) {
  return pct(t.activity.active, t.activity.marked)
}

// Частично выполненная домашка считается за половину.
export function homeworkRate(t) {
  if (!t.homework.assigned) return null
  return Math.round(((t.homework.done + t.homework.partial * 0.5) / t.homework.assigned) * 1000) / 10
}

// Сводный балл ученика для рейтинга «лучшие» — среднее по доступным метрикам
// (посещаемость/активность/д.з.), минус штраф за замечания и нарушения.
// Возвращает null, если по ученику вообще нет отмеченных данных.
export function compositeScore(t) {
  const parts = [attendanceRate(t), activityRate(t), homeworkRate(t)].filter((v) => v !== null)
  if (parts.length === 0) return null
  const base = parts.reduce((sum, v) => sum + v, 0) / parts.length
  const penalty = t.behavior.note * 3 + t.behavior.violation * 8
  return Math.max(0, Math.round((base - penalty) * 10) / 10)
}

// Динамика посещаемости по неделям: [{ week, rate }], отсортировано по неделе.
export function weeklyAttendance(lessons) {
  const byWeek = new Map()
  for (const lesson of lessons) {
    const wk = weekStart(lesson.date)
    if (!byWeek.has(wk)) byWeek.set(wk, { present: 0, marked: 0 })
    const bucket = byWeek.get(wk)
    for (const rec of Object.values(lesson.records || {})) {
      if (!rec.attendance) continue
      bucket.marked++
      if (rec.attendance === 'present' || rec.attendance === 'late') bucket.present++
    }
  }
  return Array.from(byWeek.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([week, b]) => ({ week, rate: pct(b.present, b.marked) }))
}

// Доля активных учеников по каждому уроку: [{ date, rate }]
export function activityByLesson(lessons) {
  return lessons.map((lesson) => {
    let active = 0
    let marked = 0
    for (const rec of Object.values(lesson.records || {})) {
      if (!rec.activity) continue
      marked++
      if (rec.activity === 'active') active++
    }
    return { date: lesson.date, rate: pct(active, marked) }
  })
}

export function studentName(students, id) {
  const s = students.find((st) => st.id === id)
  return s ? s.name : '—'
}

// Копия-сортировка: никогда не мутирует исходный массив.
export function sortedBy(arr, cmp) {
  return arr.slice().sort(cmp)
}
