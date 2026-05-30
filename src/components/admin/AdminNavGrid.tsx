import { Link } from 'react-router-dom'
import { ADMIN_NAV_SECTIONS } from '../../lib/adminNav'

export function AdminNavGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ADMIN_NAV_SECTIONS.map((section) => (
        <Link
          key={section.id}
          to={section.href}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-england-red/30 hover:shadow-md"
        >
          <h3 className="font-semibold text-england-navy">{section.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
        </Link>
      ))}
    </div>
  )
}
