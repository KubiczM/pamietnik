import { useState, useRef } from 'react'
import { PenIcon } from './Icons'

interface PhotoPosition { x: number; y: number }

interface Props {
  photo: string | null
  position: PhotoPosition
  onPickPhoto: (file: File) => void
  onSavePosition: (pos: PhotoPosition) => void
  onRemovePhoto: () => void
  decoration: React.ReactNode
}

export function CoverPhoto({ photo, position, onPickPhoto, onSavePosition, onRemovePhoto, decoration }: Props) {
  const [mode, setMode] = useState<'view' | 'reposition'>('view')
  const [tempPos, setTempPos] = useState(position)
  const [menuOpen, setMenuOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{
    startX: number; startY: number
    startPosX: number; startPosY: number
  } | null>(null)

  /* ── Oblicz zakres ruchu ── */
  function calcRange() {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return { rangeX: 1, rangeY: 1 }
    const cW = container.offsetWidth
    const cH = container.offsetHeight
    const nW = img.naturalWidth || cW
    const nH = img.naturalHeight || cH
    const imgAspect = nW / nH
    const conAspect = cW / cH
    if (imgAspect < conAspect) {
      const scale = cW / nW
      return { rangeX: 1, rangeY: Math.max(nH * scale - cH, 1) }
    } else {
      const scale = cH / nH
      return { rangeX: Math.max(nW * scale - cW, 1), rangeY: 1 }
    }
  }

  function applyDrag(clientX: number, clientY: number) {
    if (!dragRef.current) return
    const { rangeX, rangeY } = calcRange()
    const dx = clientX - dragRef.current.startX
    const dy = clientY - dragRef.current.startY
    setTempPos({
      x: Math.max(0, Math.min(100, dragRef.current.startPosX - (dx / rangeX) * 100)),
      y: Math.max(0, Math.min(100, dragRef.current.startPosY - (dy / rangeY) * 100)),
    })
  }

  /* ── Pointer events (desktop + Android) ── */
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: tempPos.x, startPosY: tempPos.y }
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) { applyDrag(e.clientX, e.clientY) }
  function onPointerUp() { dragRef.current = null }

  /* ── Touch events (iOS Safari fallback) ── */
  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const t = e.touches[0]
    dragRef.current = { startX: t.clientX, startY: t.clientY, startPosX: tempPos.x, startPosY: tempPos.y }
  }
  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.touches[0]) applyDrag(e.touches[0].clientX, e.touches[0].clientY)
  }
  function onTouchEnd() { dragRef.current = null }

  function enterReposition() { setTempPos(position); setMode('reposition') }
  function confirm() { onSavePosition(tempPos); setMode('view') }
  function cancel() { setTempPos(position); setMode('view') }

  const displayPos = mode === 'reposition' ? tempPos : position

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: photo ? '60vw' : '160px', minHeight: '180px', maxHeight: '75vh' }}
    >
      {photo ? (
        <img
          ref={imgRef}
          src={photo}
          alt="Julia Śliwińska"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-none"
          style={{ objectPosition: `${displayPos.x}% ${displayPos.y}%` }}
        />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 55%, #818cf8 100%)' }} />
          {decoration}
        </>
      )}

      {/* Gradient od dołu */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

      {/* ── Tryb kadrowania ── */}
      {mode === 'reposition' && (
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2.5">
              <p className="text-white text-sm font-sans text-center">Przeciągnij, aby ustawić kadr</p>
            </div>
          </div>
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
            <button
              className="px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-sans font-medium"
              onPointerDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onClick={cancel}
            >
              Anuluj
            </button>
            <button
              className="px-6 py-2.5 rounded-full bg-white text-gray-900 text-sm font-sans font-semibold shadow-lg"
              onPointerDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onClick={confirm}
            >
              Gotowe ✓
            </button>
          </div>
        </div>
      )}

      {/* ── Tryb podglądu — przycisk ołówka ── */}
      {mode === 'view' && (
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
                className="w-full text-left px-4 py-2.5 rounded-xl text-white text-sm font-sans font-medium active:opacity-70"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
              >
                📷 {photo ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
              </button>
              {photo && (
                <>
                  <button
                    onClick={() => { enterReposition(); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-white text-sm font-sans font-medium active:opacity-70"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                  >
                    🖼 Ustaw kadr
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Usunąć zdjęcie okładki?')) { onRemovePhoto(); setMenuOpen(false) } }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-sans font-medium active:opacity-70"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fca5a5' }}
                  >
                    🗑 Usuń zdjęcie
                  </button>
                </>
              )}
            </div>
          )}
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
    </div>
  )
}
