import { BEHAVIOR } from '../../../lib/dictionaries'
import { sortedBy } from '../../../lib/stats'
import { DistributionBarChart } from '../charts'
import StudentLink from '../StudentLink'
import { SECTION } from '../../../lib/theme'

export default function BehaviorSection({ students, dist, tally, onOpenStudent }) {
  const chartData = BEHAVIOR.map((d) => ({ name: d.label, value: dist.behavior[d.value] || 0, color: d.color }))

  const withNotes = sortedBy(
    students.filter((s) => tally[s.id].behavior.note + tally[s.id].behavior.violation > 0),
    (a, b) => tally[b.id].behavior.note + tally[b.id].behavior.violation - (tally[a.id].behavior.note + tally[a.id].behavior.violation)
  ).slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Распределение по статусам</h4>
        <DistributionBarChart data={chartData} height={100} />
      </div>
      <div className="overflow-x-auto">
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Больше всего замечаний</h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">Ученик</th>
              <th className="text-right px-2 py-1">Замечания</th>
              <th className="text-right px-2 py-1">Нарушения</th>
            </tr>
          </thead>
          <tbody>
            {withNotes.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                <td className="px-2 py-1">
                  <StudentLink name={s.name} onClick={() => onOpenStudent(s.id)} />
                </td>
                <td className="text-right px-2 py-1" style={{ color: '#b45309' }}>
                  {tally[s.id].behavior.note}
                </td>
                <td className="text-right px-2 py-1" style={{ color: '#b91c1c' }}>
                  {tally[s.id].behavior.violation}
                </td>
              </tr>
            ))}
            {withNotes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-slate-400">
                  Замечаний и нарушений нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
