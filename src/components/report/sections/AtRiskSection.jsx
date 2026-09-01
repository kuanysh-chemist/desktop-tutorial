import { useState } from 'react'
import { attendanceRate, activityRate, homeworkRate, sortedBy } from '../../../lib/stats'
import StudentLink from '../StudentLink'

const CRITERIA = [
  { key: 'attendance', label: 'Посещаемость', getRate: attendanceRate, defaultThreshold: 70, color: '#b91c1c' },
  { key: 'activity', label: 'Активность', getRate: activityRate, defaultThreshold: 30, color: '#b45309' },
  { key: 'homework', label: 'Д/З', getRate: homeworkRate, defaultThreshold: 60, color: '#7c2d12' },
]

export default function AtRiskSection({ students, tally, onOpenStudent }) {
  const [thresholds, setThresholds] = useState({ attendance: 70, activity: 30, homework: 60 })
  const [minFailing, setMinFailing] = useState(1)

  const evaluated = students.map((s) => {
    const t = tally[s.id]
    const rates = {}
    const fails = {}
    let failingCount = 0
    for (const c of CRITERIA) {
      const rate = c.getRate(t)
      rates[c.key] = rate
      // ученики без данных по критерию не помечаются по нему
      const fail = rate !== null && rate < thresholds[c.key]
      fails[c.key] = fail
      if (fail) failingCount++
    }
    return { student: s, rates, fails, failingCount }
  })

  const filtered = sortedBy(
    evaluated.filter((e) => e.failingCount >= minFailing),
    (a, b) => b.failingCount - a.failingCount || a.student.name.localeCompare(b.student.name, 'ru')
  )

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
        {CRITERIA.map((c) => (
          <div key={c.key}>
            <label className="block text-xs text-slate-500 mb-1">
              {c.label} ниже {thresholds[c.key]}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={thresholds[c.key]}
              onChange={(e) => setThresholds((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-500">Сработало показателей:</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setMinFailing(n)}
            className="px-2 py-0.5 text-xs cursor-pointer"
            style={{
              border: '1px solid #0f4c4c',
              borderRadius: 999,
              background: minFailing === n ? '#0f4c4c' : '#fff',
              color: minFailing === n ? '#fff' : '#0f4c4c',
            }}
          >
            {n === 3 ? 'все 3' : `от ${n}`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#e6efee' }}>
              <th className="text-left px-2 py-1">Ученик</th>
              <th className="text-right px-2 py-1">% посещаемости</th>
              <th className="text-right px-2 py-1">% активных</th>
              <th className="text-right px-2 py-1">% выполнения д/з</th>
              <th className="text-left px-2 py-1">Критерии</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.student.id} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                <td className="px-2 py-1">
                  <StudentLink name={e.student.name} onClick={() => onOpenStudent(e.student.id)} />
                </td>
                {CRITERIA.map((c) => (
                  <td
                    key={c.key}
                    className="text-right px-2 py-1"
                    style={{ color: e.fails[c.key] ? '#b91c1c' : 'inherit', fontWeight: e.fails[c.key] ? 600 : 400 }}
                  >
                    {e.rates[c.key] === null ? '—' : `${e.rates[c.key]}%`}
                  </td>
                ))}
                <td className="px-2 py-1">
                  <div className="flex gap-1 flex-wrap">
                    {CRITERIA.filter((c) => e.fails[c.key]).map((c) => (
                      <span
                        key={c.key}
                        className="px-1.5 py-0.5 text-[10.5px] rounded"
                        style={{ background: '#fee2e2', color: '#b91c1c' }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-2 text-slate-400">
                  Никто не проходит по выбранным порогам
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
