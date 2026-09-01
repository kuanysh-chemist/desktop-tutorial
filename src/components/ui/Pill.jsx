export default function Pill({ active, children, onClick, tone }) {
  const toneColor = tone || '#0f4c4c'
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-0.5 text-xs cursor-pointer whitespace-nowrap"
      style={{
        border: `1px solid ${toneColor}`,
        borderRadius: 999,
        background: active ? toneColor : '#fff',
        color: active ? '#fff' : toneColor,
      }}
    >
      {children}
    </button>
  )
}
