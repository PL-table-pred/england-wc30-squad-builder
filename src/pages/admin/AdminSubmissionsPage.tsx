import { useCallback, useEffect, useState } from 'react'
import { formatSquadSummaryLine } from '../../lib/customPlayers'
import { deletePrediction } from '../../lib/admin'
import { fetchAllPredictions } from '../../lib/leaderboard'
import { decodeSquadFromUrl } from '../../utils/shareSquad'
import type { SquadPredictionRow } from '../../lib/supabase'

function squadSummary(squadParam: string): string {
  const state = decodeSquadFromUrl(squadParam)
  if (!state) return 'Invalid squad'
  return formatSquadSummaryLine(state)
}

export function AdminSubmissionsPage() {
  const [rows, setRows] = useState<SquadPredictionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchAllPredictions()
    setRows(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(row: SquadPredictionRow) {
    const label = row.bot_name ?? squadSummary(row.squad_param)
    if (!window.confirm(`Delete submission: ${label}?`)) return

    const result = await deletePrediction(row.id)
    if (!result.ok) {
      setStatus(result.error ?? 'Delete failed.')
      return
    }

    setStatus('Submission deleted.')
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Submissions</h2>
        <p className="mt-1 text-sm text-slate-500">
          All squad predictions on the leaderboard, including QA bots.
        </p>
      </div>

      {status && (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {status}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No submissions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-england-navy">
                    {row.bot_name ?? 'Community submission'}
                    {row.is_bot && (
                      <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-700">
                        Bot
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{squadSummary(row.squad_param)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(row.created_at).toLocaleString()} · {row.view_count} views
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(row)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
