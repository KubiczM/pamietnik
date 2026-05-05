import type { DiaryEntry } from '../db/database'

interface Photo {
  src: string
  entry: DiaryEntry
}

interface Props {
  entries: DiaryEntry[]
  onPhotoClick: (photo: Photo) => void
}

export function GalleryPage({ entries, onPhotoClick }: Props) {
  const photos: Photo[] = entries.flatMap(entry =>
    entry.photos.map(src => ({ src, entry }))
  )

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <div className="text-5xl">📷</div>
        <p className="text-gray-400 text-sm font-sans">Brak zdjęć w pamiętniku.</p>
        <p className="text-gray-300 text-xs font-sans">Dodaj zdjęcie do wpisu!</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <p className="text-xs text-gray-400 font-sans mb-4">
        {photos.length} {photos.length === 1 ? 'zdjęcie' : photos.length < 5 ? 'zdjęcia' : 'zdjęć'}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 active:opacity-75 transition-opacity"
          >
            <img
              src={photo.src}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
