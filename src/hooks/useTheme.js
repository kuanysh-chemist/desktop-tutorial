import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage недоступен — идём дальше
  }
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // matchMedia недоступен — считаем светлой темой по умолчанию
  }
  return 'light'
}

// Светлая/тёмная тема приложения — переключатель в шапке, хранится в localStorage.
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
    } catch {
      // не критично
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // не критично — тема просто не запомнится между визитами
    }
  }, [theme])

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggle }
}
