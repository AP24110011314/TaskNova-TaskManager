import { useEffect } from 'react'

export function useTheme() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    localStorage.setItem('std:theme', 'light')
  }, [])

  return { theme: 'light', toggleTheme: () => {}, setTheme: () => {} }
}