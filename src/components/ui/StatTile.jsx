import { SECTION } from '../../lib/theme'

export default function StatTile({ label, value, tone = SECTION.report.accent }) {
  return (
    <div className="border border-slate-300 bg-white px-3 py-2 flex-1 min-w-[130px]">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold" style={{ color: tone }}>
        {value}
      </div>
    </div>
  )
}
