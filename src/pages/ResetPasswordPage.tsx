import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

export function ResetPasswordPage() {
  const { configured, loading, user, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/', { replace: true })
  }

  if (!configured) {
    return (
      <AuthLayout title="Set new password" subtitle="Authentication requires Supabase configuration.">
        <p className="text-sm text-slate-500">Supabase is not configured.</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a new password for your LionXI account."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-400">New password</span>
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

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-lg bg-england-red py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save password'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/" className="font-semibold text-england-red hover:underline">
          Back to home
        </Link>
      </p>
    </AuthLayout>
  )
}
