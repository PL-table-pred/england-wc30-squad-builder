import { fetchContestSettings } from './admin'
import { normalizeSiteSettings } from './playerPool'
import { getContactEmail as getEnvContactEmail } from './siteMeta'
import { isSupabaseConfigured } from './supabase'

/** Resolved contact email: database (admin) → env → default. */
export function resolveContactEmail(fromDatabase?: string | null): string {
  const trimmed = fromDatabase?.trim()
  if (trimmed) return trimmed
  return getEnvContactEmail()
}

export async function fetchPublicSiteSettings() {
  if (!isSupabaseConfigured()) {
    return normalizeSiteSettings(null)
  }
  const settings = await fetchContestSettings()
  return normalizeSiteSettings(settings)
}

export async function fetchPublicContactEmail(): Promise<string> {
  const settings = await fetchPublicSiteSettings()
  return resolveContactEmail(settings.contact_email)
}
