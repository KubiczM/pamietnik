import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface Notification {
  id: number
  guestName: string
  title: string
}

interface Props {
  notification: Notification | null
  onDismiss: () => void
}

export function GuestNotification({ notification, onDismiss }: Props) {
  const { theme } = useTheme()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [notification, onDismiss])

  if (!notification) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? '0' : '-16px'})`,
      }}
    >
      <div
        className="rounded-2xl px-4 py-3 shadow-xl flex items-start gap-3"
        style={{
          background: `linear-gradient(135deg, ${theme.gradFrom}, ${theme.gradVia})`,
          boxShadow: `0 8px 32px ${theme.gradFrom}40`,
        }}
      >
        <span className="text-2xl mt-0.5 flex-shrink-0">💌</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold opacity-80 font-sans">
            Nowy wpis od gościa!
          </p>
          <p className="text-white text-sm font-semibold truncate mt-0.5">
            {notification.guestName}: {notification.title}
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors mt-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export type { Notification as GuestNotificationData }
