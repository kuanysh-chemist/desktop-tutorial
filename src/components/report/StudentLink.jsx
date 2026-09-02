import { SECTION } from '../../lib/theme'

// Кликабельное имя ученика — открывает отчёт по этому ученику.
export default function StudentLink({ name, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer p-0 bg-transparent border-none text-left"
      style={{ color: SECTION.report.accent, textDecoration: 'underline', font: 'inherit' }}
    >
      {name}
    </button>
  )
}
