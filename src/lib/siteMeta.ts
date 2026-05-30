import { getAppUrl } from './appUrl'

/** Public contact address for AdSense / legal pages (override via VITE_CONTACT_EMAIL). */
export function getContactEmail(): string {
  const fromEnv = import.meta.env.VITE_CONTACT_EMAIL?.trim()
  if (fromEnv) return fromEnv
  return 'contact@englandwc30.com'
}

export function getSiteOrigin(): string {
  return getAppUrl()
}
