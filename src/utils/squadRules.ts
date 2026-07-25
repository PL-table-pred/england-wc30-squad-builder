import type { Formation, PitchSlot, Player, Position, SubPosition } from '../types/player'
import { MAX_GOALKEEPERS, MAX_SQUAD_SIZE, MIN_GOALKEEPERS } from '../types/player'

/** Sorted by number of defenders (first digit), then by shape. */
export const FORMATIONS: Formation[] = [
  '3-4-3',
  '3-4-2-1',
  '3-5-2',
  '4-4-2',
  '4-5-1',
  '4-3-3',
  '4-2-3-1',
  '4-1-4-1',
  '4-3-1-2',
  '5-4-1',
  '5-3-2',
  '5-2-3',
]

export function isFormation(value: string): value is Formation {
  return (FORMATIONS as string[]).includes(value)
}

export const FORMATION_SLOTS: Record<Formation, PitchSlot[]> = {
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
  '3-4-2-1': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'cb3', label: 'CB', subPositions: ['CB'] },
    { id: 'lwb', label: 'LWB', subPositions: ['LWB', 'LB'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'rwb', label: 'RWB', subPositions: ['RWB', 'RB'] },
    { id: 'lf', label: 'LF', subPositions: ['CAM', 'LW', 'CF'] },
    { id: 'rf', label: 'RF', subPositions: ['CAM', 'RW', 'CF'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
  '3-5-2': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'cb3', label: 'CB', subPositions: ['CB'] },
    { id: 'lwb', label: 'LWB', subPositions: ['LWB', 'LB', 'LM'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM', 'CAM'] },
    { id: 'cm3', label: 'CM', subPositions: ['CM', 'CAM'] },
    { id: 'rwb', label: 'RWB', subPositions: ['RWB', 'RB', 'RM'] },
    { id: 'st1', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'st2', label: 'ST', subPositions: ['ST', 'CF'] },
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
  '4-5-1': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lb', label: 'LB', subPositions: ['LB', 'LWB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'rb', label: 'RB', subPositions: ['RB', 'RWB'] },
    { id: 'lm', label: 'LM', subPositions: ['LM', 'LW'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM', 'CAM'] },
    { id: 'cm3', label: 'CM', subPositions: ['CM', 'CAM'] },
    { id: 'rm', label: 'RM', subPositions: ['RM', 'RW'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
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
  '4-1-4-1': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lb', label: 'LB', subPositions: ['LB', 'LWB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'rb', label: 'RB', subPositions: ['RB', 'RWB'] },
    { id: 'cdm', label: 'CDM', subPositions: ['CDM', 'CM'] },
    { id: 'lm', label: 'LM', subPositions: ['LM', 'LW'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CAM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CAM'] },
    { id: 'rm', label: 'RM', subPositions: ['RM', 'RW'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
  '4-3-1-2': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lb', label: 'LB', subPositions: ['LB', 'LWB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'rb', label: 'RB', subPositions: ['RB', 'RWB'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm3', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cam', label: 'CAM', subPositions: ['CAM', 'CM'] },
    { id: 'st1', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'st2', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
  '5-4-1': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lwb', label: 'LWB', subPositions: ['LWB', 'LB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'cb3', label: 'CB', subPositions: ['CB'] },
    { id: 'rwb', label: 'RWB', subPositions: ['RWB', 'RB'] },
    { id: 'lm', label: 'LM', subPositions: ['LM', 'LW', 'CM'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'rm', label: 'RM', subPositions: ['RM', 'RW', 'CM'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
  '5-3-2': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lwb', label: 'LWB', subPositions: ['LWB', 'LB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'cb3', label: 'CB', subPositions: ['CB'] },
    { id: 'rwb', label: 'RWB', subPositions: ['RWB', 'RB'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM', 'CAM'] },
    { id: 'cm3', label: 'CM', subPositions: ['CM', 'CAM'] },
    { id: 'st1', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'st2', label: 'ST', subPositions: ['ST', 'CF'] },
  ],
  '5-2-3': [
    { id: 'gk', label: 'GK', subPositions: ['GK'] },
    { id: 'lwb', label: 'LWB', subPositions: ['LWB', 'LB'] },
    { id: 'cb1', label: 'CB', subPositions: ['CB'] },
    { id: 'cb2', label: 'CB', subPositions: ['CB'] },
    { id: 'cb3', label: 'CB', subPositions: ['CB'] },
    { id: 'rwb', label: 'RWB', subPositions: ['RWB', 'RB'] },
    { id: 'cm1', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'CM', subPositions: ['CM', 'CDM'] },
    { id: 'lw', label: 'LW', subPositions: ['LW', 'LM'] },
    { id: 'st', label: 'ST', subPositions: ['ST', 'CF'] },
    { id: 'rw', label: 'RW', subPositions: ['RW', 'RM'] },
  ],
}

/** Pitch rows from GK (top) to attack (bottom), matching FormationPitch layout. */
export function getPitchRows(formation: Formation): string[][] {
  switch (formation) {
    case '3-4-3':
      return [['gk'], ['cb1', 'cb2', 'cb3'], ['lwb', 'cm1', 'cm2', 'rwb'], ['lw', 'st', 'rw']]
    case '3-4-2-1':
      return [['gk'], ['cb1', 'cb2', 'cb3'], ['lwb', 'cm1', 'cm2', 'rwb'], ['lf', 'rf'], ['st']]
    case '3-5-2':
      return [['gk'], ['cb1', 'cb2', 'cb3'], ['lwb', 'cm1', 'cm2', 'cm3', 'rwb'], ['st1', 'st2']]
    case '4-4-2':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['lm', 'cm1', 'cm2', 'rm'], ['st1', 'st2']]
    case '4-5-1':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['lm', 'cm1', 'cm2', 'cm3', 'rm'], ['st']]
    case '4-3-3':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['cm1', 'cm2', 'cm3'], ['lw', 'st', 'rw']]
    case '4-2-3-1':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['cdm1', 'cdm2'], ['lam', 'cam', 'ram'], ['st']]
    case '4-1-4-1':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['cdm'], ['lm', 'cm1', 'cm2', 'rm'], ['st']]
    case '4-3-1-2':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['cm1', 'cm2', 'cm3'], ['cam'], ['st1', 'st2']]
    case '5-4-1':
      return [['gk'], ['lwb', 'cb1', 'cb2', 'cb3', 'rwb'], ['lm', 'cm1', 'cm2', 'rm'], ['st']]
    case '5-3-2':
      return [['gk'], ['lwb', 'cb1', 'cb2', 'cb3', 'rwb'], ['cm1', 'cm2', 'cm3'], ['st1', 'st2']]
    case '5-2-3':
      return [['gk'], ['lwb', 'cb1', 'cb2', 'cb3', 'rwb'], ['cm1', 'cm2'], ['lw', 'st', 'rw']]
    default:
      return [['gk']]
  }
}

export function createEmptyStartingXI(formation: Formation): Record<string, string | null> {
  return Object.fromEntries(
    FORMATION_SLOTS[formation].map((slot) => [slot.id, null]),
  )
}

export function countByPosition(selectedPlayers: Player[]): Record<Position, number> {
  return {
    GK: selectedPlayers.filter((p) => p.position === 'GK').length,
    DEF: selectedPlayers.filter((p) => p.position === 'DEF').length,
    MID: selectedPlayers.filter((p) => p.position === 'MID').length,
    FWD: selectedPlayers.filter((p) => p.position === 'FWD').length,
  }
}

export function canAddPlayer(
  player: Player,
  selectedPlayers: Player[],
): { allowed: boolean; reason?: string } {
  if (selectedPlayers.some((p) => p.id === player.id)) {
    return { allowed: false, reason: 'Already in squad' }
  }
  if (selectedPlayers.length >= MAX_SQUAD_SIZE) {
    return { allowed: false, reason: 'Squad is full (26/26)' }
  }
  if (player.position === 'GK') {
    const gkCount = selectedPlayers.filter((p) => p.position === 'GK').length
    if (gkCount >= MAX_GOALKEEPERS) {
      return { allowed: false, reason: 'Maximum 3 goalkeepers' }
    }
  }
  return { allowed: true }
}

export function validateSquad(
  selectedPlayers: Player[],
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
  const selectedIds = selectedPlayers.map((p) => p.id)
  const counts = countByPosition(selectedPlayers)
  const messages: string[] = []

  if (counts.GK < MIN_GOALKEEPERS) {
    messages.push(`Need ${MIN_GOALKEEPERS - counts.GK} more goalkeeper(s)`)
  }
  if (selectedPlayers.length < MAX_SQUAD_SIZE) {
    messages.push(`Select ${MAX_SQUAD_SIZE - selectedPlayers.length} more player(s)`)
  }
  if (!captainId) {
    messages.push('Choose a captain')
  } else if (!selectedIds.includes(captainId)) {
    messages.push('Captain must be in the squad')
  }

  return {
    isComplete:
      selectedPlayers.length === MAX_SQUAD_SIZE &&
      counts.GK === MIN_GOALKEEPERS &&
      captainId !== null &&
      selectedIds.includes(captainId),
    totalCount: selectedPlayers.length,
    gkCount: counts.GK,
    needsMoreGk: Math.max(0, MIN_GOALKEEPERS - counts.GK),
    isFull: selectedPlayers.length >= MAX_SQUAD_SIZE,
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
