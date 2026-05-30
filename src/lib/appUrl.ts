/** Canonical app URL for auth redirects (email confirm, etc.). */
const PRODUCTION_APP_URL = 'https://england-wc30-squad-builder.vercel.app'

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

export function getAuthCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`
}
