import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

// Удаление с подтверждением в два клика: первый клик переводит кнопку
// в состояние «Точно?», через пару секунд само сбрасывается.
export default function ConfirmButton({ onConfirm, label = 'Удалить', confirmLabel = 'Точно?', className = '' }) {
  const [armed, setArmed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleClick() {
    if (!armed) {
      setArmed(true)
      timerRef.current = setTimeout(() => setArmed(false), 2500)
      return
    }
    clearTimeout(timerRef.current)
    setArmed(false)
    onConfirm()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium cursor-pointer ${className}`}
      style={{
        border: `1px solid ${armed ? '#b91c1c' : 'var(--border)'}`,
        borderRadius: 3,
        background: armed ? 'var(--danger-tint)' : 'var(--surface)',
        color: armed ? '#b91c1c' : 'var(--muted)',
      }}
    >
      <Trash2 size={12} />
      {armed ? confirmLabel : label}
    </button>
  )
}
