import { useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet, Printer } from 'lucide-react'
import PeriodPicker from './PeriodPicker'
import ClassReportView from './ClassReportView'
import StudentReportView from './StudentReportView'
import CompareClassesView from './CompareClassesView'
import ComparePeriodsView from './ComparePeriodsView'
import { loadAllRecords } from '../../lib/storage'
import { resolvePeriod } from '../../lib/dates'
import { exportClassReportXlsx } from '../../lib/exportXlsx'
import { downloadReportHtml } from '../../lib/exportHtml'
import { tallyByStudent, attendanceRate, activityRate, homeworkRate } from '../../lib/stats'
import { SECTION } from '../../lib/theme'

const ACCENT = SECTION.report.accent

const MODES = [
  { key: 'class', label: 'Отчёт по классу' },
  { key: 'student', label: 'Отчёт по ученику' },
  { key: 'compareClasses', label: 'Сравнение классов' },
  { key: 'comparePeriods', label: 'Сравнение периодов' },
]

export default function ReportTab({ classes, allClasses, students, selectedClassId, onSelectClass }) {
  const [mode, setMode] = useState('class')
  const [periodMode, setPeriodMode] = useState('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [studentId, setStudentId] = useState('')

  useEffect(() => {
    if (!classes.find((c) => c.id === selectedClassId)) {
      onSelectClass(classes[0]?.id || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes])

  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId]
  )

  useEffect(() => {
    if (!classStudents.find((s) => s.id === studentId)) {
      setStudentId(classStudents[0]?.id || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, classStudents])

  function openStudent(id) {
    setStudentId(id)
    setMode('student')
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const lessons = selectedClassId ? loadAllRecords(selectedClassId) : []
  const { filtered, label: periodLabel } = resolvePeriod(lessons, {
    mode: periodMode,
    start: customStart,
    end: customEnd,
  })

  function handleExportXlsx() {
    if (!selectedClass) return
    exportClassReportXlsx({
      className: selectedClass.name,
      periodLabel,
      students: classStudents,
      lessons: filtered,
    })
  }

  function handleExportHtml() {
    if (!selectedClass) return
    const ids = classStudents.map((s) => s.id)
    const tally = tallyByStudent(filtered, ids)
    const blocks = [
      {
        heading: 'Сводка по ученикам',
        columns: ['Ученик', '% посещаемости', '% активных уроков', 'Замечания', 'Нарушения', '% выполнения д/з'],
        rows: classStudents.map((s) => {
          const t = tally[s.id]
          return [s.name, attendanceRate(t) ?? '—', activityRate(t) ?? '—', t.behavior.note, t.behavior.violation, homeworkRate(t) ?? '—']
        }),
      },
    ]
    downloadReportHtml({
      title: `Отчёт — ${selectedClass.name}`,
      subtitle: `Период: ${periodLabel}`,
      blocks,
    })
  }

  return (
    <div>
      <div className="border border-slate-300 bg-white p-3 mb-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className="px-2.5 py-1 text-xs font-medium cursor-pointer"
              style={{
                border: `1px solid ${ACCENT}`,
                borderRadius: 3,
                background: mode === m.key ? ACCENT : '#fff',
                color: mode === m.key ? '#fff' : ACCENT,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode !== 'compareClasses' && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">Класс</label>
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

            {mode === 'student' && (
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">Ученик</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="border border-slate-300 px-2 py-1 text-sm"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode !== 'comparePeriods' && (
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">Период</label>
                <PeriodPicker
                  mode={periodMode}
                  onModeChange={setPeriodMode}
                  start={customStart}
                  end={customEnd}
                  onStartChange={setCustomStart}
                  onEndChange={setCustomEnd}
                />
              </div>
            )}

            {mode === 'class' && classStudents.length > 0 && (
              <div className="flex gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handleExportXlsx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs cursor-pointer"
                  style={{ border: `1px solid ${ACCENT}`, borderRadius: 3, color: ACCENT }}
                >
                  <FileSpreadsheet size={13} /> Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportHtml}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs cursor-pointer"
                  style={{ border: '1px solid #cbd5e1', borderRadius: 3, color: '#475569' }}
                >
                  <Printer size={13} /> PDF / печать (HTML)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="border border-slate-300 bg-white p-4 text-sm text-slate-500">
          Классов пока нет. Добавьте класс на вкладке «Классы и ученики».
        </div>
      ) : (
        <>
          {mode === 'class' && (
            <ClassReportView
              className={selectedClass?.name || ''}
              periodLabel={periodLabel}
              students={classStudents}
              lessons={filtered}
              onOpenStudent={openStudent}
            />
          )}
          {mode === 'student' && (
            <StudentReportView
              students={classStudents}
              studentId={studentId}
              lessons={filtered}
              periodLabel={periodLabel}
            />
          )}
          {mode === 'compareClasses' && <CompareClassesView allClasses={allClasses} students={students} />}
          {mode === 'comparePeriods' && (
            <ComparePeriodsView classStudents={classStudents} lessons={lessons} selectedClassName={selectedClass?.name || ''} />
          )}
        </>
      )}
    </div>
  )
}
