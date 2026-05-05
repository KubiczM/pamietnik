import { useState, useRef } from 'react'
import type { DiaryEntry } from '../db/database'
import { compressImage } from '../utils/compressImage'
import { CameraIcon, UserIcon, HeartIcon } from './Icons'

interface Props {
  onSave: (data: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export function GuestForm({ onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [guestName, setGuestName] = useState('')
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setCompressing(true)
    const compressed = await Promise.all(files.map(compressImage))
    setPhotos((prev) => [...prev, ...compressed])
    setCompressing(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!guestName.trim() || !content.trim()) return
    onSave({
      title: `Wpis od ${guestName.trim()}`,
      content,
      date: today,
      photos,
      guest_name: guestName.trim(),
    })
  }

  const inputClass =
    'w-full bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all placeholder:text-gray-400'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border-2 border-violet-100 p-6 space-y-4 shadow-[0_4px_24px_rgba(167,139,250,0.15)]"
    >
      <div className="text-center pb-2 border-b border-violet-50">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 mb-2">
          <HeartIcon size={18} className="text-violet-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-800">Zostaw wiadomość dla Julii</h2>
        <p className="text-xs text-gray-400 mt-0.5">Twój wpis trafi do jej pamiętnika na zawsze</p>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <UserIcon size={12} className="text-violet-400" /> Twoje imię
        </label>
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
          placeholder="Jak masz na imię?"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wiadomość</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Napisz coś miłego dla Julii…"
          rows={5}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <CameraIcon size={12} className="text-violet-400" /> Zdjęcie <span className="normal-case text-gray-400 font-normal">(opcjonalne)</span>
        </label>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotos} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium font-sans border border-violet-200 bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
        >
          <CameraIcon size={12} />
          Dodaj zdjęcie
        </button>
        {compressing && <p className="text-xs text-violet-400 animate-pulse">Kompresuję zdjęcie…</p>}
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-violet-100" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-400 text-white rounded-full text-xs flex items-center justify-center shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)' }}
        >
          Wyślij wiadomość
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-colors"
        >
          Anuluj
        </button>
      </div>
    </form>
  )
}
