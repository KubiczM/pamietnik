import { useEffect, useState } from 'react'
import { supabase } from '../db/supabase'

interface Notification {
  id: string
  text: string
  image_path: string
}

export function LoveNotification() {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    supabase
      .from('notifications')
      .select('id, text, image_path, start_date, end_date')
      .lte('start_date', today)
      .gte('end_date', today)
      .limit(1)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return
        setNotification(data)

        const { data: signed } = await supabase.storage
          .from('notification-images')
          .createSignedUrl(data.image_path, 3600)

        if (signed) setImageUrl(signed.signedUrl)

        const key = `notif_dismissed_${data.id}`
        setDismissed(sessionStorage.getItem(key) === 'true')
      })
  }, [])

  if (!notification || dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem(`notif_dismissed_${notification.id}`, 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Rodzice"
            className="w-full rounded-xl mb-4 object-cover"
          />
        )}
        <p className="text-lg font-medium">{notification.text}</p>
      </div>
    </div>
  )
}
