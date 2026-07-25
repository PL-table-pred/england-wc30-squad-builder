import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/'
  }
  return path
}

export function LoginPage() {
  const { configured, loading, user, signIn, resetPasswordForEmail } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)

  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const registerHref =
    searchParams.toString().length > 0 ? `/register?${searchParams.toString()}` : '/register'

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setInfo(null)

    if (forgotMode) {
      const result = await resetPasswordForEmail(email.trim())
      setSubmitting(false)
      if (result.error) {
        setError(result.error)
        return
      }
      setInfo('If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.')
      return
    }

    const result = await signIn(email.trim(), password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  if (!configured) {
    return (
      <AuthLayout title="Log in" subtitle="Authentication requires Supabase configuration.">
        <p className="text-sm text-slate-500">
          Add <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to your environment.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={forgotMode ? 'Reset password' : 'Log in'}
      subtitle={
        forgotMode
          ? 'We will email you a link to choose a new password.'
          : 'Sign in to save your squad predictions and track your leaderboard entries.'
      }
    >
      <p className="mb-4 text-sm text-slate-500">
        {forgotMode ? (
          <>
            Remembered it?{' '}
            <button
              type="button"
              onClick={() => {
                setForgotMode(false)
                setError(null)
                setInfo(null)
              }}
              className="font-semibold text-england-red hover:underline"
            >
              Back to log in
            </button>
          </>
        ) : (
          <>
            No account?{' '}
            <Link to={registerHref} className="font-semibold text-england-red hover:underline">
              Create one
            </Link>
          </>
        )}
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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

        {!forgotMode && (
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
            />
          </label>
        )}

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
          {submitting
            ? forgotMode
              ? 'Sending…'
              : 'Signing in…'
            : forgotMode
              ? 'Send reset link'
              : 'Log in'}
        </button>
      </form>

      {!forgotMode && (
        <p className="mt-4 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => {
              setForgotMode(true)
              setError(null)
              setInfo(null)
            }}
            className="font-semibold text-england-red hover:underline"
          >
            Forgot password?
          </button>
        </p>
      )}
    </AuthLayout>
  )
}
