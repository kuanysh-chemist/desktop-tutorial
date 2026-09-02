import { downloadText, safeFileName } from './download'
import { todayISO } from './dates'

const RECORD_PREFIX = 'rec_'

// Собирает все данные приложения из localStorage в один переносимый объект.
function collectAllData() {
  try {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]')
    const students = JSON.parse(localStorage.getItem('students') || '[]')
    const records = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(RECORD_PREFIX)) {
        try {
          records[key] = JSON.parse(localStorage.getItem(key))
        } catch {
          // пропускаем повреждённую запись
        }
      }
    }
    return { version: 1, exportedAt: new Date().toISOString(), classes, students, records }
  } catch (err) {
    console.warn('Не удалось собрать данные для экспорта:', err)
    return { version: 1, exportedAt: new Date().toISOString(), classes: [], students: [], records: {} }
  }
}

// Скачивает файл-бэкап со всеми классами, учениками и отметками.
export function exportBackup() {
  const data = collectAllData()
  const json = JSON.stringify(data, null, 2)
  downloadText(`Журнал_химия_бэкап_${safeFileName(todayISO())}.json`, json, 'application/json;charset=utf-8')
  return data
}

// Проверяет, что распарсенный объект похож на наш бэкап.
export function isValidBackup(data) {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.classes) &&
    Array.isArray(data.students) &&
    data.records &&
    typeof data.records === 'object'
  )
}

// Полностью заменяет данные в localStorage содержимым бэкапа.
// Возвращает { ok, error?, counts? }.
export function importBackup(data) {
  if (!isValidBackup(data)) {
    return { ok: false, error: 'Файл не похож на бэкап этого журнала.' }
  }
  try {
    // сначала убираем все старые записи уроков, чтобы не осталось «хвостов»
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(RECORD_PREFIX)) keysToRemove.push(key)
    }
    for (const key of keysToRemove) localStorage.removeItem(key)

    localStorage.setItem('classes', JSON.stringify(data.classes))
    localStorage.setItem('students', JSON.stringify(data.students))
    for (const [key, value] of Object.entries(data.records)) {
      localStorage.setItem(key, JSON.stringify(value))
    }
    return {
      ok: true,
      counts: {
        classes: data.classes.length,
        students: data.students.length,
        lessons: Object.keys(data.records).length,
      },
    }
  } catch (err) {
    console.warn('Не удалось импортировать бэкап:', err)
    return { ok: false, error: 'Не удалось сохранить данные в localStorage.' }
  }
}
