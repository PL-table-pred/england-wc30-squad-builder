import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import {
  FormationBars,
  PickStatsTable,
  PositionBreakdown,
} from '../components/PickStatsTable'
import { fetchPickStats } from '../lib/pickStats'
import { isSupabaseConfigured } from '../lib/supabase'
import type { PickAggregationResult } from '../utils/aggregatePicks'

export function MostPickedPage() {
  const configured = isSupabaseConfigured()
  const [stats, setStats] = useState<PickAggregationResult | null>(null)
  const [includeBots, setIncludeBots] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!configured) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPickStats({ includeBots })
      if (result === null) {
        setError('Could not decode any submitted squads.')
        setStats(null)
      } else {
        setStats(result)
      }
    } catch {
      setError('Failed to load community stats.')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [configured, includeBots])

  useEffect(() => {
    void load()
  }, [load])

  const total = stats?.totalSubmissions ?? 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-england-red">Community</p>
            <h1 className="mt-1 text-3xl font-extrabold text-england-navy sm:text-4xl">Most picked</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Aggregated from every squad on the leaderboard — who fans and journalists are backing for
              2030.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/#leaderboard"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
            >
              ← Leaderboard
            </Link>
            <Link
              to="/#builder"
              className="rounded-lg bg-england-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Build your squad
            </Link>
          </div>
        </div>

        {!configured ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            Stats require Supabase. Add <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-xs">.env</code>.
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm text-slate-600">
                {loading ? (
                  'Loading…'
                ) : stats ? (
                  <>
                    <span className="font-semibold text-england-navy">{total}</span> squads analysed
                    {!includeBots && stats.botSubmissions > 0 && (
                      <span className="text-slate-400">
                        {' '}
                        ({stats.botSubmissions} QA bot{stats.botSubmissions === 1 ? '' : 's'} hidden)
                      </span>
                    )}
                  </>
                ) : (
                  'No submissions yet'
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={includeBots}
                  onChange={(e) => setIncludeBots(e.target.checked)}
                  className="rounded border-slate-300 text-england-red focus:ring-england-red"
                />
                Include QA bots
              </label>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-england-navy hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}

            {loading ? (
              <p className="mt-8 text-sm text-slate-400">Crunching pick rates…</p>
            ) : stats && total > 0 ? (
              <div className="mt-8 space-y-6">
                <FormationBars formations={stats.formations} totalSubmissions={total} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <PickStatsTable
                    title="Most in squads"
                    subtitle="Selected in the 26-man squad"
                    rows={stats.players}
                    totalSubmissions={total}
                    sortKey="inSquad"
                  />
                  <PickStatsTable
                    title="Most captained"
                    subtitle="Wearing the armband"
                    rows={stats.topCaptains.length ? stats.topCaptains : stats.players}
                    totalSubmissions={total}
                    sortKey="asCaptain"
                    limit={15}
                  />
                </div>
                <PickStatsTable
                  title="Most in starting XI"
                  subtitle="On the pitch in the chosen formation"
                  rows={stats.players}
                  totalSubmissions={total}
                  sortKey="inXI"
                />
                <PositionBreakdown players={stats.players} totalSubmissions={total} />
              </div>
            ) : !error ? (
              <p className="mt-8 text-sm text-slate-400">
                No leaderboard submissions yet.{' '}
                <Link to="/#builder" className="font-semibold text-england-red hover:underline">
                  Submit the first squad
                </Link>
                .
              </p>
            ) : null}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
