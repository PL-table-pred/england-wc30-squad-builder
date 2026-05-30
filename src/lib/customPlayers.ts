import { PLAYERS, PLAYERS_BY_ID } from '../data/players'
import type { Player, Position, SquadState, SubPosition } from '../types/player'

export const CUSTOM_PLAYER_PREFIX = 'custom:'

export const CUSTOM_PLAYER_SPELLING_TIP =
  'Spell their name exactly as on the official squad list. If the spelling is wrong, they will not count toward your score.'

export function isCustomPlayerId(id: string): boolean {
  return id.startsWith(CUSTOM_PLAYER_PREFIX)
}

export function normalizePlayerName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[''`]/g, '')
    .replace(/\s+/g, ' ')
}

export function createCustomPlayer(
  name: string,
  position: Position,
  subPosition: SubPosition,
): Player {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  return {
    id: `${CUSTOM_PLAYER_PREFIX}${crypto.randomUUID()}`,
    name: trimmed,
    position,
    subPosition,
    birthYear: 2000,
    currentClub: '',
    isCustom: true,
  }
}

export function resolveSquadPlayer(
  id: string,
  customPlayers: Record<string, Player> = {},
): Player | undefined {
  return PLAYERS_BY_ID[id] ?? customPlayers[id]
}

export function playersFromSquadState(state: SquadState): Player[] {
  const custom = state.customPlayers ?? {}
  return state.selectedIds
    .map((id) => resolveSquadPlayer(id, custom))
    .filter((player): player is Player => Boolean(player))
}

export function squadPlayerIdentity(id: string, customPlayers: Record<string, Player> = {}): string {
  const player = resolveSquadPlayer(id, customPlayers)
  if (!player) return id
  if (!player.isCustom) return player.id
  return `name:${normalizePlayerName(player.name)}`
}

export function findCatalogPlayerByName(name: string): Player | undefined {
  const target = normalizePlayerName(name)
  if (!target) return undefined
  return PLAYERS.find((player) => normalizePlayerName(player.name) === target)
}

export function defaultSubPositionForPosition(position: Position): SubPosition {
  switch (position) {
    case 'GK':
      return 'GK'
    case 'DEF':
      return 'CB'
    case 'MID':
      return 'CM'
    case 'FWD':
      return 'ST'
  }
}

export function positionFromSubPosition(sub: SubPosition): Position {
  if (sub === 'GK') return 'GK'
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(sub)) return 'DEF'
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(sub)) return 'MID'
  return 'FWD'
}

export function inferPositionForSlot(slotSubPositions?: SubPosition[]): Position {
  if (!slotSubPositions?.length) return 'MID'
  return positionFromSubPosition(slotSubPositions[0])
}

export function formatSquadSummaryLine(state: SquadState): string {
  const captain = state.captainId
    ? resolveSquadPlayer(state.captainId, state.customPlayers ?? {})?.name
    : null
  return `${state.formation} · ${state.selectedIds.length}/26${captain ? ` · C: ${captain.split(' ').pop()}` : ''}`
}
