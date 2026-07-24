/** Canonical app URL for auth redirects (email confirm, etc.). */
const PRODUCTION_APP_URL = 'https://lionxi.co'

export function getAppUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return PRODUCTION_APP_URL
    }
    return origin
  }

  return PRODUCTION_APP_URL
}

/** Email confirmation / magic-link target — always the public production site. */
export function getAuthCallbackUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  const base = (fromEnv || PRODUCTION_APP_URL).replace(/\/$/, '')
  return `${base}/auth/callback`
}
