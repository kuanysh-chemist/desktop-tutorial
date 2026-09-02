import { useState } from 'react'
import { FlaskConical, NotebookPen, Users, BarChart3 } from 'lucide-react'
import { useAppData } from './hooks/useAppData'
import { useTheme } from './hooks/useTheme'
import JournalTab from './components/journal/JournalTab'
import ClassesTab from './components/classes/ClassesTab'
import ReportTab from './components/report/ReportTab'
import ThemeToggle from './components/ui/ThemeToggle'
import { SECTION } from './lib/theme'

const TABS = [
  { key: 'journal', label: 'Журнал', icon: NotebookPen },
  { key: 'classes', label: 'Классы и ученики', icon: Users },
  { key: 'report', label: 'Отчёт', icon: BarChart3 },
]

export default function App() {
  const data = useAppData()
  const { theme, toggle: toggleTheme } = useTheme()
  const [tab, setTab] = useState('journal')
  const [selectedClassId, setSelectedClassId] = useState('')

  const activeClasses = data.classes.filter((c) => !c.archived)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-2 px-4 py-2.5 text-white" style={{ background: '#0f4c4c' }}>
        <FlaskConical size={20} />
        <h1 className="text-base font-semibold m-0">Классный журнал по химии</h1>
        <div className="ml-auto">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <nav className="flex gap-1 px-3 pt-2 border-b border-slate-300 bg-white">
        {TABS.map(({ key, label, icon: Icon }) => {
          const { accent, tint } = SECTION[key]
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium cursor-pointer"
              style={{
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                border: `1px solid ${active ? accent : 'var(--border)'}`,
                borderBottom: active ? `1px solid ${accent}` : '1px solid var(--border)',
                marginBottom: -1,
                background: active ? accent : tint,
                color: active ? '#fff' : accent,
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </nav>

      <main className="flex-1 p-3">
        <div hidden={tab !== 'journal'}>
          <JournalTab
            classes={activeClasses}
            students={data.students}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
          />
        </div>
        <div hidden={tab !== 'classes'}>
          <ClassesTab data={data} />
        </div>
        <div hidden={tab !== 'report'}>
          <ReportTab
            classes={activeClasses}
            allClasses={data.classes}
            students={data.students}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
          />
        </div>
      </main>
    </div>
  )
}
