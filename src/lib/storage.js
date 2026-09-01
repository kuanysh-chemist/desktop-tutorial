import { normalizeRecord } from './dictionaries'

// Все операции с localStorage обёрнуты в try/catch — приложение не должно
// падать, если хранилище недоступно (приватный режим, переполнение и т.п.).

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`Не удалось прочитать "${key}" из localStorage:`, err)
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn(`Не удалось сохранить "${key}" в localStorage:`, err)
    return false
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.warn(`Не удалось удалить "${key}" из localStorage:`, err)
  }
}

export function recordKey(classId, date) {
  return `rec_${classId}_${date}`
}

export function loadClasses() {
  return safeGet('classes', [])
}

export function saveClasses(classes) {
  return safeSet('classes', classes)
}

export function loadStudents() {
  return safeGet('students', [])
}

export function saveStudents(students) {
  return safeSet('students', students)
}

// Возвращает объект { [studentId]: record } с уже подставленными значениями
// по умолчанию для отсутствующих полей старых записей.
export function loadRecord(classId, date) {
  const raw = safeGet(recordKey(classId, date), {})
  const normalized = {}
  for (const [studentId, rec] of Object.entries(raw || {})) {
    normalized[studentId] = normalizeRecord(rec)
  }
  return normalized
}

export function saveRecord(classId, date, data) {
  return safeSet(recordKey(classId, date), data)
}

// Список дат уроков, по которым есть сохранённые записи для класса.
export function listRecordDates(classId) {
  try {
    const prefix = `rec_${classId}_`
    const dates = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        dates.push(key.slice(prefix.length))
      }
    }
    dates.sort()
    return dates
  } catch (err) {
    console.warn('Не удалось перечислить записи localStorage:', err)
    return []
  }
}

// Все сохранённые уроки класса: [{ date, records }], отсортировано по дате.
export function loadAllRecords(classId) {
  return listRecordDates(classId).map((date) => ({ date, records: loadRecord(classId, date) }))
}

export function removeRecord(classId, date) {
  safeRemove(recordKey(classId, date))
}
