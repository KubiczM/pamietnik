import type { DiaryEntry } from '../db/database'
import { PenIcon, TrashIcon, CalendarIcon, UserIcon } from './Icons'

interface Props {
  entry: DiaryEntry
  onEdit: (entry: DiaryEntry) => void
  onDelete: (id: number) => void
}

const MONTHS = [
  'stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia',
]

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`
}

export function EntryCard({ entry, onEdit, onDelete }: Props) {
  const isGuest = Boolean(entry.guestName)

  return (
    <article
      className={`bg-white rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 ${
        isGuest
          ? 'border-2 border-violet-100 shadow-[0_4px_20px_rgba(167,139,250,0.12)] hover:shadow-[0_8px_30px_rgba(167,139,250,0.2)]'
          : 'border border-pink-100 shadow-[0_2px_16px_rgba(244,114,182,0.08)] hover:shadow-[0_6px_24px_rgba(244,114,182,0.16)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Nagłówek karty: data + badge gościa */}
          <div className="flex items-center gap-2 flex-wrap">
            <time className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-sans">
              <CalendarIcon size={12} className={isGuest ? 'text-violet-300' : 'text-rose-300'} />
              {formatDate(entry.date)}
            </time>
            {isGuest && (
              <span className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-500 px-2 py-0.5 rounded-full font-medium font-sans border border-violet-100">
                <UserIcon size={10} />
                gość
              </span>
            )}
          </div>

          <h2 className="mt-1.5 text-[15px] font-semibold text-gray-900 leading-snug truncate">
            {entry.title}
          </h2>

          {isGuest && (
            <p className="mt-0.5 text-xs text-violet-400 font-sans font-medium">
              od: {entry.guestName}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {entry.content}
          </p>
        </div>

        {entry.photos.length > 0 && (
          <img
            src={entry.photos[0]}
            alt=""
            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-pink-50"
          />
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex gap-1">
        <button
          onClick={() => onEdit(entry)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-sans font-medium"
        >
          <PenIcon size={12} />
          Edytuj
        </button>
        <button
          onClick={() => onDelete(entry.id!)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors font-sans"
        >
          <TrashIcon size={12} />
          Usuń
        </button>
      </div>
    </article>
  )
}
