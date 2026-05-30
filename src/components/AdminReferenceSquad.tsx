import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { resolveAdminSecret } from '../lib/adminAccess'
import { setReferenceSquad } from '../lib/leaderboard'
import { encodeSquadToUrl } from '../utils/shareSquad'
import type { UseSquadReturn } from '../hooks/useSquad'

interface AdminReferenceSquadProps {
  squad: UseSquadReturn
  onPublished?: () => void
  embedded?: boolean
}

export function AdminReferenceSquad({ squad, onPublished, embedded = false }: AdminReferenceSquadProps) {
  const { isProfileAdmin } = useAuth()
  const [secret, setSecret] = useState('')
  const [label, setLabel] = useState('Official WC30 squad')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePublish = async () => {
    if (!squad.validation.isComplete) {
      setMessage({ type: 'error', text: 'Complete your 26-man squad and pick a captain first.' })
      return
    }
    if (!isProfileAdmin && !resolveAdminSecret(secret)) {
      setMessage({ type: 'error', text: 'Enter the admin secret.' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    const result = await setReferenceSquad(
      encodeSquadToUrl(squad.state),
      isProfileAdmin ? undefined : resolveAdminSecret(secret),
      label.trim() || undefined,
    )

    setSubmitting(false)

    if (result.ok) {
      setMessage({ type: 'success', text: 'Reference squad published. Leaderboard will update on refresh.' })
      onPublished?.()
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Failed to publish reference squad.' })
    }
  }

  const wrapperClass = embedded
    ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
    : 'mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm'

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <>
          <h3 className="text-lg font-bold text-england-navy">Admin — Set reference squad</h3>
          <p className="mt-1 text-sm text-slate-600">
            Publish your current squad as the answer key for leaderboard scoring.
          </p>
        </>
      )}

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">Label</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
        </label>
        {!isProfileAdmin && !resolveAdminSecret() && (
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Admin secret</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="From Supabase app_settings table"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
            />
          </label>
        )}
        <button
          type="button"
          onClick={() => void handlePublish()}
          disabled={submitting}
          className="rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Publishing…' : 'Publish reference squad'}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${message.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
