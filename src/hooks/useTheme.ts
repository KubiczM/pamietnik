import { useState, useEffect } from 'react'

export type ThemeId = 'pink' | 'violet' | 'mint' | 'navy'

export interface Theme {
  id: ThemeId
  name: string
  emoji: string
  // Gradient tła aplikacji
  bgFrom: string
  bgVia: string
  bgTo: string
  // Gradient główny (przyciski, pigułki, akcenty)
  gradFrom: string
  gradVia: string
  gradTo: string
  // Kolory pomocnicze Tailwind (klasy)
  accent: string        // np. 'rose'
  accentLight: string   // np. 'rose-50'
  accentBorder: string  // np. 'rose-100'
  accentText: string    // np. 'rose-400'
  accentRing: string    // np. 'rose-300'
}

export const THEMES: Theme[] = [
  {
    id: 'pink',
    name: 'Różowy',
    emoji: '🌸',
    bgFrom: '#fff1f2', bgVia: '#fdf2f8', bgTo: '#f5f3ff',
    gradFrom: '#f472b6', gradVia: '#c084fc', gradTo: '#818cf8',
    accent: 'rose', accentLight: 'rose-50', accentBorder: 'rose-100',
    accentText: 'rose-400', accentRing: 'rose-300',
  },
  {
    id: 'violet',
    name: 'Fioletowy',
    emoji: '💜',
    bgFrom: '#f5f3ff', bgVia: '#faf5ff', bgTo: '#ede9fe',
    gradFrom: '#a78bfa', gradVia: '#8b5cf6', gradTo: '#6d28d9',
    accent: 'violet', accentLight: 'violet-50', accentBorder: 'violet-100',
    accentText: 'violet-400', accentRing: 'violet-300',
  },
  {
    id: 'mint',
    name: 'Miętowy',
    emoji: '🌿',
    bgFrom: '#ecfdf5', bgVia: '#f0fdf4', bgTo: '#ccfbf1',
    gradFrom: '#34d399', gradVia: '#10b981', gradTo: '#0d9488',
    accent: 'emerald', accentLight: 'emerald-50', accentBorder: 'emerald-100',
    accentText: 'emerald-400', accentRing: 'emerald-300',
  },
  {
    id: 'navy',
    name: 'Granatowy',
    emoji: '🌙',
    bgFrom: '#eef2ff', bgVia: '#f1f5f9', bgTo: '#e0e7ff',
    gradFrom: '#6366f1', gradVia: '#4f46e5', gradTo: '#1e40af',
    accent: 'indigo', accentLight: 'indigo-50', accentBorder: 'indigo-100',
    accentText: 'indigo-400', accentRing: 'indigo-300',
  },
]

const STORAGE_KEY = 'diary-theme'

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? 'pink'
  })

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0]

  useEffect(() => {
    // Ustaw zmienne CSS na :root
    const r = document.documentElement.style
    r.setProperty('--grad-from', theme.gradFrom)
    r.setProperty('--grad-via', theme.gradVia)
    r.setProperty('--grad-to', theme.gradTo)
    r.setProperty('--bg-from', theme.bgFrom)
    r.setProperty('--bg-via', theme.bgVia)
    r.setProperty('--bg-to', theme.bgTo)
    document.body.style.background =
      `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgVia}, ${theme.bgTo})`
  }, [theme])

  function changeTheme(id: ThemeId) {
    localStorage.setItem(STORAGE_KEY, id)
    setThemeId(id)
  }

  return { theme, themeId, changeTheme }
}
