// Простой генератор идентификаторов без внешних зависимостей.
export function makeId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch {
    // игнорируем — уходим на запасной вариант
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
