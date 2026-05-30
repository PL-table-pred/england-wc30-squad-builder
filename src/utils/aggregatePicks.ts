import { resolveSquadPlayer, normalizePlayerName } from '../lib/customPlayers'
import { PLAYERS_BY_ID } from '../data/players'
import type { Position, SquadState } from '../types/player'
import { getBenchIds, getStartingXIIds } from './squadScore'

export interface AggregatedPlayerPick {
  key: string
  displayName: string
  position: Position
  isCustom: boolean
  inSquad: number
  inXI: number
  onBench: number
  asCaptain: number
}

export interface FormationPickCount {
  formation: string
  count: number
  share: number
}

export interface PickAggregationResult {
  totalSubmissions: number
  humanSubmissions: number
  botSubmissions: number
  players: AggregatedPlayerPick[]
  formations: FormationPickCount[]
  topCaptains: AggregatedPlayerPick[]
}

function pickKey(state: SquadState, playerId: string): string {
  const player = resolveSquadPlayer(playerId, state.customPlayers ?? {})
  if (!player) return playerId
  if (player.isCustom) return `name:${normalizePlayerName(player.name)}`
  return player.id
}

function displayNameForKey(key: string, state: SquadState): string {
  if (key.startsWith('name:')) {
    const norm = key.slice(5)
    for (const id of state.selectedIds) {
      const p = resolveSquadPlayer(id, state.customPlayers ?? {})
      if (p?.isCustom && normalizePlayerName(p.name) === norm) return p.name
    }
    return norm
  }
  return PLAYERS_BY_ID[key]?.name ?? key
}

function positionForKey(key: string, state: SquadState): Position {
  if (key.startsWith('name:')) {
    for (const id of state.selectedIds) {
      const p = resolveSquadPlayer(id, state.customPlayers ?? {})
      if (p?.isCustom && `name:${normalizePlayerName(p.name)}` === key) return p.position
    }
    return 'MID'
  }
  return PLAYERS_BY_ID[key]?.position ?? 'MID'
}

export function aggregateSquads(
  squads: SquadState[],
  options: { includeBots?: boolean } = {},
): PickAggregationResult {
  const includeBots = options.includeBots ?? false
  const map = new Map<
    string,
    { inSquad: number; inXI: number; onBench: number; asCaptain: number; sampleState: SquadState }
  >()
  const formationCounts = new Map<string, number>()

  let humanSubmissions = 0
  let botSubmissions = 0

  for (const state of squads) {
    const isBot = (state as SquadState & { _isBot?: boolean })._isBot
    if (isBot) botSubmissions++
    else humanSubmissions++

    if (!includeBots && isBot) continue

    formationCounts.set(state.formation, (formationCounts.get(state.formation) ?? 0) + 1)

    const xi = getStartingXIIds(state)
    const bench = getBenchIds(state)

    for (const id of state.selectedIds) {
      const key = pickKey(state, id)
      const row = map.get(key) ?? {
        inSquad: 0,
        inXI: 0,
        onBench: 0,
        asCaptain: 0,
        sampleState: state,
      }
      row.inSquad++
      if (xi.has(id)) row.inXI++
      if (bench.has(id)) row.onBench++
      map.set(key, row)
    }

    if (state.captainId) {
      const cKey = pickKey(state, state.captainId)
      const row = map.get(cKey) ?? {
        inSquad: 0,
        inXI: 0,
        onBench: 0,
        asCaptain: 0,
        sampleState: state,
      }
      row.asCaptain++
      map.set(cKey, row)
    }
  }

  const totalSubmissions = includeBots ? squads.length : humanSubmissions

  const players: AggregatedPlayerPick[] = [...map.entries()]
    .map(([key, stats]) => ({
      key,
      displayName: displayNameForKey(key, stats.sampleState),
      position: positionForKey(key, stats.sampleState),
      isCustom: key.startsWith('name:'),
      inSquad: stats.inSquad,
      inXI: stats.inXI,
      onBench: stats.onBench,
      asCaptain: stats.asCaptain,
    }))
    .sort((a, b) => b.inSquad - a.inSquad || b.asCaptain - a.asCaptain)

  const formations: FormationPickCount[] = [...formationCounts.entries()]
    .map(([formation, count]) => ({
      formation,
      count,
      share: totalSubmissions > 0 ? count / totalSubmissions : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const topCaptains = [...players]
    .filter((p) => p.asCaptain > 0)
    .sort((a, b) => b.asCaptain - a.asCaptain)

  return {
    totalSubmissions: squads.length,
    humanSubmissions,
    botSubmissions,
    players,
    formations,
    topCaptains,
  }
}
