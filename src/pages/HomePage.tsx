import { useState, useEffect, useCallback, useRef } from 'react'
import type { DiaryEntry } from '../db/database'
import { fetchEntries, addEntry, updateEntry, deleteEntry, togglePin } from '../db/entries'
import { supabase } from '../db/supabase'
import { EntryCard } from '../components/EntryCard'
import { EntryForm } from '../components/EntryForm'
import { GuestForm } from '../components/GuestForm'
import { CoverPhoto } from '../components/CoverPhoto'
import { MonthGroup } from '../components/MonthGroup'
import { PlusIcon, SearchIcon, BookOpenIcon, PinIcon } from '../components/Icons'
import { useProfilePhoto } from '../hooks/useProfilePhoto'
import { groupEntriesByMonth, currentMonthKey } from '../utils/groupByMonth'
import { ReminderBanner } from '../components/ReminderBanner'
import { BirthdayBanner } from '../components/BirthdayBanner'
import { ThemePicker } from '../components/ThemePicker'
import { useTheme } from '../contexts/ThemeContext'
import { GalleryPage } from './GalleryPage'
import { PhotoLightbox } from '../components/PhotoLightbox'
import { GuestNotification } from '../components/GuestNotification'
import type { GuestNotificationData } from '../components/GuestNotification'

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

interface Props {
  onSignOut: () => void
}

interface LightboxPhoto {
  src: string
  entry: DiaryEntry
}

export function HomePage({ onSignOut }: Props) {
  const [form, setForm] = useState<FormState>({ mode: 'hidden' })
  const [search, setSearch] = useState('')
  const [allEntries, setAllEntries] = useState<DiaryEntry[] | undefined>(undefined)
  const [tab, setTab] = useState<'entries' | 'gallery'>('entries')
  const [filter, setFilter] = useState<'all' | 'julia' | 'guests'>('all')
  const [lightbox, setLightbox] = useState<LightboxPhoto | null>(null)
  const [showTheme, setShowTheme] = useState(false)
  const [notification, setNotification] = useState<GuestNotificationData | null>(null)
  const notifIdRef = useRef(0)
  const { photo, position, pickPhoto, savePosition, removePhoto } = useProfilePhoto()
  const { theme, themeId, changeTheme } = useTheme()

  const loadEntries = useCallback(async () => {
    const data = await fetchEntries()
    setAllEntries(data)
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  /* ── Supabase Realtime — powiadomienia o nowych wpisach gości ── */
  useEffect(() => {
    const channel = supabase
      .channel('entries-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'entries' },
        (payload) => {
          const row = payload.new as DiaryEntry
          if (row.guest_name) {
            // Nowy wpis gościa — pokaż powiadomienie i odśwież listę
            notifIdRef.current += 1
            setNotification({
              id: notifIdRef.current,
              guestName: row.guest_name,
              title: row.title,
            })
            loadEntries()
          } else {
            // Nowy wpis Julii (np. z innego urządzenia) — cicho odśwież
            loadEntries()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadEntries])

  const entries = (allEntries ?? []).filter((e) => {
    if (filter === 'julia' && e.guest_name) return false
    if (filter === 'guests' && !e.guest_name) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (e.guest_name ?? '').toLowerCase().includes(q)
    )
  })

  async function handleSave(data: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) {
    if (form.mode === 'edit' && form.entry.id != null) {
      await updateEntry(form.entry.id, data)
    } else {
      await addEntry(data)
    }
    setForm({ mode: 'hidden' })
    await loadEntries()
  }

  async function handleDelete(id: number) {
    if (confirm('Na pewno usunąć ten wpis?')) {
      await deleteEntry(id)
      await loadEntries()
    }
  }

  async function handleTogglePin(id: number, current: boolean) {
    await togglePin(id, current)
    await loadEntries()
  }


  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Powiadomienie o nowym wpisie gościa */}
      <GuestNotification
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
      {/* ═══ NAGŁÓWEK ═══ */}
      <header className="z-10 relative">
        <CoverPhoto
          photo={photo}
          position={position}
          onPickPhoto={pickPhoto}
          onSavePosition={savePosition}
          onRemovePhoto={removePhoto}
          decoration={<HeaderDecoration />}
        />

        {/* ── Zakładki Wpisy / Galeria / Motyw ── */}
        <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-0">
          <div className="max-w-2xl mx-auto flex items-end justify-between">
            <div className="flex gap-1">
              {(['entries', 'gallery'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
                    tab === t ? 'border-b-2' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={tab === t ? {
                    color: theme.gradFrom,
                    borderColor: theme.gradFrom,
                    backgroundColor: theme.bgFrom,
                  } : undefined}
                >
                  {t === 'entries'
                    ? <>📖 Wpisy {allEntries && <span className="text-xs font-normal opacity-60">({allEntries.length})</span>}</>
                    : '📸 Galeria'}
                </button>
              ))}
            </div>
            {/* Ikona pędzla z wysuwanym menu */}
            <div className="relative mb-1">
              <button
                onClick={() => setShowTheme(s => !s)}
                className="p-2 rounded-xl transition-all"
                style={{
                  color: theme.gradFrom,
                  background: showTheme ? theme.bgFrom : `${theme.gradFrom}18`,
                  border: `1.5px solid ${theme.gradFrom}40`,
                }}
                title="Zmień motyw"
              >
                🎨
              </button>
              {showTheme && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-lg"
                  style={{ background: 'white', border: `1px solid ${theme.bgTo}` }}
                >
                  <ThemePicker current={themeId} onChange={changeTheme} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pasek akcji + wyszukiwarka (tylko w zakładce Wpisy) ── */}
        {tab === 'entries' && (
        <div className="bg-white border-b border-gray-100 shadow-sm px-4 pt-1.5 pb-1.5">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Szukaj…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setForm({ mode: 'new' })}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, ${theme.gradFrom} 0%, ${theme.gradVia} 60%, ${theme.gradTo} 100%)` }}
              >
                <PlusIcon size={13} />
                Nowy wpis
              </button>
            </div>
            {/* Filtry Julia / Wszyscy / Goście */}
            {allEntries && (
              <div className="flex gap-1.5 pt-1 pb-0.5">
                {(['all', 'julia', 'guests'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="text-xs px-2.5 py-0.5 rounded-full font-sans font-medium transition-all"
                    style={filter === f ? {
                      background: `linear-gradient(135deg, ${theme.gradFrom}, ${theme.gradTo})`,
                      color: 'white',
                    } : {
                      background: theme.bgFrom,
                      color: theme.gradFrom,
                      border: `1px solid ${theme.gradFrom}40`,
                    }}
                  >
                    {f === 'all' ? 'Wszyscy' : f === 'julia' ? '👧 Julia' : '👤 Goście'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </header>

      {/* Galeria */}
      {tab === 'gallery' && allEntries && (
        <div className="max-w-2xl mx-auto">
          <GalleryPage
            entries={allEntries}
            onPhotoClick={(photo) => setLightbox(photo)}
          />
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <PhotoLightbox
          src={lightbox.src}
          entry={lightbox.entry}
          onClose={() => setLightbox(null)}
        />
      )}

      <main className={`max-w-2xl mx-auto px-4 py-5 space-y-4 ${tab === 'gallery' ? 'hidden' : ''}`}>
        {/* Baner urodzinowy */}
        <BirthdayBanner />

        {/* Baner przypomnienia */}
        <ReminderBanner
          lastEntryDate={allEntries && allEntries.length > 0 ? allEntries[0].date : null}
        />

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
        ) : search.trim() ? (
          /* Podczas wyszukiwania — płaska lista bez grupowania */
          <div className="space-y-3 pt-2">
            {entries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={(e) => setForm({ mode: 'edit', entry: e })}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        ) : (
          <div className="pt-2">
            {/* Przypięte wpisy */}
            {entries.filter(e => e.is_pinned).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <PinIcon size={13} className="text-rose-400" />
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Przypięte</span>
                </div>
                <div className="space-y-3">
                  {entries.filter(e => e.is_pinned).map(entry => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={(e) => setForm({ mode: 'edit', entry: e })}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
                <div className="h-px bg-gray-100 mt-6 mb-2" />
              </div>
            )}

            {/* Normalna lista — grupowana po miesiącach */}
            {groupEntriesByMonth(entries.filter(e => !e.is_pinned)).map(group => (
              <MonthGroup
                key={group.key}
                label={group.label}
                entries={group.entries}
                defaultOpen={group.key === currentMonthKey()}
                onEdit={(e) => setForm({ mode: 'edit', entry: e })}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}

        {/* Wyloguj — na samym dole */}
        <div className="pt-4 pb-8 text-center">
          <button
            onClick={onSignOut}
            className="text-xs px-4 py-2 rounded-xl font-sans transition-all hover:opacity-80"
            style={{
              border: `1px solid ${theme.gradFrom}55`,
              color: theme.gradFrom,
              background: `${theme.gradFrom}10`,
            }}
          >
            Wyloguj się
          </button>
        </div>
      </main>
    </div>
  )
}
