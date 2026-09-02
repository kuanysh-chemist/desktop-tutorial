// Ряд маленьких квадратных кнопок-статусов. Выбранная залита цветом,
// остальные — бледным фоном того же цвета. Клик ставит отметку.
export default function StatusPicker({ dict, value, onChange, disabled }) {
  return (
    <div className="flex gap-1">
      {dict.map((item) => {
        const active = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            title={item.label}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className="flex items-center justify-center font-semibold select-none cursor-pointer"
            style={{
              width: 38,
              height: 34,
              fontSize: 16,
              border: `1px solid ${item.color}`,
              borderRadius: 3,
              background: active ? item.color : `${item.color}1a`,
              color: active ? '#fff' : item.color,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {item.letter}
          </button>
        )
      })}
    </div>
  )
}
