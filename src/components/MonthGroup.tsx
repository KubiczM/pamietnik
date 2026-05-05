import { useState } from 'react'
import type { DiaryEntry } from '../db/database'
import { EntryCard } from './EntryCard'

interface Props {
  label: string
  entries: DiaryEntry[]
  defaultOpen: boolean
  onEdit: (entry: DiaryEntry) => void
  onDelete: (id: number) => void
  onTogglePin: (id: number, current: boolean) => void
}

export function MonthGroup({ label, entries, defaultOpen, onEdit, onDelete, onTogglePin }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      {/* Nagłówek miesiąca */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 py-2 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Etykieta miesiąca */}
          <span
            className="text-xs font-bold font-sans whitespace-nowrap px-3 py-1 rounded-full text-white tracking-wide"
            style={{ background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))' }}
          >
            {label}
          </span>
          <span className="text-xs text-gray-400 font-sans">
            {entries.length} {entries.length === 1 ? 'wpis' : entries.length < 5 ? 'wpisy' : 'wpisów'}
          </span>
        </div>

        <span className="text-xs font-semibold font-sans whitespace-nowrap flex items-center gap-1"
              style={{ color: 'var(--grad-from)' }}>
          {open ? 'zwiń' : 'rozwiń'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="3" strokeLinecap="round"
               className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>

      </button>

      {/* Wpisy */}
      {open && (
        <div className="space-y-3 mt-1 mb-6">
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}

      {/* Linia gdy zwinięty */}
      {!open && (
        <div className="h-px bg-gray-100 mb-4 mt-1" />
      )}
    </div>
  )
}
