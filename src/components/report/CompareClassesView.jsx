import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { loadAllRecords } from '../../lib/storage'
import { classDistribution, attendanceRate, activityRate, homeworkRate } from '../../lib/stats'
import { SECTION } from '../../lib/theme'

// Считает по всей истории каждого неархивного класса (без учёта фильтра периода).
export default function CompareClassesView({ allClasses, students }) {
  const activeClasses = allClasses.filter((c) => !c.archived)

  const rows = activeClasses.map((c) => {
    const classStudents = students.filter((s) => s.classId === c.id)
    const lessons = loadAllRecords(c.id)
    const dist = classDistribution(lessons)
    return {
      id: c.id,
      name: c.name,
      studentsCount: classStudents.length,
      lessonsCount: lessons.length,
      attendance: attendanceRate(dist),
      activity: activityRate(dist),
      homework: homeworkRate(dist),
      notes: dist.behavior.note + dist.behavior.violation,
    }
  })

  if (rows.length === 0) {
    return <div className="border border-slate-300 bg-white p-4 text-sm text-slate-500">Нет неархивных классов для сравнения.</div>
  }

  const attendanceData = rows.map((r) => ({ name: r.name, rate: r.attendance ?? 0 }))
  const activityData = rows.map((r) => ({ name: r.name, rate: r.activity ?? 0 }))

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">% посещаемости по классам</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData} margin={{ left: -10, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'посещаемость']} />
              <Bar dataKey="rate" fill={SECTION.report.accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">% активности по классам</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData} margin={{ left: -10, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'активность']} />
              <Bar dataKey="rate" fill="#b45309" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">Класс</th>
              <th className="text-right px-2 py-1">Учеников</th>
              <th className="text-right px-2 py-1">Уроков</th>
              <th className="text-right px-2 py-1">% посещаемости</th>
              <th className="text-right px-2 py-1">% активности</th>
              <th className="text-right px-2 py-1">% д/з</th>
              <th className="text-right px-2 py-1">Замечания</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                <td className="px-2 py-1 font-medium">{r.name}</td>
                <td className="text-right px-2 py-1">{r.studentsCount}</td>
                <td className="text-right px-2 py-1">{r.lessonsCount}</td>
                <td className="text-right px-2 py-1">{r.attendance === null ? '—' : `${r.attendance}%`}</td>
                <td className="text-right px-2 py-1">{r.activity === null ? '—' : `${r.activity}%`}</td>
                <td className="text-right px-2 py-1">{r.homework === null ? '—' : `${r.homework}%`}</td>
                <td className="text-right px-2 py-1">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
