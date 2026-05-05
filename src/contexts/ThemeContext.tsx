import { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, type Theme, type ThemeId } from '../hooks/useTheme'
import { supabase } from '../db/supabase'

const THEME_KEY = 'diary-theme'

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
    return (localStorage.getItem(THEME_KEY) as ThemeId) ?? 'pink'
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
    // Semantic accent vars used across components
    r.setProperty('--accent', theme.gradFrom)
    r.setProperty('--accent2', theme.gradVia)
    r.setProperty('--accent-bg', theme.bgFrom)
    r.setProperty('--accent-border', theme.bgTo)
    document.body.style.background =
      `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgVia}, ${theme.bgTo})`
  }, [theme])

  // Przy starcie — pobierz motyw z Supabase
  useEffect(() => {
    supabase.from('settings').select('value').eq('key', THEME_KEY).single()
      .then(({ data }) => {
        const id = data?.value as ThemeId | undefined
        if (id && THEMES.find(t => t.id === id)) {
          setThemeId(id)
          localStorage.setItem(THEME_KEY, id)
        }
      })
  }, [])

  // Realtime — sync motywu z innych urządzeń
  useEffect(() => {
    const channel = supabase
      .channel('settings-theme')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.eventType === 'DELETE') return
        const row = payload.new as { key: string; value: string }
        if (row.key === THEME_KEY && THEMES.find(t => t.id === row.value)) {
          setThemeId(row.value as ThemeId)
          localStorage.setItem(THEME_KEY, row.value)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function changeTheme(id: ThemeId) {
    localStorage.setItem(THEME_KEY, id)
    setThemeId(id)
    await supabase.from('settings').upsert({ key: THEME_KEY, value: id, updated_at: Date.now() })
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
