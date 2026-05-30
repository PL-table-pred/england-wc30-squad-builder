import type { Player, SquadState } from '../types/player'
import { computeSquadStats } from './squadStats'

export interface SquadDiff {
  onlyA: Player[]
  onlyB: Player[]
  shared: Player[]
  sameCaptain: boolean
  captainA: Player | null
  captainB: Player | null
  sameFormation: boolean
  formationA: string
  formationB: string
  statsA: ReturnType<typeof computeSquadStats>
  statsB: ReturnType<typeof computeSquadStats>
}

export function diffSquads(stateA: SquadState, stateB: SquadState, lookup: (id: string) => Player | undefined): SquadDiff {
  const setA = new Set(stateA.selectedIds)
  const setB = new Set(stateB.selectedIds)

  const onlyA = stateA.selectedIds
    .filter((id) => !setB.has(id))
    .map((id) => lookup(id))
    .filter((p): p is Player => !!p)

  const onlyB = stateB.selectedIds
    .filter((id) => !setA.has(id))
    .map((id) => lookup(id))
    .filter((p): p is Player => !!p)

  const shared = stateA.selectedIds
    .filter((id) => setB.has(id))
    .map((id) => lookup(id))
    .filter((p): p is Player => !!p)

  const playersA = stateA.selectedIds.map((id) => lookup(id)).filter((p): p is Player => !!p)
  const playersB = stateB.selectedIds.map((id) => lookup(id)).filter((p): p is Player => !!p)

  return {
    onlyA,
    onlyB,
    shared,
    sameCaptain: stateA.captainId === stateB.captainId,
    captainA: stateA.captainId ? lookup(stateA.captainId) ?? null : null,
    captainB: stateB.captainId ? lookup(stateB.captainId) ?? null : null,
    sameFormation: stateA.formation === stateB.formation,
    formationA: stateA.formation,
    formationB: stateB.formation,
    statsA: computeSquadStats(playersA),
    statsB: computeSquadStats(playersB),
  }
}

export function extractShareParam(url: string): string | null {
  try {
    const parsed = new URL(url.trim(), window.location.origin)
    return parsed.searchParams.get('s')
  } catch {
    if (url.includes('s=')) {
      const match = url.match(/[?&]s=([^&]+)/)
      return match ? decodeURIComponent(match[1]) : null
    }
    return url.trim() || null
  }
}
