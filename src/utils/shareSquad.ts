import type { Formation, Player, SquadState } from '../types/player'
import { isCustomPlayerId } from '../lib/customPlayers'

export interface SharedCustomPlayer {
  i: string
  n: string
  p: Player['position']
  sp: Player['subPosition']
}

export interface SharedSquadPayload {
  f: Formation
  s: string[]
  xi: Record<string, string | null>
  c: string | null
  cp?: SharedCustomPlayer[]
}

export function encodeSquadToUrl(state: SquadState): string {
  const custom = state.customPlayers ?? {}
  const cp: SharedCustomPlayer[] = state.selectedIds
    .filter(isCustomPlayerId)
    .map((id) => {
      const player = custom[id]
      if (!player) return null
      return { i: id, n: player.name, p: player.position, sp: player.subPosition }
    })
    .filter((row): row is SharedCustomPlayer => row !== null)

  const payload: SharedSquadPayload = {
    f: state.formation,
    s: state.selectedIds,
    xi: state.startingXI,
    c: state.captainId,
    ...(cp.length > 0 ? { cp } : {}),
  }
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json)))
}

export function decodeSquadFromUrl(encoded: string): SquadState | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)))
    const payload = JSON.parse(json) as SharedSquadPayload
    if (!payload.f || !Array.isArray(payload.s)) return null

    const customPlayers: Record<string, Player> = {}
    for (const row of payload.cp ?? []) {
      if (!row?.i || !row.n) continue
      customPlayers[row.i] = {
        id: row.i,
        name: row.n.trim(),
        position: row.p,
        subPosition: row.sp,
        birthYear: 2000,
        currentClub: '',
        isCustom: true,
      }
    }

    return {
      formation: payload.f,
      selectedIds: payload.s,
      startingXI: payload.xi ?? {},
      captainId: payload.c ?? null,
      ...(Object.keys(customPlayers).length > 0 ? { customPlayers } : {}),
    }
  } catch {
    return null
  }
}

export function buildShareUrl(state: SquadState): string {
  const encoded = encodeSquadToUrl(state)
  const url = new URL(window.location.href)
  url.searchParams.set('s', encoded)
  return url.toString()
}

export function readSquadFromLocation(): SquadState | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('s')
  if (!encoded) return null
  return decodeSquadFromUrl(encoded)
}

export function clearShareParam(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('s')
  window.history.replaceState({}, '', url.toString())
}
