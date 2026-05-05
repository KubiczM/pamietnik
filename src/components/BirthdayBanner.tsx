import { useState, useEffect } from 'react'

const BIRTHDAY_MONTH = 5  // maj
const BIRTHDAY_DAY = 10

function isBirthdayPeriod(): 'before' | 'today' | 'after' | null {
  const now = new Date()
  const m = now.getMonth() + 1
  const d = now.getDate()

  if (m === BIRTHDAY_MONTH) {
    if (d === BIRTHDAY_DAY - 1) return 'before'
    if (d === BIRTHDAY_DAY) return 'today'
    if (d === BIRTHDAY_DAY + 1) return 'after'
  }
  return null
}

const CONFETTI = ['🎂','🎉','🎈','✨','🌸','💖','🎀','🌟']

export function BirthdayBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [sparkles, setSparkles] = useState<{ emoji: string; x: number; delay: number }[]>([])

  const period = isBirthdayPeriod()

  useEffect(() => {
    const key = `birthday-dismissed-${new Date().getFullYear()}-${BIRTHDAY_MONTH}-${BIRTHDAY_DAY}`
    if (localStorage.getItem(key)) setDismissed(true)

    // Generuj confetti
    const items = Array.from({ length: 12 }, (_, i) => ({
      emoji: CONFETTI[i % CONFETTI.length],
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setSparkles(items)
  }, [])

  if (!period || dismissed) return null

  function handleDismiss() {
    const key = `birthday-dismissed-${new Date().getFullYear()}-${BIRTHDAY_MONTH}-${BIRTHDAY_DAY}`
    localStorage.setItem(key, '1')
    setDismissed(true)
  }

  const message =
    period === 'today'
      ? 'Wszystkiego najlepszego, Julio! 🎂'
      : period === 'before'
      ? 'Jutro Twoje urodziny, Julio! 🎈'
      : 'Jeszcze raz wszystkiego dobrego! 💖'

  const sub =
    period === 'today'
      ? 'Niech ten dzień będzie wyjątkowy — tak jak Ty! ✨'
      : period === 'before'
      ? 'Mamy nadzieję, że będzie wspaniały!'
      : 'Mamy nadzieję, że urodziny były cudowne!'

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4"
         style={{ background: 'linear-gradient(135deg, var(--grad-from) 0%, var(--grad-via) 55%, var(--grad-to) 100%)' }}>

      {/* Confetti tła */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {sparkles.map((s, i) => (
          <span
            key={i}
            className="absolute text-lg animate-bounce"
            style={{
              left: `${s.x}%`,
              top: `${10 + (i % 3) * 28}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${1.2 + s.delay * 0.4}s`,
              opacity: 0.55,
            }}
          >
            {s.emoji}
          </span>
        ))}
      </div>

      {/* Treść */}
      <div className="relative z-10 px-5 py-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-white font-bold text-lg leading-snug drop-shadow">
            {message}
          </p>
          <p className="text-white/80 text-sm font-sans mt-1 leading-snug">
            {sub}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white text-base hover:bg-white/30 transition-colors mt-0.5"
        >
          ×
        </button>
      </div>

      {/* Dolna dekoracja */}
      <div className="h-1 w-full"
           style={{ background: 'linear-gradient(90deg, #fbcfe8, #e879f9, #a78bfa, #fbcfe8)' }} />
    </div>
  )
}
