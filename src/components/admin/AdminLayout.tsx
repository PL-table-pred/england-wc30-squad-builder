import { Link, Outlet, useLocation } from 'react-router-dom'
import { AdminRoute } from './AdminRoute'

function AdminLayoutInner() {
  const location = useLocation()
  const isDashboard = location.pathname === '/admin'
  const isWidePage =
    location.pathname.startsWith('/admin/bots') || location.pathname.startsWith('/admin/players')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div
          className={`mx-auto flex items-center justify-between gap-3 px-4 py-4 sm:px-6 ${isWidePage ? 'max-w-7xl' : 'max-w-5xl'}`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
            <h1 className="text-xl font-bold text-england-navy">England WC &apos;30</h1>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
          >
            Squad builder
          </Link>
        </div>
      </header>

      <main
        className={`mx-auto space-y-6 px-4 py-8 sm:px-6 ${isWidePage ? 'max-w-7xl' : 'max-w-5xl'}`}
      >
        {!isDashboard && (
          <Link to="/admin" className="text-sm font-semibold text-england-red hover:underline">
            ← Admin dashboard
          </Link>
        )}
        <Outlet />
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <AdminRoute>
      <AdminLayoutInner />
    </AdminRoute>
  )
}
