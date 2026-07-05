import { useState, useEffect } from 'react'
import { supabase } from '../db/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !sessionStorage.getItem('diary-active')) {
        supabase.auth.signOut().then(() => setLoading(false))
      } else {
        setUser(data.session?.user ?? null)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => { listener.subscription.unsubscribe() }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    sessionStorage.setItem('diary-active', '1')
  }

  async function signOut() {
    sessionStorage.removeItem('diary-active')
    Object.keys(sessionStorage)
      .filter(key => key.startsWith('notif_dismissed_'))
      .forEach(key => sessionStorage.removeItem(key))
    await supabase.auth.signOut()
  }

  return { user, loading, signIn, signOut }
}
