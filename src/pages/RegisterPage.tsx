import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'
import { AUDIENCE_OPTIONS, type AudienceType } from '../types/profile'

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/'
  }
  return path
}

export function RegisterPage() {
  const { configured, loading, user, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [displayName, setDisplayName] = useState('')
  const [audienceType, setAudienceType] = useState<AudienceType>('fan')
  const [publication, setPublication] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const loginHref =
    searchParams.toString().length > 0 ? `/login?${searchParams.toString()}` : '/login'

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const trimmedName = displayName.trim()
    if (trimmedName.length < 2) {
      setError('Display name must be at least 2 characters.')
      return
    }
    if (audienceType === 'journalist' && publication.trim().length < 2) {
      setError('Please enter the website or magazine you write for.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const result = await signUp({
      email: email.trim(),
      password,
      displayName: trimmedName,
      audienceType,
      publication: audienceType === 'journalist' ? publication.trim() : undefined,
    })
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.needsEmailConfirmation) {
      setInfo(
        'Check your email to confirm your account (link opens the live site, not localhost), then log in.',
      )
      return
    }

    navigate(redirectTo, { replace: true })
  }

  if (!configured) {
    return (
      <AuthLayout title="Create account" subtitle="Authentication requires Supabase configuration.">
        <p className="text-sm text-slate-500">
          Add <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to your environment.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join the community and submit your England 2030 World Cup squad prediction."
    >
      <p className="mb-4 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={loginHref} className="font-semibold text-england-red hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">Display name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you appear on the leaderboard"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">I am a</span>
          <select
            value={audienceType}
            onChange={(e) => {
              const value = e.target.value as AudienceType
              setAudienceType(value)
              if (value === 'fan') {
                setPublication('')
              }
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          >
            {AUDIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {AUDIENCE_OPTIONS.find((o) => o.value === audienceType)?.description}
          </p>
        </label>

        {audienceType === 'journalist' && (
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">
              Website or magazine
            </span>
            <input
              type="text"
              required
              value={publication}
              onChange={(e) => setPublication(e.target.value)}
              placeholder="e.g. BBC Sport, The Athletic, Sky Sports"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {info && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-lg bg-england-red py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
