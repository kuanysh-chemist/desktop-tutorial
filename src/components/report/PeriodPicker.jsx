import Pill from '../ui/Pill'
import { QUARTERS } from '../../lib/dates'
import { SECTION } from '../../lib/theme'

const ACCENT = SECTION.report.accent

const PRESETS = [
  { key: 'all', label: 'Вся история' },
  { key: 'last10', label: 'Последние 10' },
  ...QUARTERS.map((q) => ({ key: q.key, label: q.key })),
  { key: 'custom', label: 'Свой период' },
]

export default function PeriodPicker({ mode, onModeChange, start, end, onStartChange, onEndChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESETS.map((p) => (
        <Pill key={p.key} active={mode === p.key} onClick={() => onModeChange(p.key)} tone={ACCENT}>
          {p.label}
        </Pill>
      ))}
      {mode === 'custom' && (
        <span className="flex items-center gap-1 ml-1">
          <input
            type="date"
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
            className="border border-slate-300 px-1.5 py-0.5 text-xs"
          />
          <span className="text-slate-400">—</span>
          <input
            type="date"
            value={end}
            onChange={(e) => onEndChange(e.target.value)}
            className="border border-slate-300 px-1.5 py-0.5 text-xs"
          />
        </span>
      )}
    </div>
  )
}
