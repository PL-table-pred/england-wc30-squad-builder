import { getAppUrl } from './appUrl'

/** Public contact address for AdSense / legal pages (override via VITE_CONTACT_EMAIL). */
export function getContactEmail(): string {
  const fromEnv = import.meta.env.VITE_CONTACT_EMAIL?.trim()
  if (fromEnv) return fromEnv
  return 'contact@lionxi.co'
}

export function getSiteOrigin(): string {
  return getAppUrl()
}
