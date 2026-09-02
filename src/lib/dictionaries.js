// Справочники статусов: значение, подпись, короткая буква для таблиц, цвет.

export const ATTENDANCE = [
  { value: 'present', label: 'Был', letter: 'П', color: '#0f4c4c' },
  { value: 'late', label: 'Опоздал', letter: 'О', color: '#b45309' },
  { value: 'excused', label: 'Отсутствовал по уваж. причине', letter: 'У', color: '#64748b' },
  { value: 'absent', label: 'Отсутствовал', letter: 'Н', color: '#b91c1c' },
]

export const ACTIVITY = [
  { value: 'active', label: 'Активный', letter: 'А', color: '#0f4c4c' },
  { value: 'quiet', label: 'Тихо, но работает', letter: 'Т', color: '#64748b' },
  { value: 'passive', label: 'Ничего не делает', letter: 'Н', color: '#b91c1c' },
]

export const BEHAVIOR = [
  { value: 'normal', label: 'Норма', letter: 'N', color: '#0f4c4c' },
  { value: 'note', label: 'Замечание', letter: 'З', color: '#b45309' },
  { value: 'violation', label: 'Нарушение', letter: '!', color: '#b91c1c' },
]

export const HOMEWORK = [
  { value: 'done', label: 'Выполнено', letter: '✓', color: '#0f4c4c' },
  { value: 'partial', label: 'Частично', letter: '~', color: '#b45309' },
  { value: 'none', label: 'Не выполнено', letter: '✕', color: '#b91c1c' },
  { value: 'na', label: 'Не задавалось', letter: '—', color: '#64748b' },
]

export const FIELDS = [
  { key: 'attendance', title: 'Посещаемость', dict: ATTENDANCE },
  { key: 'activity', title: 'Активность', dict: ACTIVITY },
  { key: 'behavior', title: 'Поведение', dict: BEHAVIOR },
  { key: 'homework', title: 'Д/З', dict: HOMEWORK },
]

export function dictByValue(dict, value) {
  return dict.find((item) => item.value === value)
}

// «П — Был» и т.п. — используется в таблице по урокам и её экспортах.
export function cellLabel(dict, value) {
  const d = dictByValue(dict, value)
  return d ? `${d.letter} — ${d.label}` : '—'
}

export function defaultRecord() {
  return { attendance: undefined, activity: undefined, behavior: undefined, homework: undefined }
}

// Старые записи могли не содержать activity/homework — подставляем значения по умолчанию.
export function normalizeRecord(rec) {
  const source = rec || {}
  return {
    attendance: source.attendance,
    activity: source.activity || 'quiet',
    behavior: source.behavior,
    homework: source.homework || 'na',
  }
}

export const QUICK_MODE_RECORD = { attendance: 'present', activity: 'quiet', behavior: 'normal' }
