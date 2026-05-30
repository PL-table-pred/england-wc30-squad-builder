import { PLAYERS } from '../data/players'
import type { Formation, SquadState } from '../types/player'
import { MAX_SQUAD_SIZE, MIN_GOALKEEPERS } from '../types/player'
import { autoAssignStartingXI, FORMATIONS } from '../utils/squadRules'
import { encodeSquadToUrl } from '../utils/shareSquad'

/** Higher weight = more likely to appear in bot squads. */
const PLAYER_WEIGHTS: Record<string, number> = {
  'gk-pickford': 5,
  'gk-trafford': 4,
  'gk-ramsdale': 3,
  'def-guehi': 5,
  'def-stones': 4,
  'def-livramento': 4,
  'def-alexander-arnold': 4,
  'def-white': 3,
  'def-shaw': 3,
  'def-colwill': 3,
  'mid-bellingham': 6,
  'mid-rice': 5,
  'mid-foden': 5,
  'mid-palmer': 5,
  'mid-mainoo': 4,
  'mid-eze': 4,
  'fwd-saka': 6,
  'fwd-kane': 5,
  'fwd-watkins': 4,
  'fwd-gordon': 4,
  'fwd-bowen': 3,
}

const FORMATION_WEIGHTS: Record<Formation, number> = {
  '4-3-3': 4,
  '4-2-3-1': 3,
  '3-4-3': 2,
  '4-4-2': 1,
}

const CAPTAIN_WEIGHTS: Record<string, number> = {
  'mid-bellingham': 5,
  'fwd-kane': 4,
  'mid-rice': 3,
  'fwd-saka': 3,
  'mid-foden': 2,
  'def-guehi': 2,
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function weightedPick<T extends { id: string }>(items: T[], weightFor: (item: T) => number): T | null {
  if (items.length === 0) return null
  const weights = items.map((item) => Math.max(1, weightFor(item)))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return items[i]
  }
  return items[items.length - 1]
}

function pickFormation(): Formation {
  const entries = FORMATIONS.flatMap((f) => Array.from({ length: FORMATION_WEIGHTS[f] }, () => f))
  return entries[randInt(0, entries.length - 1)]
}

function pickSquadComposition(): Record<'GK' | 'DEF' | 'MID' | 'FWD', number> {
  const defCount = randInt(8, 10)
  const midCount = randInt(7, 9)
  const fwdCount = MAX_SQUAD_SIZE - MIN_GOALKEEPERS - defCount - midCount
  return { GK: MIN_GOALKEEPERS, DEF: defCount, MID: midCount, FWD: fwdCount }
}

function pickPlayersForPosition(
  position: 'GK' | 'DEF' | 'MID' | 'FWD',
  count: number,
  used: Set<string>,
): string[] {
  const pool = PLAYERS.filter((p) => p.position === position && !used.has(p.id))
  const picked: string[] = []

  for (let i = 0; i < count; i++) {
    const available = pool.filter((p) => !picked.includes(p.id))
    const choice = weightedPick(available, (p) => PLAYER_WEIGHTS[p.id] ?? 1)
    if (!choice) break
    picked.push(choice.id)
  }

  return picked
}

function pickCaptain(xiIds: string[]): string | null {
  const xiPlayers = xiIds
    .map((id) => PLAYERS.find((p) => p.id === id))
    .filter((p): p is (typeof PLAYERS)[number] => Boolean(p))
  const captain = weightedPick(xiPlayers, (p) => CAPTAIN_WEIGHTS[p.id] ?? 1)
  return captain?.id ?? xiIds[0] ?? null
}

/** Build a random but realistic complete squad for a QA bot. */
export function generateBotSquadState(): SquadState {
  const formation = pickFormation()
  const composition = pickSquadComposition()
  const used = new Set<string>()
  const selectedIds: string[] = []

  for (const position of ['GK', 'DEF', 'MID', 'FWD'] as const) {
    const ids = pickPlayersForPosition(position, composition[position], used)
    for (const id of ids) {
      selectedIds.push(id)
      used.add(id)
    }
  }

  while (selectedIds.length < MAX_SQUAD_SIZE) {
    const remaining = PLAYERS.filter((p) => !used.has(p.id))
    const choice = weightedPick(remaining, (p) => PLAYER_WEIGHTS[p.id] ?? 1)
    if (!choice) break
    selectedIds.push(choice.id)
    used.add(choice.id)
  }

  const selectedPlayers = selectedIds
    .map((id) => PLAYERS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const startingXI = autoAssignStartingXI(formation, selectedPlayers)
  const xiIds = Object.values(startingXI).filter((id): id is string => Boolean(id))
  const captainId = pickCaptain(xiIds)

  return {
    formation,
    selectedIds,
    startingXI,
    captainId,
  }
}

export function generateBotSquadParam(): string {
  return encodeSquadToUrl(generateBotSquadState())
}
