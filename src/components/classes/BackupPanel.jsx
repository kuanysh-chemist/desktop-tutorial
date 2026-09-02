import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { exportBackup, importBackup } from '../../lib/backup'
import { SECTION } from '../../lib/theme'

const ACCENT = SECTION.classes.accent

// Перенос данных между устройствами/браузерами: экспорт всех классов,
// учеников и отметок в один JSON-файл и загрузка его обратно.
export default function BackupPanel() {
  const fileInputRef = useRef(null)
  const [status, setStatus] = useState('')

  function handleExport() {
    exportBackup()
    setStatus('Файл с данными скачан.')
  }

  function handlePickFile() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // чтобы можно было выбрать тот же файл повторно
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      let data
      try {
        data = JSON.parse(String(reader.result))
      } catch {
        setStatus('Не удалось прочитать файл — это не корректный JSON.')
        return
      }
      const confirmed = window.confirm(
        'Загрузка файла заменит ВСЕ текущие данные в этом браузере (классы, учеников, все отметки) ' +
          'данными из файла. Отменить это будет нельзя. Продолжить?'
      )
      if (!confirmed) return

      const result = importBackup(data)
      if (!result.ok) {
        setStatus(result.error || 'Не удалось загрузить данные.')
        return
      }
      setStatus(
        `Загружено: классов — ${result.counts.classes}, учеников — ${result.counts.students}, уроков — ${result.counts.lessons}. Обновляю страницу…`
      )
      window.setTimeout(() => window.location.reload(), 600)
    }
    reader.onerror = () => setStatus('Не удалось прочитать файл.')
    reader.readAsText(file)
  }

  return (
    <section className="border border-slate-300 bg-white p-3">
      <h2 className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>
        Перенос данных между устройствами
      </h2>
      <p className="text-xs text-slate-500 mb-2">
        Данные хранятся в этом браузере и не синхронизируются автоматически. Чтобы продолжить работу на
        другом ноутбуке — скачайте файл здесь и загрузите его там.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-white cursor-pointer"
          style={{ background: ACCENT, borderRadius: 3 }}
        >
          <Download size={14} /> Скачать данные (JSON)
        </button>
        <button
          type="button"
          onClick={handlePickFile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm cursor-pointer"
          style={{ border: `1px solid ${ACCENT}`, borderRadius: 3, color: ACCENT }}
        >
          <Upload size={14} /> Загрузить данные (JSON)
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} hidden />
      </div>
      {status && <p className="text-xs text-slate-500 mt-2">{status}</p>}
    </section>
  )
}
