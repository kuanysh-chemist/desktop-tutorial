import { ACTIVITY } from '../../../lib/dictionaries'
import { activityRate, sortedBy } from '../../../lib/stats'
import { DistributionBarChart, LessonBarChart } from '../charts'
import StudentLink from '../StudentLink'
import { SECTION } from '../../../lib/theme'

export default function ActivitySection({ students, dist, tally, byLesson, onOpenStudent }) {
  const chartData = ACTIVITY.map((d) => ({ name: d.label, value: dist.activity[d.value] || 0, color: d.color }))

  const top10 = sortedBy(
    students.filter((s) => tally[s.id].activity.marked > 0),
    (a, b) => (activityRate(tally[b.id]) ?? 0) - (activityRate(tally[a.id]) ?? 0)
  ).slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Распределение по статусам</h4>
        <DistributionBarChart data={chartData} height={112} />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Доля активных учеников по урокам, %</h4>
        <LessonBarChart data={byLesson} label="активны" />
      </div>
      <div className="lg:col-span-2 overflow-x-auto">
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Топ-10 по проценту активных уроков</h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">#</th>
              <th className="text-left px-2 py-1">Ученик</th>
              <th className="text-right px-2 py-1">% активных уроков</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 ? 'var(--stripe)' : 'var(--surface)' }}>
                <td className="px-2 py-1 text-slate-400">{i + 1}</td>
                <td className="px-2 py-1">
                  <StudentLink name={s.name} onClick={() => onOpenStudent(s.id)} />
                </td>
                <td className="text-right px-2 py-1">{activityRate(tally[s.id])}%</td>
              </tr>
            ))}
            {top10.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-slate-400">
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
