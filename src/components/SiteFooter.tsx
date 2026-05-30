import { Link } from 'react-router-dom'

const legalLinks = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/contact', label: 'Contact' },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-england-navy"
          aria-label="Legal and information"
        >
          {legalLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-england-red">
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-center text-sm text-slate-500">
          England WC &apos;30 Squad Builder — an independent fan prediction tool. Not affiliated with
          The Football Association, FIFA, or any football club or league.
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Player names and likenesses are used for editorial fan discussion only.
        </p>
      </div>
    </footer>
  )
}
