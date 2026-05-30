import { useCallback, useEffect, useState } from 'react'
import { decodeSquadFromUrl } from '../utils/shareSquad'
import { formatSquadSummaryLine } from '../lib/customPlayers'
import { formatScoreBreakdown } from '../utils/squadScore'
import { fetchLeaderboard } from '../lib/leaderboard'
import { isSupabaseConfigured, type LeaderboardEntry, type ReferenceSquadRow } from '../lib/supabase'

function squadSummary(squadParam: string): string {
  const state = decodeSquadFromUrl(squadParam)
  if (!state) return 'Invalid squad'
  return formatSquadSummaryLine(state)
}

function buildSquadUrl(squadParam: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set('s', squadParam)
  url.searchParams.delete('admin')
  url.hash = 'builder'
  return url.toString()
}

interface LeaderboardProps {
  refreshKey?: number
}

export function Leaderboard({ refreshKey = 0 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [reference, setReference] = useState<ReferenceSquadRow | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  const load = useCallback(async () => {
    if (!configured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const result = await fetchLeaderboard(15)
    setEntries(result.entries)
    setReference(result.reference)
    setLoading(false)
  }, [configured])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  if (!configured) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        Community leaderboard requires Supabase. Add <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-xs">.env</code> file.
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-england-navy">Community Leaderboard</h3>
          <p className="text-sm text-slate-500">Ranked by accuracy vs the reference squad</p>
          {reference?.label && (
            <p className="mt-1 text-xs text-slate-400">Reference: {reference.label}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-england-navy hover:bg-slate-200"
        >
          Refresh
        </button>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        10 pts per matching starter · 5 pts per matching bench player · 30 pts for correct captain
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-400">Loading leaderboard…</p>
      ) : !reference ? (
        <p className="mt-4 text-sm text-slate-400">
          Reference squad not set yet — leaderboard scoring will begin once published.
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          No squads submitted yet. Be the first to post yours!
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.map((row, index) => (
            <li key={row.id}>
              <a
                href={buildSquadUrl(row.squad_param)}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:border-england-red/30 hover:bg-red-50/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-england-navy text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-england-navy">
                      {row.bot_name ?? squadSummary(row.squad_param)}
                      {row.is_bot && (
                        <span className="ml-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                          Bot
                        </span>
                      )}
                    </p>
                    {row.bot_name && (
                      <p className="truncate text-xs text-slate-500">{squadSummary(row.squad_param)}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {formatScoreBreakdown(row.score)} · Posted{' '}
                      {new Date(row.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-england-red ring-1 ring-slate-200">
                  {row.score.total} pts
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
