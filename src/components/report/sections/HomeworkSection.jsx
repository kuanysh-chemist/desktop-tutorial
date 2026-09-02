import { HOMEWORK } from '../../../lib/dictionaries'
import { homeworkRate, sortedBy } from '../../../lib/stats'
import { DistributionBarChart } from '../charts'
import StudentLink from '../StudentLink'
import { SECTION } from '../../../lib/theme'

export default function HomeworkSection({ students, dist, tally, onOpenStudent }) {
  const chartData = HOMEWORK.map((d) => ({ name: d.label, value: dist.homework[d.value] || 0, color: d.color }))

  const worst = sortedBy(
    students.filter((s) => tally[s.id].homework.none > 0),
    (a, b) => tally[b.id].homework.none - tally[a.id].homework.none
  ).slice(0, 10)

  const rows = sortedBy(
    students.filter((s) => tally[s.id].homework.assigned > 0),
    (a, b) => a.name.localeCompare(b.name, 'ru')
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Распределение по статусам</h4>
        <DistributionBarChart data={chartData} height={124} />
      </div>
      <div className="overflow-x-auto">
        <h4 className="text-xs font-semibold text-slate-500 mb-1">Чаще всего не выполняют</h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">Ученик</th>
              <th className="text-right px-2 py-1">Не выполнено раз</th>
            </tr>
          </thead>
          <tbody>
            {worst.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                <td className="px-2 py-1">
                  <StudentLink name={s.name} onClick={() => onOpenStudent(s.id)} />
                </td>
                <td className="text-right px-2 py-1" style={{ color: '#b91c1c' }}>
                  {tally[s.id].homework.none}
                </td>
              </tr>
            ))}
            {worst.length === 0 && (
              <tr>
                <td colSpan={2} className="px-2 py-2 text-slate-400">
                  Невыполненных работ нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="lg:col-span-2 overflow-x-auto">
        <h4 className="text-xs font-semibold text-slate-500 mb-1">По ученикам (только там, где задавалась д/з)</h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">Ученик</th>
              <th className="text-right px-2 py-1">Задано раз</th>
              <th className="text-right px-2 py-1">% выполнения</th>
              <th className="text-right px-2 py-1">Не выполнено раз</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const t = tally[s.id]
              const rate = homeworkRate(t)
              return (
                <tr key={s.id} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                  <td className="px-2 py-1">
                    <StudentLink name={s.name} onClick={() => onOpenStudent(s.id)} />
                  </td>
                  <td className="text-right px-2 py-1 text-slate-400">{t.homework.assigned}</td>
                  <td className="text-right px-2 py-1" style={{ color: rate !== null && rate < 60 ? '#b91c1c' : 'inherit' }}>
                    {rate === null ? '—' : `${rate}%`}
                  </td>
                  <td className="text-right px-2 py-1">{t.homework.none}</td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-2 text-slate-400">
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
