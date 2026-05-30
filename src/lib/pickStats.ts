import { decodeSquadFromUrl } from '../utils/shareSquad'
import { aggregateSquads, type PickAggregationResult } from '../utils/aggregatePicks'
import type { SquadState } from '../types/player'
import { fetchAllPredictions } from './leaderboard'

export async function fetchPickStats(options?: {
  includeBots?: boolean
}): Promise<PickAggregationResult | null> {
  const rows = await fetchAllPredictions()
  if (rows.length === 0) {
    return {
      totalSubmissions: 0,
      humanSubmissions: 0,
      botSubmissions: 0,
      players: [],
      formations: [],
      topCaptains: [],
    }
  }

  const squads: (SquadState & { _isBot?: boolean })[] = []

  for (const row of rows) {
    const state = decodeSquadFromUrl(row.squad_param)
    if (!state) continue
    squads.push({ ...state, _isBot: row.is_bot })
  }

  if (squads.length === 0) return null

  return aggregateSquads(squads, { includeBots: options?.includeBots ?? false })
}
