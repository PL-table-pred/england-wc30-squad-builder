export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export type SubPosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST'
  | 'CF'

export type Formation = '4-3-3' | '4-2-3-1' | '3-4-3' | '4-4-2'

export interface Player {
  id: string
  name: string
  position: Position
  subPosition: SubPosition
  birthYear: number
  currentClub: string
  /** User-typed name not in the built-in pool. */
  isCustom?: boolean
}

export interface PitchSlot {
  id: string
  label: string
  subPositions: SubPosition[]
}

export interface SquadState {
  selectedIds: string[]
  startingXI: Record<string, string | null>
  formation: Formation
  captainId: string | null
  /** Typed-in players keyed by id (`custom:…`). */
  customPlayers?: Record<string, Player>
}

export interface SquadValidation {
  isComplete: boolean
  totalCount: number
  gkCount: number
  needsMoreGk: number
  isFull: boolean
  hasCaptain: boolean
  messages: string[]
}

export const WC_YEAR = 2030
export const MAX_SQUAD_SIZE = 26
export const MIN_GOALKEEPERS = 3
export const MAX_GOALKEEPERS = 3

export function getAgeIn2030(birthYear: number): number {
  return WC_YEAR - birthYear
}
