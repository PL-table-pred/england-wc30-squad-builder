import { getStoredAdminSecret } from './adminAccess'
import { getSupabase } from './supabase'
import type { AudienceType, UserRole } from '../types/profile'

export interface AdminProfileRow {
  id: string
  email: string | null
  display_name: string | null
  role: UserRole
  audience_type: AudienceType | null
  publication: string | null
  created_at: string
}

export interface SiteSettings {
  submissions_locked: boolean
  contact_email?: string | null
  youth_u21_enabled: boolean
  youth_u18_enabled: boolean
  stats_page_enabled: boolean
  disabled_player_ids: string[]
}

/** @deprecated Use SiteSettings */
export type ContestSettings = SiteSettings

export async function fetchContestSettings(): Promise<SiteSettings> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      submissions_locked: false,
      youth_u21_enabled: true,
      youth_u18_enabled: true,
      stats_page_enabled: true,
      disabled_player_ids: [],
    }
  }

  const { data, error } = await supabase.rpc('get_contest_settings')
  if (error) {
    console.error('Contest settings fetch failed:', error.message)
    return {
      submissions_locked: false,
      youth_u21_enabled: true,
      youth_u18_enabled: true,
      stats_page_enabled: true,
      disabled_player_ids: [],
    }
  }

  const settings = data as SiteSettings
  const disabled = settings.disabled_player_ids
  return {
    submissions_locked: settings.submissions_locked ?? false,
    contact_email: settings.contact_email ?? null,
    youth_u21_enabled: settings.youth_u21_enabled ?? true,
    youth_u18_enabled: settings.youth_u18_enabled ?? true,
    stats_page_enabled: settings.stats_page_enabled ?? true,
    disabled_player_ids: Array.isArray(disabled) ? disabled : [],
  }
}

export async function setContestSettings(
  submissionsLocked: boolean,
  adminSecret?: string,
): Promise<{ ok: boolean; settings?: SiteSettings; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('set_contest_settings', {
    p_submissions_locked: submissionsLocked,
    p_admin_secret: adminSecret ?? (getStoredAdminSecret() || null),
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, settings: data as SiteSettings }
}

export async function setSiteFeatures(
  features: {
    youthU21Enabled: boolean
    youthU18Enabled: boolean
    statsPageEnabled: boolean
  },
  adminSecret?: string,
): Promise<{ ok: boolean; settings?: SiteSettings; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('set_site_features', {
    p_youth_u21_enabled: features.youthU21Enabled,
    p_youth_u18_enabled: features.youthU18Enabled,
    p_stats_page_enabled: features.statsPageEnabled,
    p_admin_secret: adminSecret ?? (getStoredAdminSecret() || null),
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, settings: data as SiteSettings }
}

export async function setDisabledPlayerIds(
  playerIds: string[],
  adminSecret?: string,
): Promise<{ ok: boolean; settings?: SiteSettings; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('set_disabled_player_ids', {
    p_player_ids: playerIds,
    p_admin_secret: adminSecret ?? (getStoredAdminSecret() || null),
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, settings: data as SiteSettings }
}

export async function setContactEmail(
  contactEmail: string,
  adminSecret?: string,
): Promise<{ ok: boolean; settings?: SiteSettings; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('set_contact_email', {
    p_contact_email: contactEmail.trim(),
    p_admin_secret: adminSecret ?? (getStoredAdminSecret() || null),
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, settings: data as SiteSettings }
}

export async function fetchAdminUsers(): Promise<AdminProfileRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase.rpc('admin_list_profiles')
  if (error) {
    console.error('Admin users fetch failed:', error.message)
    return []
  }

  return (data ?? []) as AdminProfileRow[]
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('admin_set_user_role', {
    p_user_id: userId,
    p_role: role,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data) {
    return { ok: false, error: 'User not found.' }
  }

  return { ok: true }
}

export async function deletePrediction(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('admin_delete_prediction', { p_id: id })
  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data) {
    return { ok: false, error: 'Prediction not found.' }
  }

  return { ok: true }
}
