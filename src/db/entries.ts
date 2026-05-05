import { db, type DiaryEntry } from './database'

export async function addEntry(data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now()
  return db.entries.add({ ...data, createdAt: now, updatedAt: now })
}

export async function updateEntry(id: number, data: Partial<DiaryEntry>) {
  return db.entries.update(id, { ...data, updatedAt: Date.now() })
}

export async function deleteEntry(id: number) {
  return db.entries.delete(id)
}

export async function exportAllEntries(): Promise<DiaryEntry[]> {
  return db.entries.orderBy('date').reverse().toArray()
}
