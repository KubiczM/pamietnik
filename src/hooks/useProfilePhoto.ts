import { useState, useEffect } from 'react'
import { compressImage } from '../utils/compressImage'
import { supabase } from '../db/supabase'

const PHOTO_KEY = 'julia-profile-photo'
const POS_KEY   = 'julia-profile-photo-pos'

export interface PhotoPosition { x: number; y: number }

async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? null
}

async function setSetting(key: string, value: string) {
  await supabase
    .from('settings')
    .upsert({ key, value, updated_at: Date.now() })
}

async function deleteSetting(key: string) {
  await supabase.from('settings').delete().eq('key', key)
}

export function useProfilePhoto() {
  const [photo, setPhoto] = useState<string | null>(
    () => localStorage.getItem(PHOTO_KEY)
  )
  const [position, setPosition] = useState<PhotoPosition>(() => {
    const saved = localStorage.getItem(POS_KEY)
    return saved ? JSON.parse(saved) : { x: 50, y: 50 }
  })

  // Przy starcie — pobierz z Supabase i zaktualizuj lokalny cache
  useEffect(() => {
    getSetting(PHOTO_KEY).then(val => {
      if (val) { setPhoto(val); localStorage.setItem(PHOTO_KEY, val) }
    })
    getSetting(POS_KEY).then(val => {
      if (val) {
        const pos = JSON.parse(val)
        setPosition(pos)
        localStorage.setItem(POS_KEY, val)
      }
    })
  }, [])

  // Realtime — sync zdjęcia i pozycji z innych urządzeń
  useEffect(() => {
    const channel = supabase
      .channel('settings-photo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const key = (payload.old as { key?: string }).key
          if (key === PHOTO_KEY) { setPhoto(null); localStorage.removeItem(PHOTO_KEY) }
          if (key === POS_KEY) { setPosition({ x: 50, y: 50 }); localStorage.removeItem(POS_KEY) }
          return
        }
        const row = payload.new as { key: string; value: string }
        if (row.key === PHOTO_KEY) { setPhoto(row.value); localStorage.setItem(PHOTO_KEY, row.value) }
        if (row.key === POS_KEY) {
          const pos = JSON.parse(row.value)
          setPosition(pos)
          localStorage.setItem(POS_KEY, row.value)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function pickPhoto(file: File) {
    const compressed = await compressImage(file)
    // Zapisz lokalnie (szybki podgląd)
    localStorage.setItem(PHOTO_KEY, compressed)
    setPhoto(compressed)
    // Zapisz w Supabase (sync między urządzeniami)
    await setSetting(PHOTO_KEY, compressed)
  }

  async function savePosition(pos: PhotoPosition) {
    const json = JSON.stringify(pos)
    localStorage.setItem(POS_KEY, json)
    setPosition(pos)
    await setSetting(POS_KEY, json)
  }

  async function removePhoto() {
    localStorage.removeItem(PHOTO_KEY)
    localStorage.removeItem(POS_KEY)
    setPhoto(null)
    setPosition({ x: 50, y: 50 })
    await deleteSetting(PHOTO_KEY)
    await deleteSetting(POS_KEY)
  }

  return { photo, position, pickPhoto, savePosition, removePhoto }
}
