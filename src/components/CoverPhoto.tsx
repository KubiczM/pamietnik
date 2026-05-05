import { useRef, useState } from 'react'
import { PenIcon } from './Icons'

interface Props {
  photo: string | null
  position?: { x: number; y: number }       // zachowane dla zgodności, nieużywane
  onPickPhoto: (file: File) => void
  onSavePosition?: (pos: { x: number; y: number }) => void  // zachowane dla zgodności
  onRemovePhoto: () => void
  decoration: React.ReactNode
}

export function CoverPhoto({ photo, onPickPhoto, onRemovePhoto, decoration }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative w-full select-none">
      {photo ? (
        <>
          {/* Zdjęcie w pełnym naturalnym rozmiarze — bez przycinania */}
          <img
            src={photo}
            alt="Julia Śliwińska"
            draggable={false}
            className="w-full h-auto block"
            style={{ maxHeight: '80vh', objectFit: 'contain', background: '#000' }}
          />
          {/* Gradient od dołu */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </>
      ) : (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: '160px', minHeight: '160px' }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 55%, #818cf8 100%)' }} />
          {decoration}
        </div>
      )}

      {/* Przycisk ołówka */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all active:scale-95"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.3)' }}
        >
          <PenIcon size={16} className="text-white" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 flex flex-col gap-1 z-20" style={{ minWidth: '160px' }}>
            <button
              onClick={() => { fileInputRef.current?.click(); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-white text-sm font-sans font-medium active:opacity-70 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              📷 {photo ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
            </button>
            {photo && (
              <button
                onClick={() => { if (window.confirm('Usunąć zdjęcie okładki?')) { onRemovePhoto(); setMenuOpen(false) } }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-sans font-medium active:opacity-70 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fca5a5' }}
              >
                🗑 Usuń zdjęcie
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPickPhoto(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
