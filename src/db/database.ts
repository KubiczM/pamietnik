// Wspólny typ wpisu — używany zarówno przez UI jak i Supabase
export interface DiaryEntry {
  id?: number
  title: string
  content: string
  date: string        // ISO 8601: "2025-07-15"
  photos: string[]    // base64 skompresowanych zdjęć
  guest_name?: string // wypełnione tylko dla wpisów gości
  mood?: string       // emoji nastroju dnia
  is_pinned?: boolean // przypięty wpis
  created_at: number  // timestamp ms
  updated_at: number
}
