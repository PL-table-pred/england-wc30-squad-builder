import { PLAYERS } from '../data/players'
import type { Player, PoolTier } from '../types/player'
import type { SiteSettings } from './admin'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  submissions_locked: false,
  contact_email: null,
  youth_u21_enabled: true,
  youth_u18_enabled: true,
  stats_page_enabled: true,
  disabled_player_ids: [],
}

export function normalizeSiteSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  const disabled = raw?.disabled_player_ids
  return {
    submissions_locked: raw?.submissions_locked ?? false,
    contact_email: raw?.contact_email ?? null,
    youth_u21_enabled: raw?.youth_u21_enabled ?? true,
    youth_u18_enabled: raw?.youth_u18_enabled ?? true,
    stats_page_enabled: raw?.stats_page_enabled ?? true,
    disabled_player_ids: Array.isArray(disabled) ? disabled.filter((id) => typeof id === 'string') : [],
  }
}

export function getPlayerPoolTier(player: Player): PoolTier {
  return player.poolTier ?? 'senior'
}

export function isPlayerVisibleInPool(player: Player, settings: SiteSettings): boolean {
  if (settings.disabled_player_ids.includes(player.id)) return false
  const tier = getPlayerPoolTier(player)
  if (tier === 'senior') return true
  if (tier === 'u21') return settings.youth_u21_enabled
  return settings.youth_u18_enabled
}

export function filterPlayersBySettings(settings: SiteSettings): Player[] {
  return PLAYERS.filter((player) => isPlayerVisibleInPool(player, settings))
}

export function countPlayersByTier(settings: SiteSettings): Record<PoolTier, { total: number; visible: number }> {
  const tiers: PoolTier[] = ['senior', 'u21', 'u18']
  const result = {} as Record<PoolTier, { total: number; visible: number }>
  for (const tier of tiers) {
    const inTier = PLAYERS.filter((p) => getPlayerPoolTier(p) === tier)
    result[tier] = {
      total: inTier.length,
      visible: inTier.filter((p) => isPlayerVisibleInPool(p, settings)).length,
    }
  }
  return result
}
