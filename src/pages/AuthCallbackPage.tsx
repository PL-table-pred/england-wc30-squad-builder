import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    let cancelled = false
    let finished = false

    const finish = (path: string) => {
      if (cancelled || finished) return
      finished = true
      navigate(path, { replace: true })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        finish('/reset-password')
        return
      }
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        finish('/')
      }
    })

    void (async () => {
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const code = params.get('code')
      const isRecovery =
        params.get('type') === 'recovery' || hashParams.get('type') === 'recovery'

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!cancelled) {
            setError(exchangeError.message)
          }
          return
        }
        // Prefer recovery redirect when the link type is known; otherwise auth events decide.
        if (isRecovery) {
          finish('/reset-password')
          return
        }
        // Give PASSWORD_RECOVERY a moment to fire before falling back to home.
        window.setTimeout(() => {
          if (!finished) {
            finish('/')
          }
        }, 500)
        return
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        if (!cancelled) {
          setError(sessionError.message)
        }
        return
      }

      if (session) {
        finish(isRecovery ? '/reset-password' : '/')
        return
      }

      if (!cancelled) {
        setError('Could not complete sign-in. Try logging in with your email and password.')
      }
    })()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-england-navy">Sign-in problem</h1>
            <p className="mt-2 text-sm text-rose-600">{error}</p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-semibold text-england-red hover:underline"
            >
              Go to log in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-england-navy">Confirming your account…</h1>
            <p className="mt-2 text-sm text-slate-500">You will be redirected shortly.</p>
          </>
        )}
      </div>
    </div>
  )
}
