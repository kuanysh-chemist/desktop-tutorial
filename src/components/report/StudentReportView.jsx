import StatTile from '../ui/StatTile'
import { DistributionBarChart } from './charts'
import { ATTENDANCE, ACTIVITY, BEHAVIOR, HOMEWORK, dictByValue } from '../../lib/dictionaries'
import { tallyByStudent, attendanceRate, activityRate, homeworkRate } from '../../lib/stats'
import { formatRu } from '../../lib/dates'
import { SECTION } from '../../lib/theme'

export default function StudentReportView({ students, studentId, lessons, periodLabel }) {
  const student = students.find((s) => s.id === studentId)

  if (!student) {
    return (
      <div className="border border-slate-300 bg-white p-4 text-sm text-slate-500">
        В этом классе пока нет учеников.
      </div>
    )
  }

  const tally = tallyByStudent(lessons, [studentId])[studentId]
  const notesCount = tally.behavior.note + tally.behavior.violation

  const attendanceChart = ATTENDANCE.map((d) => ({ name: d.label, value: tally.attendance[d.value] || 0, color: d.color }))

  const activityTimeline = lessons
    .map((l) => ({ date: l.date, status: l.records[studentId]?.activity }))
    .filter((x) => x.status)

  const noteDates = lessons
    .map((l) => ({ date: l.date, status: l.records[studentId]?.behavior }))
    .filter((x) => x.status === 'note' || x.status === 'violation')

  const missedHomeworkDates = lessons
    .map((l) => ({ date: l.date, status: l.records[studentId]?.homework }))
    .filter((x) => x.status === 'none')

  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">
        {student.name} · {periodLabel} · уроков в периоде: {lessons.length}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <StatTile label="% посещаемости" value={fmtPct(attendanceRate(tally))} tone={SECTION.report.accent} />
        <StatTile label="% активных уроков" value={fmtPct(activityRate(tally))} tone={SECTION.report.accent} />
        <StatTile label="% выполнения д/з" value={fmtPct(homeworkRate(tally))} tone={SECTION.report.accent} />
        <StatTile label="Замечания" value={notesCount} tone={notesCount > 0 ? '#b91c1c' : SECTION.report.accent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">Посещаемость</h4>
          <DistributionBarChart data={attendanceChart} height={100} />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">Активность по урокам</h4>
          {activityTimeline.length === 0 ? (
            <p className="text-sm text-slate-400">Нет данных</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {activityTimeline.map((x) => {
                const d = dictByValue(ACTIVITY, x.status)
                return (
                  <span
                    key={x.date}
                    title={`${formatRu(x.date)} — ${d.label}`}
                    style={{ width: 16, height: 16, background: d.color, borderRadius: 2, display: 'inline-block' }}
                  />
                )
              })}
            </div>
          )}
          <div className="flex gap-3 mt-2 text-xs text-slate-500">
            {ACTIVITY.map((d) => (
              <span key={d.value} className="flex items-center gap-1">
                <span style={{ width: 9, height: 9, background: d.color, borderRadius: 2, display: 'inline-block' }} />
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">Даты с замечаниями</h4>
          {noteDates.length === 0 ? (
            <p className="text-sm text-slate-400">Замечаний нет</p>
          ) : (
            <ul className="text-sm space-y-0.5">
              {noteDates.map((x) => (
                <li key={x.date}>
                  {formatRu(x.date)} —{' '}
                  <span style={{ color: x.status === 'violation' ? '#b91c1c' : '#b45309' }}>
                    {x.status === 'violation' ? 'нарушение' : 'замечание'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-1">Даты несделанной домашки</h4>
          {missedHomeworkDates.length === 0 ? (
            <p className="text-sm text-slate-400">Всё выполнено</p>
          ) : (
            <ul className="text-sm space-y-0.5">
              {missedHomeworkDates.map((x) => (
                <li key={x.date} style={{ color: '#b91c1c' }}>
                  {formatRu(x.date)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h4 className="text-xs font-semibold text-slate-500 mb-1">По урокам за период</h4>
      <div className="overflow-x-auto border border-slate-300 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: SECTION.report.tint }}>
              <th className="text-left px-2 py-1">Дата</th>
              <th className="text-left px-2 py-1">Посещаемость</th>
              <th className="text-left px-2 py-1">Активность</th>
              <th className="text-left px-2 py-1">Поведение</th>
              <th className="text-left px-2 py-1">Д/З</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l, i) => {
              const rec = l.records[studentId]
              return (
                <tr key={l.date} style={{ background: i % 2 ? '#f8fafa' : '#fff' }}>
                  <td className="px-2 py-1">{formatRu(l.date)}</td>
                  <td className="px-2 py-1">{cellLabel(ATTENDANCE, rec?.attendance)}</td>
                  <td className="px-2 py-1">{cellLabel(ACTIVITY, rec?.activity)}</td>
                  <td className="px-2 py-1">{cellLabel(BEHAVIOR, rec?.behavior)}</td>
                  <td className="px-2 py-1">{cellLabel(HOMEWORK, rec?.homework)}</td>
                </tr>
              )
            })}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-2 text-slate-400">
                  Нет уроков за выбранный период
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function cellLabel(dict, value) {
  const d = dictByValue(dict, value)
  return d ? `${d.letter} — ${d.label}` : '—'
}

function fmtPct(v) {
  return v === null ? '—' : `${v}%`
}
