import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DiaryEntry } from '../db/database'
import { addEntry, updateEntry, deleteEntry, exportAllEntries } from '../db/entries'
import { EntryCard } from '../components/EntryCard'
import { EntryForm } from '../components/EntryForm'
import { GuestForm } from '../components/GuestForm'
import { CoverPhoto } from '../components/CoverPhoto'
import { PlusIcon, DownloadIcon, SearchIcon, BookOpenIcon } from '../components/Icons'
import { useProfilePhoto } from '../hooks/useProfilePhoto'

// Dekoracyjna grafika SVG — abstrakcyjne kółka i linie w tle nagłówka
function HeaderDecoration() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 600 180"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Duże rozmyte koła */}
      <circle cx="520" cy="30" r="90" fill="white" fillOpacity="0.07" />
      <circle cx="480" cy="140" r="60" fill="white" fillOpacity="0.06" />
      <circle cx="560" cy="100" r="40" fill="white" fillOpacity="0.08" />

      {/* Pierścienie */}
      <circle cx="520" cy="30" r="70" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1" />
      <circle cx="520" cy="30" r="50" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1" />

      {/* Małe akcenty po lewej */}
      <circle cx="30" cy="30" r="18" fill="white" fillOpacity="0.07" />
      <circle cx="30" cy="30" r="28" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      <circle cx="70" cy="155" r="12" fill="white" fillOpacity="0.06" />

      {/* Delikatne linie / łuki */}
      <path d="M 0 90 Q 150 50 300 100 T 600 80" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
      <path d="M 0 120 Q 200 80 400 130 T 600 110" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />

      {/* Małe romby / diamenty */}
      <polygon points="140,20 148,30 140,40 132,30" fill="white" fillOpacity="0.1" />
      <polygon points="340,10 346,18 340,26 334,18" fill="white" fillOpacity="0.08" />
      <polygon points="420,150 425,158 420,166 415,158" fill="white" fillOpacity="0.09" />

      {/* Groszki */}
      <circle cx="200" cy="25" r="3" fill="white" fillOpacity="0.2" />
      <circle cx="260" cy="45" r="2" fill="white" fillOpacity="0.15" />
      <circle cx="310" cy="20" r="2.5" fill="white" fillOpacity="0.18" />
      <circle cx="160" cy="155" r="3" fill="white" fillOpacity="0.15" />
      <circle cx="230" cy="145" r="2" fill="white" fillOpacity="0.12" />
    </svg>
  )
}

type FormState =
  | { mode: 'hidden' }
  | { mode: 'new' }
  | { mode: 'edit'; entry: DiaryEntry }
  | { mode: 'guest' }

export function HomePage() {
  const [form, setForm] = useState<FormState>({ mode: 'hidden' })
  const [search, setSearch] = useState('')
  const { photo, position, pickPhoto, savePosition } = useProfilePhoto()

  const allEntries = useLiveQuery(
    () => db.entries.orderBy('date').reverse().toArray(),
    []
  )

  const entries = (allEntries ?? []).filter((e) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (e.guestName ?? '').toLowerCase().includes(q)
    )
  })

  async function handleSave(data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    if (form.mode === 'edit' && form.entry.id != null) {
      await updateEntry(form.entry.id, data)
    } else {
      await addEntry(data)
    }
    setForm({ mode: 'hidden' })
  }

  async function handleDelete(id: number) {
    if (confirm('Na pewno usunąć ten wpis?')) {
      await deleteEntry(id)
    }
  }

  async function handleExport() {
    const data = await exportAllEntries()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pamietnik-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const count = allEntries?.length ?? 0

  return (
    <div className="min-h-screen">
      {/* ═══ NAGŁÓWEK ═══ */}
      <header className="z-10 relative">
        <CoverPhoto
          photo={photo}
          position={position}
          count={count}
          onPickPhoto={pickPhoto}
          onSavePosition={savePosition}
          decoration={<HeaderDecoration />}
        />

        {/* ── Pasek akcji + wyszukiwarka ── */}
        <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj wspomnień…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleExport}
              title="Eksportuj backup JSON"
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <DownloadIcon size={16} />
            </button>
            <button
              onClick={() => setForm({ mode: 'new' })}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 60%, #818cf8 100%)' }}
            >
              <PlusIcon size={15} />
              Nowy wpis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Aktywny formularz */}
        {form.mode === 'new' && (
          <EntryForm initial={null} onSave={handleSave} onCancel={() => setForm({ mode: 'hidden' })} />
        )}
        {form.mode === 'edit' && (
          <EntryForm initial={form.entry} onSave={handleSave} onCancel={() => setForm({ mode: 'hidden' })} />
        )}
        {form.mode === 'guest' && (
          <GuestForm onSave={handleSave} onCancel={() => setForm({ mode: 'hidden' })} />
        )}

        {/* Lista wpisów */}
        {allEntries === undefined ? (
          <p className="text-center text-gray-400 text-sm py-12">Ładuję…</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 mx-auto">
              <BookOpenIcon size={28} className="text-rose-200" />
            </div>
            <p className="text-gray-400 text-sm">
              {search ? 'Brak wyników wyszukiwania.' : 'Tu będą wspomnienia Julii.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={(e) => setForm({ mode: 'edit', entry: e })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Baner dla gości — na dole, nienachalny */}
        {form.mode === 'hidden' && (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Jesteś gościem?</p>
              <p className="text-xs text-gray-400 mt-0.5">Zostaw Julii swoją wiadomość w pamiętniku</p>
            </div>
            <button
              onClick={() => setForm({ mode: 'guest' })}
              className="flex-shrink-0 text-sm px-4 py-2 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)' }}
            >
              Napisz
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
