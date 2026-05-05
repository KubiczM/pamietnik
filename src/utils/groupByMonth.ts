import type { DiaryEntry } from '../db/database'

const MONTHS = [
  'Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
  'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień',
]

export interface MonthGroup {
  key: string        // "2025-05"
  label: string      // "Maj 2025"
  entries: DiaryEntry[]
}

export function groupEntriesByMonth(entries: DiaryEntry[]): MonthGroup[] {
  const map = new Map<string, DiaryEntry[]>()

  for (const entry of entries) {
    const key = entry.date.slice(0, 7) // "2025-05"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // najnowsze pierwsze
    .map(([key, entries]) => {
      const [year, month] = key.split('-')
      return {
        key,
        label: `${MONTHS[parseInt(month) - 1]} ${year}`,
        entries,
      }
    })
}

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}
