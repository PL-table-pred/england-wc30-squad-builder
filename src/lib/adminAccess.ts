const ADMIN_UNLOCK_KEY = 'england-wc30-admin-unlocked'
const ADMIN_SECRET_KEY = 'england-wc30-admin-secret'

export function isAdminMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('admin') === '1' || hasAdminSecretSession()
}

export function hasAdminSecretSession(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_UNLOCK_KEY) === '1'
}

export function getStoredAdminSecret(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem(ADMIN_SECRET_KEY) ?? ''
}

export function saveAdminSecretSession(secret: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(ADMIN_SECRET_KEY, secret)
  sessionStorage.setItem(ADMIN_UNLOCK_KEY, '1')
}

export function clearAdminSecretSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(ADMIN_SECRET_KEY)
  sessionStorage.removeItem(ADMIN_UNLOCK_KEY)
}

/** Admin UI + RPCs: logged-in admin role OR valid secret session (?admin=1 flow). */
export function canUseAdminTools(isProfileAdmin: boolean): boolean {
  return isProfileAdmin || hasAdminSecretSession()
}

/** Secret passed to admin RPCs (profile admins omit the secret). */
export function resolveAdminSecret(typedSecret?: string): string | undefined {
  const trimmed = typedSecret?.trim()
  if (trimmed) return trimmed
  const stored = getStoredAdminSecret()
  return stored || undefined
}
