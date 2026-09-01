import { attendanceRate, activityRate, homeworkRate, sortedBy } from '../../../lib/stats'
import StudentLink from '../StudentLink'

export default function SummarySection({ students, tally, onOpenStudent }) {
  const rows = sortedBy(students, (a, b) => a.name.localeCompare(b.name, 'ru'))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#e6efee' }}>
            <th className="text-left px-2 py-1">Ученик</th>
            <th className="text-right px-2 py-1">% посещаемости</th>
            <th className="text-right px-2 py-1">% активных уроков</th>
            <th className="text-right px-2 py-1">Замечания</th>
            <th className="text-right px-2 py-1">% выполнения д/з</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => {
            const t = tally[s.id]
            return (
              <tr key={s.id} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                <td className="px-2 py-1">
                  <StudentLink name={s.name} onClick={() => onOpenStudent(s.id)} />
                </td>
                <td className="text-right px-2 py-1">{attendanceRate(t) ?? '—'}{attendanceRate(t) !== null ? '%' : ''}</td>
                <td className="text-right px-2 py-1">{activityRate(t) ?? '—'}{activityRate(t) !== null ? '%' : ''}</td>
                <td className="text-right px-2 py-1">{t.behavior.note + t.behavior.violation}</td>
                <td className="text-right px-2 py-1">{homeworkRate(t) ?? '—'}{homeworkRate(t) !== null ? '%' : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
