import { useState, useRef } from 'react'
import type { PhotoPosition } from '../hooks/useProfilePhoto'
import { UserIcon } from './Icons'

interface Props {
  photo: string | null
  position: PhotoPosition
  count: number
  onPickPhoto: (file: File) => void
  onSavePosition: (pos: PhotoPosition) => void
  onRemovePhoto: () => void
  decoration: React.ReactNode
}

export function CoverPhoto({ photo, position, count, onPickPhoto, onSavePosition, onRemovePhoto, decoration }: Props) {
  const [mode, setMode] = useState<'view' | 'reposition'>('view')
  const [tempPos, setTempPos] = useState(position)
  const [coverHeight, setCoverHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  /* Kiedy zdjęcie się załaduje — oblicz idealną wysokość coveru */
  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    const containerW = containerRef.current?.offsetWidth ?? window.innerWidth
    const naturalH = containerW * (img.naturalHeight / img.naturalWidth)
    // Maksimum: 75% wysokości ekranu (żeby lista wpisów była widoczna)
    setCoverHeight(Math.min(naturalH, window.innerHeight * 0.75))
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{
    startX: number; startY: number
    startPosX: number; startPosY: number
  } | null>(null)

  /* ── Logika przeciągania ── */
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (mode !== 'reposition') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: tempPos.x,
      startPosY: tempPos.y,
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || mode !== 'reposition') return

    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    // Oblicz o ile pikseli zdjęcie "wystaje" poza kadr — to jest nasz zakres ruchu
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return

    const cW = container.offsetWidth
    const cH = container.offsetHeight
    const nW = img.naturalWidth  || cW
    const nH = img.naturalHeight || cH
    const imgAspect = nW / nH
    const conAspect = cW / cH

    let rangeX: number, rangeY: number
    if (imgAspect < conAspect) {
      // Portret w poziomym kadrze → wypełnia szerokość, wystaje w pionie
      const scale = cW / nW
      rangeX = 1
      rangeY = Math.max(nH * scale - cH, 1)
    } else {
      // Poziom w pionowym kadrze → wypełnia wysokość, wystaje w poziomie
      const scale = cH / nH
      rangeX = Math.max(nW * scale - cW, 1)
      rangeY = 1
    }

    // Przeciągnięcie w prawo → zdjęcie przesuwa się w prawo → widzimy lewą stronę → x spada
    const newX = Math.max(0, Math.min(100, dragRef.current.startPosX - (dx / rangeX) * 100))
    const newY = Math.max(0, Math.min(100, dragRef.current.startPosY - (dy / rangeY) * 100))

    setTempPos({ x: newX, y: newY })
  }

  function onPointerUp() {
    dragRef.current = null
  }

  function enterReposition() {
    setTempPos(position)
    setMode('reposition')
  }

  function confirm() {
    onSavePosition(tempPos)
    setMode('view')
  }

  function cancel() {
    setTempPos(position)
    setMode('view')
  }

  const displayPos = mode === 'reposition' ? tempPos : position

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: photo
          ? (coverHeight ? `${coverHeight}px` : '52vw')
          : '160px',
        minHeight: '180px',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Tło */}
      {photo ? (
        <img
          ref={imgRef}
          src={photo}
          alt="Julia Śliwińska"
          draggable={false}
          onLoad={onImgLoad}
          className={`absolute inset-0 w-full h-full object-cover transition-none ${mode === 'reposition' ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ objectPosition: `${displayPos.x}% ${displayPos.y}%` }}
        />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 55%, #818cf8 100%)' }} />
          {decoration}
        </>
      )}

      {/* Gradient przyciemniający od dołu */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

      {/* ── Tryb: przeciąganie ── */}
      {mode === 'reposition' && (
        <>
          {/* Instrukcja */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2.5">
              <p className="text-white text-sm font-sans text-center leading-snug">
                Przeciągnij, aby ustawić kadr
              </p>
            </div>
          </div>

          {/* Przyciski Anuluj / Gotowe */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3 pointer-events-none">
            <button
              className="pointer-events-auto px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-sans font-medium active:bg-black/60 transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={cancel}
            >
              Anuluj
            </button>
            <button
              className="pointer-events-auto px-6 py-2.5 rounded-full bg-white text-gray-900 text-sm font-sans font-semibold shadow-lg active:bg-gray-100 transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={confirm}
            >
              Gotowe ✓
            </button>
          </div>
        </>
      )}

      {/* ── Tryb: podgląd ── */}
      {mode === 'view' && (
        <div className="absolute top-3 right-3 flex gap-2">
          {photo && (
            <>
              <button
                onClick={enterReposition}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-sans font-medium active:bg-black/50 transition-colors"
              >
                Ustaw kadr
              </button>
              <button
                onClick={() => { if (window.confirm('Usunąć zdjęcie okładki?')) onRemovePhoto() }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white text-sm active:bg-black/50 transition-colors"
                title="Usuń zdjęcie"
              >
                🗑
              </button>
            </>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-sans font-medium active:bg-black/50 transition-colors"
          >
            <UserIcon size={11} />
            {photo ? 'Zmień' : 'Dodaj zdjęcie'}
          </button>
        </div>
      )}

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

      {/* Tytuł na dole (tylko w trybie podglądu) */}
      {mode === 'view' && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <p className="text-white/70 text-[12px] font-sans tracking-[0.18em] uppercase mb-1"
             style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Pamiętnik
          </p>
          <h1
            className="text-white font-bold"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
              lineHeight: 1.15,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            Julii Śliwińskiej
          </h1>
          <p className="text-white/60 text-sm font-sans mt-1.5"
             style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {count === 0 ? 'Brak wpisów' : count === 1 ? '1 wpis' : `${count} wpisów`}
          </p>
        </div>
      )}
    </div>
  )
}
