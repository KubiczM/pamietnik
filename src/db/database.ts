import Dexie, { type Table } from 'dexie'

export interface DiaryEntry {
  id?: number
  title: string
  content: string
  date: string        // ISO 8601: "2025-07-15"
  photos: string[]    // base64 skompresowanych zdjęć
  guestName?: string  // wypełnione tylko dla wpisów gości
  createdAt: number   // timestamp ms
  updatedAt: number
}

class DiaryDatabase extends Dexie {
  entries!: Table<DiaryEntry>

  constructor() {
    super('pamietnik-db')
    this.version(1).stores({
      entries: '++id, date, createdAt, title',
    })
    // v2: dodanie pola guestName (nieindeksowane, migracja automatyczna)
    this.version(2).stores({
      entries: '++id, date, createdAt, title',
    })
  }
}

export const db = new DiaryDatabase()
