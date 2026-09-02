import { Trophy } from 'lucide-react'
import { attendanceRate, activityRate, homeworkRate, compositeScore, sortedBy } from '../../../lib/stats'
import StudentLink from '../StudentLink'

const MEDALS = [
  { place: 1, label: '1 место', color: '#a3852b', tint: '#f7efd9' }, // приглушённое золото
  { place: 2, label: '2 место', color: '#6b7280', tint: '#eef0f2' }, // приглушённое серебро
  { place: 3, label: '3 место', color: '#a05a2c', tint: '#f5e7dc' }, // приглушённая бронза
]

export default function TopStudentsSection({ students, tally, onOpenStudent }) {
  const ranked = sortedBy(
    students
      .map((s) => ({ student: s, score: compositeScore(tally[s.id]) }))
      .filter((r) => r.score !== null),
    (a, b) => b.score - a.score || a.student.name.localeCompare(b.student.name, 'ru')
  ).slice(0, 3)

  if (ranked.length === 0) {
    return <p className="text-sm text-slate-400">Пока недостаточно отмеченных уроков для рейтинга.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ranked.map((r, i) => {
        const medal = MEDALS[i]
        const t = tally[r.student.id]
        return (
          <div key={r.student.id} className="border p-3" style={{ borderColor: medal.color, background: medal.tint }}>
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold" style={{ color: medal.color }}>
              <Trophy size={14} />
              {medal.label}
            </div>
            <div className="text-base font-semibold mb-2">
              <StudentLink name={r.student.name} onClick={() => onOpenStudent(r.student.id)} />
            </div>
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>% посещаемости: {fmt(attendanceRate(t))}</div>
              <div>% активных уроков: {fmt(activityRate(t))}</div>
              <div>% выполнения д/з: {fmt(homeworkRate(t))}</div>
              <div>Замечания: {t.behavior.note + t.behavior.violation}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function fmt(v) {
  return v === null ? '—' : `${v}%`
}
