import { useEffect, useState } from 'react'
import { fetchContestSettings, setContestSettings } from '../../lib/admin'
export function AdminSettingsPage() {
  const [submissionsLocked, setSubmissionsLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const settings = await fetchContestSettings()
      setSubmissionsLocked(settings.submissions_locked)
      setLoading(false)
    })()
  }, [])

  async function save(locked: boolean) {
    setBusy(true)
    setMessage(null)
    const result = await setContestSettings(locked)
    setBusy(false)

    if (!result.ok) {
      setMessage(result.error ?? 'Failed to update settings.')
      return
    }

    setSubmissionsLocked(result.settings?.submissions_locked ?? locked)
    setMessage(locked ? 'Submissions are now locked.' : 'Submissions are now open.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Contest settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Control whether users can submit new squads to the community leaderboard.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-england-navy">
              Submissions are currently{' '}
              <span className={submissionsLocked ? 'text-amber-700' : 'text-emerald-700'}>
                {submissionsLocked ? 'locked' : 'open'}
              </span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !submissionsLocked}
                onClick={() => void save(false)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Open submissions
              </button>
              <button
                type="button"
                disabled={busy || submissionsLocked}
                onClick={() => void save(true)}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Lock submissions
              </button>
            </div>
          </>
        )}

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>
    </div>
  )
}
