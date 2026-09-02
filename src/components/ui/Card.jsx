import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SECTION } from '../../lib/theme'

// Сворачиваемая карточка-раздел отчёта. По умолчанию свёрнута.
export default function Card({ title, right, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-300 bg-white mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
        style={{ borderBottom: open ? '1px solid #cbd5e1' : 'none' }}
      >
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: SECTION.report.accent }}>
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          {title}
        </span>
        {right && <span onClick={(e) => e.stopPropagation()}>{right}</span>}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  )
}
