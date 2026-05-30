import type { AggregatedPlayerPick } from '../utils/aggregatePicks'

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const

function pct(count: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((count / total) * 100)}%`
}

interface PickStatsTableProps {
  title: string
  subtitle?: string
  rows: AggregatedPlayerPick[]
  totalSubmissions: number
  sortKey: 'inSquad' | 'inXI' | 'asCaptain'
  limit?: number
}

export function PickStatsTable({
  title,
  subtitle,
  rows,
  totalSubmissions,
  sortKey,
  limit = 25,
}: PickStatsTableProps) {
  const sorted = [...rows]
    .filter((r) => r[sortKey] > 0)
    .sort((a, b) => b[sortKey] - a[sortKey] || b.inSquad - a.inSquad)
    .slice(0, limit)

  if (sorted.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <p className="mt-3 text-sm text-slate-400">No data yet.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-england-navy">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">Player</th>
              <th className="pb-2 pr-2">Pos</th>
              <th className="pb-2 pr-2 text-right">Count</th>
              <th className="pb-2 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => (
              <tr key={row.key} className="border-b border-slate-50 last:border-0">
                <td className="py-2 pr-2 text-slate-400">{index + 1}</td>
                <td className="py-2 pr-2 font-medium text-england-navy">
                  {row.displayName}
                  {row.isCustom && (
                    <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                      Custom
                    </span>
                  )}
                </td>
                <td className="py-2 pr-2 text-slate-500">{row.position}</td>
                <td className="py-2 pr-2 text-right font-semibold tabular-nums">{row[sortKey]}</td>
                <td className="py-2 text-right tabular-nums text-slate-500">
                  {pct(row[sortKey], totalSubmissions)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

interface FormationBarsProps {
  formations: { formation: string; count: number; share: number }[]
  totalSubmissions: number
}

export function FormationBars({ formations, totalSubmissions }: FormationBarsProps) {
  if (formations.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">Formations</h3>
        <p className="mt-3 text-sm text-slate-400">No data yet.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-england-navy">Formations</h3>
      <p className="mt-1 text-sm text-slate-500">Most popular shapes across {totalSubmissions} squads</p>
      <ul className="mt-4 space-y-3">
        {formations.map((row) => (
          <li key={row.formation}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-england-navy">{row.formation}</span>
              <span className="text-slate-500">
                {row.count} · {pct(row.count, totalSubmissions)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-england-red transition-all"
                style={{ width: `${Math.max(row.share * 100, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PositionBreakdown({
  players,
  totalSubmissions,
}: {
  players: AggregatedPlayerPick[]
  totalSubmissions: number
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-england-navy">By position</h3>
      <p className="mt-1 text-sm text-slate-500">Top 5 most picked per line</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {POSITION_ORDER.map((pos) => {
          const top = players
            .filter((p) => p.position === pos)
            .sort((a, b) => b.inSquad - a.inSquad)
            .slice(0, 5)
          return (
            <div key={pos} className="rounded-lg bg-slate-50 p-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">{pos}</h4>
              {top.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">—</p>
              ) : (
                <ol className="mt-2 space-y-1">
                  {top.map((p, i) => (
                    <li key={p.key} className="flex justify-between gap-2 text-sm">
                      <span className="truncate text-england-navy">
                        {i + 1}. {p.displayName}
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-500">
                        {pct(p.inSquad, totalSubmissions)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
