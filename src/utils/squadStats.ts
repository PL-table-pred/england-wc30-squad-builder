import type { Player, Position } from '../types/player'
import { getAgeIn2030 } from '../types/player'

export interface SquadStats {
  counts: Record<Position, number>
  breakdown: string
  averageAge: number | null
  youngest: { player: Player; age: number } | null
  oldest: { player: Player; age: number } | null
}

export function computeSquadStats(players: Player[]): SquadStats {
  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  for (const player of players) {
    counts[player.position]++
  }

  const breakdown = `${counts.GK} GK / ${counts.DEF} DEF / ${counts.MID} MID / ${counts.FWD} FWD`

  if (players.length === 0) {
    return { counts, breakdown, averageAge: null, youngest: null, oldest: null }
  }

  const withAges = players
    .filter((player) => !player.isCustom)
    .map((player) => ({
      player,
      age: getAgeIn2030(player.birthYear),
    }))

  if (withAges.length === 0) {
    return { counts, breakdown, averageAge: null, youngest: null, oldest: null }
  }

  const totalAge = withAges.reduce((sum, { age }) => sum + age, 0)
  const averageAge = Math.round((totalAge / withAges.length) * 10) / 10

  const youngest = withAges.reduce((min, curr) => (curr.age < min.age ? curr : min))
  const oldest = withAges.reduce((max, curr) => (curr.age > max.age ? curr : max))

  return { counts, breakdown, averageAge, youngest, oldest }
}
