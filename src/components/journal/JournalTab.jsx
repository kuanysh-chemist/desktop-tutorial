import { useEffect, useMemo, useState } from 'react'
import { Zap, Save, Printer, Check, Loader2 } from 'lucide-react'
import StatusPicker from '../ui/StatusPicker'
import Pill from '../ui/Pill'
import { FIELDS, QUICK_MODE_RECORD } from '../../lib/dictionaries'
import { loadRecord, saveRecord, listRecordDates } from '../../lib/storage'
import { downloadBlankForm } from '../../lib/exportHtml'
import { todayISO, formatRu } from '../../lib/dates'

export default function JournalTab({ classes, students, selectedClassId, onSelectClass }) {
  const [date, setDate] = useState(todayISO())
  const [records, setRecords] = useState({})
  const [saveState, setSaveState] = useState('idle') // idle | dirty | saving | saved
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (!classes.find((c) => c.id === selectedClassId)) {
      onSelectClass(classes[0]?.id || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes])

  useEffect(() => {
    if (!selectedClassId) {
      setRecords({})
      return
    }
    setRecords(loadRecord(selectedClassId, date))
    setSaveState('idle')
  }, [selectedClassId, date])

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId]
  )

  const savedDates = useMemo(
    () => listRecordDates(selectedClassId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedClassId, refreshTick]
  )

  const rarelyMarked = useMemo(() => {
    if (!selectedClassId) return new Set()
    const lastThree = savedDates.filter((d) => d !== date).slice(-3)
    if (lastThree.length === 0) return new Set()
    const perDate = lastThree.map((d) => loadRecord(selectedClassId, d))
    const flagged = new Set()
    for (const s of classStudents) {
      const seen = perDate.some((rec) => rec[s.id] && rec[s.id].attendance)
      if (!seen) flagged.add(s.id)
    }
    return flagged
  }, [selectedClassId, savedDates, date, classStudents])

  function setField(studentId, field, value) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value },
    }))
    setSaveState('dirty')
  }

  function handleQuickMode() {
    setRecords((prev) => {
      const next = { ...prev }
      for (const s of classStudents) {
        next[s.id] = { ...(next[s.id] || {}), ...QUICK_MODE_RECORD }
      }
      return next
    })
    setSaveState('dirty')
  }

  function handleSave() {
    if (!selectedClassId) return
    setSaveState('saving')
    saveRecord(selectedClassId, date, records)
    setRefreshTick((t) => t + 1)
    window.setTimeout(() => setSaveState('saved'), 250)
  }

  function handlePrintBlank() {
    const cls = classes.find((c) => c.id === selectedClassId)
    if (!cls) return
    downloadBlankForm({ className: cls.name, date, students: classStudents })
  }

  const summary = useMemo(() => {
    const s = { present: 0, late: 0, excused: 0, absent: 0, unmarked: 0 }
    for (const student of classStudents) {
      const att = records[student.id]?.attendance
      if (att) s[att] = (s[att] || 0) + 1
      else s.unmarked++
    }
    return s
  }, [records, classStudents])

  if (classes.length === 0) {
    return (
      <div className="border border-slate-300 bg-white p-4 text-sm text-slate-500">
        Классов пока нет. Добавьте класс на вкладке «Классы и ученики».
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-3 border border-slate-300 bg-white p-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-0.5">Класс</label>
          <select
            value={selectedClassId}
            onChange={(e) => onSelectClass(e.target.value)}
            className="border border-slate-300 px-2 py-1 text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-0.5">Дата урока</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 px-2 py-1 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleQuickMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm cursor-pointer"
          style={{ border: '1px solid #0f4c4c', borderRadius: 3, color: '#0f4c4c' }}
          title="Всем: Был / Тихо, но работает / Норма. Домашку не трогает."
        >
          <Zap size={14} /> Быстрый режим
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-white cursor-pointer"
          style={{ background: '#0f4c4c', borderRadius: 3 }}
        >
          {saveState === 'saving' ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Сохранение…
            </>
          ) : saveState === 'saved' ? (
            <>
              <Check size={14} /> Сохранено
            </>
          ) : (
            <>
              <Save size={14} /> Сохранить урок
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handlePrintBlank}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm cursor-pointer"
          style={{ border: '1px solid #cbd5e1', borderRadius: 3, color: '#475569' }}
        >
          <Printer size={14} /> Бланк для печати (HTML)
        </button>
      </div>

      {savedDates.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {savedDates.map((d) => (
            <Pill key={d} active={d === date} onClick={() => setDate(d)}>
              {formatRu(d)}
            </Pill>
          ))}
        </div>
      )}

      <div className="flex gap-3 mb-3 text-sm">
        <SummaryChip label="Было" value={summary.present} color="#0f4c4c" />
        <SummaryChip label="Опоздало" value={summary.late} color="#b45309" />
        <SummaryChip label="Уваж. причина" value={summary.excused} color="#64748b" />
        <SummaryChip label="Отсутствовало" value={summary.absent} color="#b91c1c" />
        {summary.unmarked > 0 && <SummaryChip label="Не отмечено" value={summary.unmarked} color="#94a3b8" />}
      </div>

      {classStudents.length === 0 ? (
        <div className="border border-slate-300 bg-white p-4 text-sm text-slate-500">
          В этом классе пока нет учеников. Добавьте их на вкладке «Классы и ученики».
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-300 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#e6efee' }}>
                <th className="text-left px-2 py-1.5 font-semibold" style={{ color: '#0f4c4c' }}>
                  Ученик
                </th>
                {FIELDS.map((f) => (
                  <th key={f.key} className="text-left px-2 py-1.5 font-semibold" style={{ color: '#0f4c4c' }}>
                    {f.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, i) => {
                const rec = records[student.id] || {}
                const flagged = rarelyMarked.has(student.id)
                return (
                  <tr
                    key={student.id}
                    style={{
                      background: flagged ? '#fef3c7' : i % 2 ? '#f8fafa' : '#fff',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <td className="px-2 py-1.5 align-middle">
                      <div className="font-medium">{student.name}</div>
                      {flagged && <div className="text-[10.5px]" style={{ color: '#92400e' }}>давно не отмечали — возможно, пропускают</div>}
                    </td>
                    {FIELDS.map((f) => (
                      <td key={f.key} className="px-2 py-1.5 align-middle">
                        <StatusPicker
                          dict={f.dict}
                          value={rec[f.key]}
                          onChange={(value) => setField(student.id, f.key, value)}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SummaryChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 border border-slate-300 bg-white px-2 py-1">
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }} />
      <span className="text-slate-500">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
