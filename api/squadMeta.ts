/** Squad decode + labels for Vercel edge (no browser APIs). */

export interface SharedCustomPlayer {
  i: string
  n: string
  p: string
  sp: string
}

export interface SharedSquadPayload {
  f: string
  s: string[]
  xi: Record<string, string | null>
  c: string | null
  cp?: SharedCustomPlayer[]
}

export interface SquadShareMeta {
  formation: string
  playerCount: number
  captainLabel: string | null
  starterLabels: string[]
}

function decodeBase64Json(encoded: string): string {
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return decodeURIComponent(
    Array.from(bytes)
      .map((b) => `%${b.toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

export function decodeSquadParam(encoded: string): SquadShareMeta | null {
  try {
    const json = decodeBase64Json(encoded)
    const payload = JSON.parse(json) as SharedSquadPayload
    if (!payload.f || !Array.isArray(payload.s)) return null

    const customById = new Map<string, string>()
    for (const row of payload.cp ?? []) {
      if (row?.i && row.n) customById.set(row.i, row.n.trim())
    }

    const captainLabel = payload.c ? labelForId(payload.c, customById) : null

    const starterIds = Object.values(payload.xi ?? {}).filter(
      (id): id is string => typeof id === 'string' && id.length > 0,
    )

    const starterLabels = starterIds.slice(0, 11).map((id) => labelForId(id, customById))

    return {
      formation: payload.f,
      playerCount: payload.s.length,
      captainLabel,
      starterLabels,
    }
  } catch {
    return null
  }
}

function labelForId(id: string, customById: Map<string, string>): string {
  if (customById.has(id)) return customById.get(id)!
  if (id.startsWith('custom:')) return 'Custom pick'
  const slug = id.split('-').pop() ?? id
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
