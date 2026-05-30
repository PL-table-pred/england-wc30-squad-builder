import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { hasAdminSecretSession } from '../../lib/adminAccess'
import { AdminSecretGate } from './AdminSecretGate'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isProfileAdmin, adminSecretUnlocked, loading, configured } = useAuth()
  const [unlocked, setUnlocked] = useState(
    () => isProfileAdmin || adminSecretUnlocked || hasAdminSecretSession(),
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (isProfileAdmin || adminSecretUnlocked) {
      setUnlocked(true)
    }
  }, [isProfileAdmin, adminSecretUnlocked])

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-slate-500">
        Supabase is not configured. Add environment variables to use the admin panel.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }

  if (isProfileAdmin) {
    return <>{children}</>
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <AdminSecretGate onUnlocked={() => setUnlocked(true)} />
      </div>
    )
  }

  return (
    <>
      {children}
      <p className="mx-auto mt-8 max-w-5xl px-4 text-center text-xs text-slate-400 sm:px-6">
        Signed in with admin secret.{' '}
        <Link to="/?admin=1" className="font-semibold text-england-red hover:underline">
          Quick admin on squad builder
        </Link>
      </p>
    </>
  )
}
