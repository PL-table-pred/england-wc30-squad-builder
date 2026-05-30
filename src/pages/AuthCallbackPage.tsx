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

    const finish = () => {
      if (!cancelled) {
        navigate('/', { replace: true })
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        finish()
      }
    })

    void (async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!cancelled) {
            setError(exchangeError.message)
          }
          return
        }
        finish()
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
        finish()
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
