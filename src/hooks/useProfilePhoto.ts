import { useState } from 'react'
import { compressImage } from '../utils/compressImage'

const PHOTO_KEY = 'julia-profile-photo'
const POS_KEY   = 'julia-profile-photo-pos'

export interface PhotoPosition { x: number; y: number }

export function useProfilePhoto() {
  const [photo, setPhoto] = useState<string | null>(
    () => localStorage.getItem(PHOTO_KEY)
  )
  const [position, setPosition] = useState<PhotoPosition>(() => {
    const saved = localStorage.getItem(POS_KEY)
    return saved ? JSON.parse(saved) : { x: 50, y: 50 }
  })

  async function pickPhoto(file: File) {
    const compressed = await compressImage(file)
    localStorage.setItem(PHOTO_KEY, compressed)
    setPhoto(compressed)
  }

  function savePosition(pos: PhotoPosition) {
    localStorage.setItem(POS_KEY, JSON.stringify(pos))
    setPosition(pos)
  }

  return { photo, position, pickPhoto, savePosition }
}
