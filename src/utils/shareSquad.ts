import type { Formation, SquadState } from '../types/player'

export interface SharedSquadPayload {
  f: Formation
  s: string[]
  xi: Record<string, string | null>
  c: string | null
}

export function encodeSquadToUrl(state: SquadState): string {
  const payload: SharedSquadPayload = {
    f: state.formation,
    s: state.selectedIds,
    xi: state.startingXI,
    c: state.captainId,
  }
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json)))
}

export function decodeSquadFromUrl(encoded: string): SquadState | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)))
    const payload = JSON.parse(json) as SharedSquadPayload
    if (!payload.f || !Array.isArray(payload.s)) return null
    return {
      formation: payload.f,
      selectedIds: payload.s,
      startingXI: payload.xi ?? {},
      captainId: payload.c ?? null,
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
