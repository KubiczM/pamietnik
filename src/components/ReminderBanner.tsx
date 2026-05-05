import { useState } from 'react'

const DISMISSED_KEY = 'reminder-dismissed-date'
const DAYS_THRESHOLD = 5

interface Props {
  lastEntryDate: string | null // "2025-05-01" lub null jeśli brak wpisów
}

function daysSince(dateStr: string): number {
  const last = new Date(dateStr)
  const now = new Date()
  last.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
}

function wasDismissedToday(): boolean {
  const dismissed = localStorage.getItem(DISMISSED_KEY)
  if (!dismissed) return false
  return dismissed === new Date().toISOString().slice(0, 10)
}

function dismiss() {
  localStorage.setItem(DISMISSED_KEY, new Date().toISOString().slice(0, 10))
}

export function ReminderBanner({ lastEntryDate }: Props) {
  const [hidden, setHidden] = useState(wasDismissedToday)

  if (hidden) return null
  if (!lastEntryDate) return null

  const days = daysSince(lastEntryDate)
  if (days < DAYS_THRESHOLD) return null

  function handleDismiss() {
    dismiss()
    setHidden(true)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden px-5 py-4 mb-2"
         style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Hej Julia! Minęło już {days} {days === 1 ? 'dzień' : days < 5 ? 'dni' : 'dni'} bez wpisu.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Może czas napisać coś nowego? 💕
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/70 text-gray-400 hover:bg-white transition-colors text-sm"
        >
          ×
        </button>
      </div>
    </div>
  )
}
