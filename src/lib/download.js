// Скачивание файла через Blob + временную ссылку.
// window.print() и <a> с прямым сохранением не всегда доступны во встроенных
// окнах — поэтому только такой способ, а печать/PDF делается уже из
// скачанного standalone HTML-файла.
export function downloadBlob(filename, blob) {
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url)
      } catch {
        // не критично
      }
    }, 2000)
    return true
  } catch (err) {
    console.warn('Не удалось скачать файл:', err)
    return false
  }
}

export function downloadText(filename, text, mime) {
  return downloadBlob(filename, new Blob([text], { type: mime }))
}

// Безопасное имя файла: убираем символы, которые не любят файловые системы.
export function safeFileName(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80)
}
