import { Sun, Moon } from 'lucide-react'

// Ползунок светлая/тёмная тема — переключается кликом в любом месте дорожки.
export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Светлая/тёмная тема"
      title={dark ? 'Тёмная тема — переключить на светлую' : 'Светлая тема — переключить на тёмную'}
      onClick={onToggle}
      className="relative flex items-center cursor-pointer shrink-0"
      style={{
        width: 52,
        height: 28,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.35)',
        background: dark ? '#0b3737' : 'rgba(255,255,255,0.18)',
        padding: 3,
        transition: 'background 0.2s ease',
      }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          transform: dark ? 'translateX(24px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
          color: dark ? '#0f4c4c' : '#b45309',
        }}
      >
        {dark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  )
}
