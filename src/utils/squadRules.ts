import type { Formation, PitchSlot, Player, Position, SubPosition } from '../types/player'
import { MAX_GOALKEEPERS, MAX_SQUAD_SIZE, MIN_GOALKEEPERS } from '../types/player'

export const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '3-4-3', '4-4-2']

export const FORMATION_SLOTS: Record<Formation, PitchSlot[]> = {
  '4-3-3': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lb', label: 'LB', subPositions: ['LB', 'LWB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'rb', label: 'RB', subPositions: ['RB', 'RWB'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm3', label: 'CM', subPositions: ['CM', 'CAM', 'CDM'] },
    { id: 'lw', label: 'LW', subPositions: ['LW', 'LM'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'rw', label: 'RW', subPositions: ['RW', 'RM'] },
  ],
  '4-2-3-1': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lb', label: 'LB', subPositions: ['LB', 'LWB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'rb', label: 'RB', subPositions: ['RB', 'RWB'] },
    { id: 'cdm1', label: 'CDM', subPositions: ['CDM', 'CM'] },
    { id: 'cdm2', label: 'CDM', subPositions: ['CDM', 'CM'] },
    { id: 'lam', label: 'LAM', subPositions: ['LW', 'LM', 'CAM'] },
    { id: 'cam', label: 'CAM', subPositions: ['CAM', 'CM'] },
    { id: 'ram', label: 'RAM', subPositions: ['RW', 'RM', 'CAM'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
  '3-4-3': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'cb3', label: 'CB', subPositions: ['CB'] },
    { id: 'lwb', label: 'LWB', subPositions: ['LWB', 'LB'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'rwb', label: 'RWB', subPositions: ['RWB', 'RB'] },
    { id: 'lw', label: 'LW', subPositions: ['LW', 'LM'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'rw', label: 'RW', subPositions: ['RW', 'RM'] },
  ],
  '4-4-2': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lb', label: 'LB', subPositions: ['LB', 'LWB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'rb', label: 'RB', subPositions: ['RB', 'RWB'] },
    { id: 'lm', label: 'LM', subPositions: ['LM', 'LW', 'CM'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'rm', label: 'RM', subPositions: ['RM', 'RW', 'CM'] },
    { id: 'st1', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'st2', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
}

export function createEmptyStartingXI(formation: Formation): Record<string, string | null> {
  return Object.fromEntries(
    FORMATION_SLOTS[formation].map((slot) => [slot.id, null]),
  )
}

export function countByPosition(players: Player[], selectedIds: string[]): Record<Position, number> {
  const selected = players.filter((p) => selectedIds.includes(p.id))
  return {
    GK: selected.filter((p) => p.position === 'GK').length,
    DEF: selected.filter((p) => p.position === 'DEF').length,
    MID: selected.filter((p) => p.position === 'MID').length,
    FWD: selected.filter((p) => p.position === 'FWD').length,
  }
}

export function canAddPlayer(
  player: Player,
  selectedIds: string[],
): { allowed: boolean; reason?: string } {
  if (selectedIds.includes(player.id)) {
    return { allowed: false, reason: 'Already in squad' }
  }
  if (selectedIds.length >= MAX_SQUAD_SIZE) {
    return { allowed: false, reason: 'Squad is full (26/26)' }
  }
  if (player.position === 'GK') {
    const gkCount = selectedIds.filter((id) => id.startsWith('gk-')).length
    if (gkCount >= MAX_GOALKEEPERS) {
      return { allowed: false, reason: 'Maximum 3 goalkeepers' }
    }
  }
  return { allowed: true }
}

export function validateSquad(
  players: Player[],
  selectedIds: string[],
  captainId: string | null,
): {
  isComplete: boolean
  totalCount: number
  gkCount: number
  needsMoreGk: number
  isFull: boolean
  hasCaptain: boolean
  messages: string[]
} {
  const counts = countByPosition(players, selectedIds)
  const messages: string[] = []

  if (counts.GK < MIN_GOALKEEPERS) {
    messages.push(`Need ${MIN_GOALKEEPERS - counts.GK} more goalkeeper(s)`)
  }
  if (selectedIds.length < MAX_SQUAD_SIZE) {
    messages.push(`Select ${MAX_SQUAD_SIZE - selectedIds.length} more player(s)`)
  }
  if (!captainId) {
    messages.push('Choose a captain')
  } else if (!selectedIds.includes(captainId)) {
    messages.push('Captain must be in the squad')
  }

  return {
    isComplete:
      selectedIds.length === MAX_SQUAD_SIZE &&
      counts.GK === MIN_GOALKEEPERS &&
      captainId !== null &&
      selectedIds.includes(captainId),
    totalCount: selectedIds.length,
    gkCount: counts.GK,
    needsMoreGk: Math.max(0, MIN_GOALKEEPERS - counts.GK),
    isFull: selectedIds.length >= MAX_SQUAD_SIZE,
    hasCaptain: captainId !== null && selectedIds.includes(captainId),
    messages,
  }
}

export function autoAssignStartingXI(
  formation: Formation,
  selectedPlayers: Player[],
): Record<string, string | null> {
  const slots = FORMATION_SLOTS[formation]
  const startingXI = createEmptyStartingXI(formation)
  const used = new Set<string>()

  for (const slot of slots) {
    const match = selectedPlayers.find(
      (player) =>
        !used.has(player.id) && slot.subPositions.includes(player.subPosition as SubPosition),
    )
    if (match) {
      startingXI[slot.id] = match.id
      used.add(match.id)
    }
  }

  for (const slot of slots) {
    if (startingXI[slot.id]) continue
    const fallback = selectedPlayers.find((player) => !used.has(player.id))
    if (fallback) {
      startingXI[slot.id] = fallback.id
      used.add(fallback.id)
    }
  }

  return startingXI
}

export const STORAGE_KEY = 'england-wc30-squad'
