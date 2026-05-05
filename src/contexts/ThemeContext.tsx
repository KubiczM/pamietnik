import { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, type Theme, type ThemeId } from '../hooks/useTheme'

interface ThemeContextValue {
  theme: Theme
  themeId: ThemeId
  changeTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[0],
  themeId: 'pink',
  changeTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('diary-theme') as ThemeId) ?? 'pink'
  })

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0]

  useEffect(() => {
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
    localStorage.setItem('diary-theme', id)
    setThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
