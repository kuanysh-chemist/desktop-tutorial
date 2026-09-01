import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import PeriodPicker from './PeriodPicker'
import { resolvePeriod } from '../../lib/dates'
import { classDistribution, tallyByStudent, attendanceRate, activityRate, homeworkRate } from '../../lib/stats'

export default function ComparePeriodsView({ classStudents, lessons, selectedClassName }) {
  const [target, setTarget] = useState('class') // 'class' | 'student'
  const [studentId, setStudentId] = useState('')

  const [modeA, setModeA] = useState('I')
  const [startA, setStartA] = useState('')
  const [endA, setEndA] = useState('')

  const [modeB, setModeB] = useState('II')
  const [startB, setStartB] = useState('')
  const [endB, setEndB] = useState('')

  useEffect(() => {
    if (!classStudents.find((s) => s.id === studentId)) {
      setStudentId(classStudents[0]?.id || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classStudents])

  const { filtered: filteredA, label: labelA } = resolvePeriod(lessons, { mode: modeA, start: startA, end: endA })
  const { filtered: filteredB, label: labelB } = resolvePeriod(lessons, { mode: modeB, start: startB, end: endB })

  function tallyFor(filtered) {
    if (target === 'student') {
      return tallyByStudent(filtered, [studentId])[studentId]
    }
    return classDistribution(filtered)
  }

  const tallyA = tallyFor(filteredA)
  const tallyB = tallyFor(filteredB)

  const metrics = [
    { key: 'attendance', label: '% посещаемости', getValue: attendanceRate, higherIsBetter: true, unit: '%' },
    { key: 'activity', label: '% активных уроков', getValue: activityRate, higherIsBetter: true, unit: '%' },
    { key: 'homework', label: '% выполнения д/з', getValue: homeworkRate, higherIsBetter: true, unit: '%' },
    {
      key: 'notes',
      label: 'Замечания',
      getValue: (t) => t.behavior.note + t.behavior.violation,
      higherIsBetter: false,
      unit: '',
    },
  ]

  const rows = metrics.map((m) => {
    const a = m.getValue(tallyA)
    const b = m.getValue(tallyB)
    const change = a !== null && b !== null ? Math.round((b - a) * 10) / 10 : null
    const improved = change === null || change === 0 ? null : m.higherIsBetter ? change > 0 : change < 0
    return { ...m, a, b, change, improved }
  })

  const chartData = rows
    .filter((r) => r.unit === '%')
    .map((r) => ({ name: r.label, A: r.a ?? 0, B: r.b ?? 0 }))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-slate-500">Смотреть:</span>
        {[
          { key: 'class', label: 'Весь класс' },
          { key: 'student', label: 'Отдельный ученик' },
        ].map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setTarget(o.key)}
            className="px-2.5 py-1 text-xs font-medium cursor-pointer"
            style={{
              border: '1px solid #0f4c4c',
              borderRadius: 3,
              background: target === o.key ? '#0f4c4c' : '#fff',
              color: target === o.key ? '#fff' : '#0f4c4c',
            }}
          >
            {o.label}
          </button>
        ))}
        {target === 'student' && (
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="border border-slate-300 bg-white p-2.5">
          <div className="text-xs font-semibold mb-1" style={{ color: '#0f4c4c' }}>
            Период A
          </div>
          <PeriodPicker mode={modeA} onModeChange={setModeA} start={startA} end={endA} onStartChange={setStartA} onEndChange={setEndA} />
        </div>
        <div className="border border-slate-300 bg-white p-2.5">
          <div className="text-xs font-semibold mb-1" style={{ color: '#0f4c4c' }}>
            Период Б
          </div>
          <PeriodPicker mode={modeB} onModeChange={setModeB} start={startB} end={endB} onStartChange={setStartB} onEndChange={setEndB} />
        </div>
      </div>

      <div className="mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ left: -10, right: 16, top: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10.5 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend
              formatter={(v) => (v === 'A' ? labelA : labelB)}
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="A" fill="#0f4c4c" radius={[3, 3, 0, 0]} />
            <Bar dataKey="B" fill="#b45309" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#e6efee' }}>
              <th className="text-left px-2 py-1">Показатель</th>
              <th className="text-right px-2 py-1">{labelA}</th>
              <th className="text-right px-2 py-1">{labelB}</th>
              <th className="text-right px-2 py-1">Изменение</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                <td className="px-2 py-1">{r.label}</td>
                <td className="text-right px-2 py-1">{r.a === null ? '—' : `${r.a}${r.unit}`}</td>
                <td className="text-right px-2 py-1">{r.b === null ? '—' : `${r.b}${r.unit}`}</td>
                <td
                  className="text-right px-2 py-1 font-semibold"
                  style={{ color: r.improved === null ? '#94a3b8' : r.improved ? '#0f4c4c' : '#b91c1c' }}
                >
                  {r.change === null ? '—' : `${r.change > 0 ? '+' : ''}${r.change}${r.unit}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 mt-2">{target === 'student' ? '' : `Класс: ${selectedClassName}`}</div>
    </div>
  )
}
