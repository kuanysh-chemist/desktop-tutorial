import Card from '../ui/Card'
import { classDistribution, tallyByStudent, weeklyAttendance, activityByLesson } from '../../lib/stats'
import AttendanceSection from './sections/AttendanceSection'
import ActivitySection from './sections/ActivitySection'
import BehaviorSection from './sections/BehaviorSection'
import HomeworkSection from './sections/HomeworkSection'
import AtRiskSection from './sections/AtRiskSection'
import SummarySection from './sections/SummarySection'
import TopStudentsSection from './sections/TopStudentsSection'

export default function ClassReportView({ className, periodLabel, students, lessons, onOpenStudent }) {
  if (students.length === 0) {
    return (
      <div className="border border-slate-300 bg-white p-4 text-sm text-slate-500">
        В этом классе пока нет учеников.
      </div>
    )
  }

  const ids = students.map((s) => s.id)
  const dist = classDistribution(lessons)
  const tally = tallyByStudent(lessons, ids)
  const weekly = weeklyAttendance(lessons)
  const byLesson = activityByLesson(lessons)

  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">
        {className} · {periodLabel} · уроков: {lessons.length}
      </div>

      <Card title="🏆 Топ-3 лучших ученика" defaultOpen>
        <TopStudentsSection students={students} tally={tally} onOpenStudent={onOpenStudent} />
      </Card>

      <Card title="Посещаемость">
        <AttendanceSection students={students} dist={dist} tally={tally} weekly={weekly} onOpenStudent={onOpenStudent} />
      </Card>

      <Card title="Активность">
        <ActivitySection students={students} dist={dist} tally={tally} byLesson={byLesson} onOpenStudent={onOpenStudent} />
      </Card>

      <Card title="Поведение">
        <BehaviorSection students={students} dist={dist} tally={tally} onOpenStudent={onOpenStudent} />
      </Card>

      <Card title="Домашняя работа">
        <HomeworkSection students={students} dist={dist} tally={tally} onOpenStudent={onOpenStudent} />
      </Card>

      <Card title="Тревожные ученики">
        <AtRiskSection students={students} tally={tally} onOpenStudent={onOpenStudent} />
      </Card>

      <Card title="Сводка по ученикам">
        <SummarySection students={students} tally={tally} onOpenStudent={onOpenStudent} />
      </Card>
    </div>
  )
}
