import { ATTENDANCE } from '../../../lib/dictionaries'
import { attendanceRate, sortedBy } from '../../../lib/stats'
import { DistributionBarChart, WeeklyLineChart } from '../charts'
import StudentLink from '../StudentLink'
import { SECTION } from '../../../lib/theme'

export default function AttendanceSection({ students, dist, tally, weekly, onOpenStudent }) {
  const chartData = ATTENDANCE.map((d) => ({ name: d.label, value: dist.attendance[d.value] || 0, color: d.color }))
  const rows = sortedBy(students, (a, b) => a.name.localeCompare(b.name, 'ru'))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Распределение по статусам</h4>
        <DistributionBarChart data={chartData} />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Динамика посещаемости по неделям, %</h4>
        <WeeklyLineChart data={weekly} label="посещаемость" />
      </div>
      <div className="lg:col-span-2 overflow-x-auto">
        <h4 className="text-xs font-semibold text-slate-500 mb-1">По ученикам</h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">Ученик</th>
              <th className="text-right px-2 py-1">% посещаемости</th>
              <th className="text-right px-2 py-1">Опозданий</th>
              <th className="text-right px-2 py-1">Отсутствий</th>
              <th className="text-right px-2 py-1">Отмечено уроков</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const t = tally[s.id]
              const rate = attendanceRate(t)
              return (
                <tr key={s.id} style={{ background: i % 2 ? 'var(--stripe)' : 'var(--surface)' }}>
                  <td className="px-2 py-1">
                    <StudentLink name={s.name} onClick={() => onOpenStudent(s.id)} />
                  </td>
                  <td className="text-right px-2 py-1" style={{ color: rate !== null && rate < 70 ? '#b91c1c' : 'inherit' }}>
                    {rate === null ? '—' : `${rate}%`}
                  </td>
                  <td className="text-right px-2 py-1">{t.attendance.late}</td>
                  <td className="text-right px-2 py-1">{t.attendance.absent}</td>
                  <td className="text-right px-2 py-1 text-slate-400">{t.attendance.marked}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
