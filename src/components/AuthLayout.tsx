import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-england-red shadow-sm">
              <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
                <rect width="32" height="32" fill="#fff" />
                <rect x="14" width="4" height="32" fill="#CE1124" />
                <rect y="14" width="32" height="4" fill="#CE1124" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-england-navy sm:text-xl">England WC &apos;30</p>
              <p className="text-xs text-slate-500 sm:text-sm">Squad Builder</p>
            </div>
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
          >
            Back to builder
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-england-navy">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
