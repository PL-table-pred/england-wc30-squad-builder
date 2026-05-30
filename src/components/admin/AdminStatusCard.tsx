interface AdminStatusCardProps {
  label: string
  value: string
  hint?: string
  variant?: 'default' | 'success' | 'warning'
}

export function AdminStatusCard({ label, value, hint, variant = 'default' }: AdminStatusCardProps) {
  const valueClass =
    variant === 'success'
      ? 'text-emerald-700'
      : variant === 'warning'
        ? 'text-amber-700'
        : 'text-england-navy'

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
