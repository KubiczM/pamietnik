import { supabase } from './supabase'
import type { DiaryEntry } from './database'

export async function fetchEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => ({ ...row, photos: row.photos ?? [] }))
}

export async function addEntry(data: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>) {
  const now = Date.now()
  const { error } = await supabase
    .from('entries')
    .insert({ ...data, created_at: now, updated_at: now })
  if (error) throw error
}

export async function updateEntry(id: number, data: Partial<DiaryEntry>) {
  const { error } = await supabase
    .from('entries')
    .update({ ...data, updated_at: Date.now() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteEntry(id: number) {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function togglePin(id: number, current: boolean) {
  const { error } = await supabase
    .from('entries')
    .update({ is_pinned: !current, updated_at: Date.now() })
    .eq('id', id)
  if (error) throw error
}

export async function exportAllEntries(): Promise<DiaryEntry[]> {
  return fetchEntries()
}
