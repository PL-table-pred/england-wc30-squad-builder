import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSupabase } from '../../lib/supabase'
import { saveAdminSecretSession } from '../../lib/adminAccess'
import { useAuth } from '../../contexts/AuthContext'

interface AdminSecretGateProps {
  onUnlocked: () => void
}

export function AdminSecretGate({ onUnlocked }: AdminSecretGateProps) {
  const { unlockAdminSecret } = useAuth()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = secret.trim()
    if (!trimmed) {
      setError('Enter the admin secret.')
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    setChecking(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('check_admin_secret', {
      p_admin_secret: trimmed,
    })

    setChecking(false)

    if (rpcError) {
      setError(rpcError.message)
      return
    }

    if (!data) {
      setError('Invalid admin secret.')
      return
    }

    saveAdminSecretSession(trimmed)
    unlockAdminSecret()
    onUnlocked()
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold text-england-navy">Admin access</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter the admin secret from Supabase (<code className="text-xs">app_settings</code>). No
        account registration required.
      </p>
      <form onSubmit={(e) => void handleUnlock(e)} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">Admin secret</span>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            autoComplete="off"
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full rounded-lg bg-england-navy py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Unlock admin'}
        </button>
      </form>
      <Link to="/" className="mt-4 block text-center text-sm text-england-red hover:underline">
        Back to squad builder
      </Link>
    </div>
  )
}
