import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>('light')

  // Only access localStorage and document in useEffect (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = (localStorage.getItem('theme') as 'light'|'dark') || 'light'
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.classList.toggle('dark', theme === 'dark')
      try { localStorage.setItem('theme', theme) } catch {}
    }
  }, [theme])

  return (
    <button
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      className="px-2 py-1.5 border rounded bg-gray-100 dark:bg-gray-800 text-sm transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:animate-spin hover:scale-110"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
