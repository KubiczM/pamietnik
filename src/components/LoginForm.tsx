import { useState } from 'react'

const JULIA_EMAIL = 'julia@pamietnik.pl'

interface Props {
  onLogin: (email: string, password: string) => Promise<void>
}

export function LoginForm({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(JULIA_EMAIL, password)
    } catch {
      setError('Nieprawidłowe hasło. Spróbuj jeszcze raz.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        autoFocus
        placeholder="Wpisz hasło…"
        className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-center tracking-widest"
      />

      {error && (
        <p className="text-white/70 text-xs text-center font-sans">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-white text-rose-500 hover:bg-pink-50 active:bg-pink-100 transition-colors disabled:opacity-60 shadow-lg"
      >
        {loading ? 'Otwieram…' : 'Otwórz pamiętnik'}
      </button>
    </form>
  )
}
