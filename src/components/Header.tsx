import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const { user, profile, loading, configured, signOut, isAdmin, isProfileAdmin } = useAuth()
  const location = useLocation()

  const loginHref =
    location.pathname === '/login'
      ? '/login'
      : `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`

  const registerHref =
    location.pathname === '/register'
      ? '/register'
      : `/register?redirect=${encodeURIComponent(location.pathname + location.search)}`

  const displayLabel =
    profile?.display_name?.trim() ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Account'

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-england-red shadow-sm">
            <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
              <rect width="32" height="32" fill="#fff" />
              <rect x="14" width="4" height="32" fill="#CE1124" />
              <rect y="14" width="32" height="4" fill="#CE1124" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-england-navy sm:text-xl">England WC &apos;30</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Squad Builder</p>
          </div>
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2">
        <nav className="flex items-center gap-1">
          <Link
            to="/stats"
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              location.pathname === '/stats'
                ? 'bg-slate-100 text-england-navy'
                : 'text-slate-600 hover:bg-slate-50 hover:text-england-navy'
            }`}
          >
            Most picked
          </Link>
          <Link
            to="/#leaderboard"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-england-navy"
          >
            Leaderboard
          </Link>
        </nav>

        {configured && (
          <div className="flex items-center gap-2">
            {loading ? (
              <span className="text-sm text-slate-400">…</span>
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    to={isProfileAdmin ? '/admin' : '/?admin=1'}
                    className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100"
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden max-w-[160px] truncate text-sm font-medium text-england-navy sm:inline">
                  {displayLabel}
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to={loginHref}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  to={registerHref}
                  className="rounded-lg bg-england-red px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  )
}
