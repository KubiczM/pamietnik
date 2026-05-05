import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { HomePage } from './pages/HomePage'
import { GuestForm } from './components/GuestForm'
import { addEntry } from './db/entries'
import type { DiaryEntry } from './db/database'
import { useState } from 'react'
import { useTheme } from './contexts/ThemeContext'

function StarDecoration() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 700"
         preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="350" cy="80"  r="100" fill="white" fillOpacity="0.06" />
      <circle cx="350" cy="80"  r="70"  fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
      <circle cx="350" cy="80"  r="45"  fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      <circle cx="40"  cy="200" r="60"  fill="white" fillOpacity="0.05" />
      <circle cx="40"  cy="200" r="80"  fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      <circle cx="200" cy="600" r="120" fill="white" fillOpacity="0.05" />
      <path d="M0 300 Q100 250 200 320 T400 280" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
      <circle cx="80"  cy="500" r="3" fill="white" fillOpacity="0.25" />
      <circle cx="160" cy="150" r="2" fill="white" fillOpacity="0.20" />
      <circle cx="300" cy="350" r="2.5" fill="white" fillOpacity="0.18" />
      <circle cx="340" cy="500" r="2" fill="white" fillOpacity="0.15" />
      <circle cx="60"  cy="350" r="2" fill="white" fillOpacity="0.20" />
      <polygon points="120,80 126,96 120,112 114,96"  fill="white" fillOpacity="0.10" />
      <polygon points="320,400 325,412 320,424 315,412" fill="white" fillOpacity="0.08" />
    </svg>
  )
}

export default function App() {
  const { user, loading, signIn, signOut } = useAuth()
  const [view, setView] = useState<'start' | 'guest' | 'guestDone'>('start')
  const { theme } = useTheme()

  const grad = `linear-gradient(135deg, ${theme.gradFrom} 0%, ${theme.gradVia} 55%, ${theme.gradTo} 100%)`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: grad }}>
        <p className="text-white/60 font-sans text-sm">Ładuję…</p>
      </div>
    )
  }

  // Julia zalogowana — pełny pamiętnik
  if (user) return <HomePage onSignOut={signOut} />

  // Gość — potwierdzenie wysłania
  if (view === 'guestDone') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
           style={{ background: grad }}>
        <div className="text-center space-y-4">
          <p className="text-6xl">💌</p>
          <p className="text-white text-xl font-bold"
             style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Wiadomość wysłana!
          </p>
          <p className="text-white/70 text-sm font-sans">Julia na pewno się ucieszy.</p>
          <button onClick={() => setView('start')}
                  className="mt-4 text-white/60 text-xs underline font-sans">
            Wróć
          </button>
        </div>
      </div>
    )
  }

  // Gość — formularz
  if (view === 'guest') {
    return (
      <div className="min-h-screen px-4 py-10"
           style={{ background: `linear-gradient(135deg, ${theme.bgFrom} 0%, ${theme.bgTo} 100%)` }}>
        <div className="max-w-sm mx-auto">
          <button onClick={() => setView('start')}
                  className="text-xs text-gray-400 mb-5 flex items-center gap-1 font-sans">
            ← Wróć
          </button>
          <GuestForm
            onSave={async (data: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) => {
              await addEntry(data)
              setView('guestDone')
            }}
            onCancel={() => setView('start')}
          />
        </div>
      </div>
    )
  }

  // Ekran startowy
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
         style={{ background: grad }}>
      <StarDecoration />

      {/* Tytuł */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        <h1 className="text-white font-bold drop-shadow-lg mb-1"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(2.8rem, 12vw, 4.5rem)', lineHeight: 1.1 }}>
          Pamiętnik
        </h1>
        <p className="text-white/80 font-semibold tracking-widest uppercase drop-shadow mb-1"
           style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(0.9rem, 4vw, 1.15rem)' }}>
          Julii Śliwińskiej
        </p>
        <div className="w-16 h-0.5 bg-white/40 rounded-full mt-4 mb-10" />

        {/* Formularz logowania */}
        <div className="w-full max-w-xs">
          <LoginForm onLogin={signIn} />
        </div>
      </div>

      {/* Sekcja gościa — przyklejona do dołu */}
      <div className="relative px-6 pb-10 text-center">
        <p className="text-white/50 text-xs font-sans mb-3">Jesteś tu z wizytą?</p>
        <button
          onClick={() => setView('guest')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold border border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/25 transition-colors"
        >
          💌 Zostaw wiadomość dla Julii
        </button>
      </div>
    </div>
  )
}
