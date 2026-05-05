import { useState, useEffect } from 'react'
import type { DiaryEntry } from '../db/database'
import { compressImage } from '../utils/compressImage'
import { CameraIcon, CalendarIcon } from './Icons'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  initial?: DiaryEntry | null
  onSave: (data: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

const MOODS = ['😊','🥰','🤩','😌','😴','😢','😡','🤒']

export function EntryForm({ initial, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const today = new Date().toISOString().split('T')[0]
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [date, setDate] = useState(initial?.date ?? today)
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [])
  const [mood, setMood] = useState<string>(initial?.mood ?? '')
  const [compressing, setCompressing] = useState(false)

  useEffect(() => {
    if (initial) {
      setTitle(initial.title)
      setContent(initial.content)
      setDate(initial.date)
      setPhotos(initial.photos)
      setMood(initial.mood ?? '')
    }
  }, [initial])

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
    if (!title.trim()) return
    onSave({ title: title.trim(), content, date, photos, mood: mood || undefined })
  }

  const inputClass =
    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all placeholder:text-gray-400'

  const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-6 space-y-4"
      style={{
        border: `1px solid ${theme.bgTo}`,
        boxShadow: `0 4px 24px ${theme.gradFrom}18`,
      }}
    >
      <div className="pb-3 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-800">
          {initial ? 'Edytuj wpis' : 'Nowy wpis'}
        </h2>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Tytuł</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Tytuł wpisu…"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={`${labelClass} flex items-center gap-1.5`}>
          <CalendarIcon size={12} className="text-rose-300" /> Data
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Treść</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Co się dzisiaj wydarzyło…"
          rows={6}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>

      {/* Nastrój dnia */}
      <div className="space-y-2">
        <label className={labelClass}>Nastrój dnia</label>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? '' : m)}
              className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-gray-50 hover:bg-gray-100"
              style={mood === m ? {
                background: `${theme.gradFrom}20`,
                outline: `2px solid ${theme.gradFrom}80`,
                transform: 'scale(1.1)',
              } : undefined}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={`${labelClass} flex items-center gap-1.5`}>
          <CameraIcon size={12} className="text-rose-300" /> Zdjęcia
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotos}
          className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-rose-50 file:text-rose-500 hover:file:bg-rose-100 file:font-medium"
        />
        {compressing && <p className="text-xs text-rose-400 animate-pulse">Kompresuję zdjęcia…</p>}
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-pink-100" />
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
          style={{ background: `linear-gradient(135deg, ${theme.gradFrom} 0%, ${theme.gradVia} 50%, ${theme.gradTo} 100%)` }}
        >
          Zapisz wpis
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
