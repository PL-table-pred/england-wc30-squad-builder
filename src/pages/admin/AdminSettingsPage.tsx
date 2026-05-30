import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchContestSettings, setContactEmail, setContestSettings } from '../../lib/admin'
import { resolveContactEmail } from '../../lib/siteSettings'
import { getContactEmail } from '../../lib/siteMeta'

export function AdminSettingsPage() {
  const [submissionsLocked, setSubmissionsLocked] = useState(false)
  const [contactEmail, setContactEmailInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [emailBusy, setEmailBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const settings = await fetchContestSettings()
      setSubmissionsLocked(settings.submissions_locked)
      setContactEmailInput(settings.contact_email?.trim() ?? '')
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

  async function handleContactSubmit(e: FormEvent) {
    e.preventDefault()
    setEmailBusy(true)
    setEmailMessage(null)
    const result = await setContactEmail(contactEmail)
    setEmailBusy(false)

    if (!result.ok) {
      setEmailMessage(result.error ?? 'Failed to save contact email.')
      return
    }

    const saved = result.settings?.contact_email?.trim() ?? ''
    setContactEmailInput(saved)
    setEmailMessage(
      saved
        ? `Contact email saved. Public pages will show ${saved}.`
        : 'Contact email cleared. Pages fall back to env/default.',
    )
  }

  const effectiveContact = resolveContactEmail(contactEmail || null)
  const envFallback = getContactEmail()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Site &amp; contest settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Control leaderboard submissions and the public contact address on About, Privacy, and Contact
          pages (Google AdSense compliance). For youth squads and stats, use{' '}
          <Link to="/admin/players" className="font-semibold text-england-red hover:underline">
            Player pool
          </Link>
          .
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">Public contact email</h3>
        <p className="mt-1 text-sm text-slate-500">
          Shown on <Link to="/contact" className="font-semibold text-england-red hover:underline">/contact</Link>
          ,{' '}
          <Link to="/privacy" className="font-semibold text-england-red hover:underline">
            /privacy
          </Link>
          , and linked from <Link to="/about" className="font-semibold text-england-red hover:underline">/about</Link>
          . Leave blank to use{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">VITE_CONTACT_EMAIL</code> or default (
          {envFallback}).
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : (
          <form onSubmit={(e) => void handleContactSubmit(e)} className="mt-4 space-y-4">
            <div>
              <label htmlFor="admin-contact-email" className="block text-sm font-semibold text-england-navy">
                Contact email
              </label>
              <input
                id="admin-contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm text-england-navy focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
              />
              <p className="mt-2 text-xs text-slate-500">
                Currently live on site:{' '}
                <span className="font-semibold text-england-navy">{effectiveContact}</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={emailBusy}
              className="rounded-lg bg-england-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {emailBusy ? 'Saving…' : 'Save contact email'}
            </button>
            {emailMessage && <p className="text-sm text-slate-600">{emailMessage}</p>}
          </form>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">Leaderboard submissions</h3>
        {loading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : (
          <>
            <p className="mt-2 text-sm font-semibold text-england-navy">
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
