import { fetchContestSettings } from './admin'
import { getContactEmail as getEnvContactEmail } from './siteMeta'
import { isSupabaseConfigured } from './supabase'

/** Resolved contact email: database (admin) → env → default. */
export function resolveContactEmail(fromDatabase?: string | null): string {
  const trimmed = fromDatabase?.trim()
  if (trimmed) return trimmed
  return getEnvContactEmail()
}

export async function fetchPublicContactEmail(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return getEnvContactEmail()
  }
  const settings = await fetchContestSettings()
  return resolveContactEmail(settings.contact_email)
}
