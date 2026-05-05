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
      {/* Górny pasek */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm"
           onClick={e => e.stopPropagation()}>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{entry.title}</p>
          <p className="text-white/50 text-xs font-sans mt-0.5">{formatDate(entry.date)}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-lg hover:bg-white/20 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Zdjęcie */}
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={src}
          alt=""
          className="max-w-full max-h-full object-contain rounded-xl"
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>,
    document.body
  )
}
