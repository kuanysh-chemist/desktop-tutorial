// Работа с датами в формате ISO (YYYY-MM-DD) — такой формат сортируется как строка.

export const QUARTERS = [
  { key: 'I', label: 'I четверть', start: '2026-09-01', end: '2026-10-23' },
  { key: 'II', label: 'II четверть', start: '2026-11-02', end: '2026-12-25' },
  { key: 'III', label: 'III четверть', start: '2027-01-11', end: '2027-03-19' },
  { key: 'IV', label: 'IV четверть', start: '2027-03-29', end: '2027-05-25' },
]

export function todayISO() {
  const d = new Date()
  return toISO(d)
}

export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// dd.mm.yyyy — привычный для учителя формат.
export function formatRu(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function isInRange(iso, start, end) {
  if (start && iso < start) return false
  if (end && iso > end) return false
  return true
}

// Понедельник недели, содержащей дату — ключ для группировки по неделям.
export function weekStart(iso) {
  const d = new Date(`${iso}T00:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISO(d)
}

// periodSpec: { mode: 'all'|'last10'|'I'|'II'|'III'|'IV'|'custom', start, end }
// lessons должны быть отсортированы по возрастанию даты.
export function resolvePeriod(lessons, periodSpec) {
  const { mode, start, end } = periodSpec
  if (mode === 'all') {
    return { filtered: lessons.slice(), label: 'Вся история' }
  }
  if (mode === 'last10') {
    return { filtered: lessons.slice(-10), label: 'Последние 10 уроков' }
  }
  const quarter = QUARTERS.find((q) => q.key === mode)
  if (quarter) {
    return {
      filtered: lessons.filter((l) => isInRange(l.date, quarter.start, quarter.end)),
      label: `${quarter.label} (${formatRu(quarter.start)}–${formatRu(quarter.end)})`,
    }
  }
  // custom
  const filtered = lessons.filter((l) => isInRange(l.date, start || null, end || null))
  const label = start && end ? `${formatRu(start)}–${formatRu(end)}` : 'Свой период'
  return { filtered, label }
}

export function daysAgo(iso) {
  const then = new Date(`${iso}T00:00:00`).getTime()
  const now = new Date(`${todayISO()}T00:00:00`).getTime()
  return Math.round((now - then) / 86400000)
}
