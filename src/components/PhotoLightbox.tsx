import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { DiaryEntry } from '../db/database'

const MONTHS = [
  'stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia',
]

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`
}

interface Props {
  src: string
  entry: DiaryEntry
  onClose: () => void
}

export function PhotoLightbox({ src, entry, onClose }: Props) {
  /* Blokuj scroll strony gdy lightbox otwarty */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black"
      onClick={onClose}
    >
      {/* Przycisk zamknięcia — zawsze widoczny w górnym rogu */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-colors"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Zdjęcie — kliknięcie zamyka */}
      <div className="flex-1 flex items-center justify-center p-6 pt-16 pb-16">
        <img
          src={src}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }}
        />
      </div>

      {/* Dolny pasek z tytułem */}
      <div
        className="px-5 py-4 text-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-white text-sm font-semibold leading-tight">{entry.title}</p>
        <p className="text-white/50 text-xs font-sans mt-1">{formatDate(entry.date)}</p>
      </div>
    </div>,
    document.body
  )
}
