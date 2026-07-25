import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { hasAdminSecretSession } from '../lib/adminAccess'
import { getAuthCallbackUrl } from '../lib/appUrl'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import type { AudienceType, UserRole } from '../types/profile'

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  role: UserRole
  audience_type: AudienceType | null
  publication: string | null
  created_at: string
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  isAdmin: boolean
  isProfileAdmin: boolean
  adminSecretUnlocked: boolean
  unlockAdminSecret: () => void
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (input: {
    email: string
    password: string
    displayName: string
    audienceType: AudienceType
    publication?: string
  }) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfileDetails: (input: {
    audienceType: AudienceType
    publication?: string | null
  }) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, audience_type, publication, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Profile fetch failed:', error.message)
    return null
  }

  if (!data) return null

  return {
    ...data,
    role: (data.role as UserRole) ?? 'user',
    audience_type: data.audience_type as AudienceType | null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [adminSecretUnlocked, setAdminSecretUnlocked] = useState(() => hasAdminSecretSession())
  const [loading, setLoading] = useState(configured)

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    const row = await fetchProfile(session.user.id)
    setProfile(row)
  }, [session?.user])

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      setSession(currentSession)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    void refreshProfile()
  }, [session?.user, refreshProfile])

  const isProfileAdmin = profile?.role === 'admin'
  const isAdmin = isProfileAdmin || adminSecretUnlocked

  const unlockAdminSecret = useCallback(() => {
    setAdminSecretUnlocked(true)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      return { error: 'Authentication is not configured.' }
    }

    const trimmedEmail = email.trim()
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    if (error) {
      const isInvalidCredentials =
        error.code === 'invalid_credentials' ||
        /invalid login credentials/i.test(error.message)

      if (isInvalidCredentials) {
        const { data: exists } = await supabase.rpc('account_exists_for_email', {
          p_email: trimmedEmail,
        })
        if (exists) {
          return { error: 'Wrong password. Try again, or use Forgot password.' }
        }
        return { error: 'No account found with that email. Create one to get started.' }
      }

      return { error: error.message }
    }

    return {}
  }, [])

  const signUp = useCallback(
    async ({
      email,
      password,
      displayName,
      audienceType,
      publication,
    }: {
      email: string
      password: string
      displayName: string
      audienceType: AudienceType
      publication?: string
    }) => {
      const supabase = getSupabase()
      if (!supabase) {
        return { error: 'Authentication is not configured.' }
      }

      const trimmedName = displayName.trim()
      const trimmedPublication =
        audienceType === 'journalist' ? publication?.trim() || null : null

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
          data: {
            display_name: trimmedName,
            full_name: trimmedName,
            audience_type: audienceType,
            publication: trimmedPublication,
          },
        },
      })

      if (error) {
        if (/already registered|already been registered|already exists/i.test(error.message)) {
          return {
            error: 'You already have an account with this email. Log in instead.',
          }
        }
        return { error: error.message }
      }

      // Already-registered emails return a user with empty identities and no session;
      // Supabase does not send another confirmation email in that case.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        return {
          error: 'You already have an account with this email. Log in instead.',
        }
      }

      if (data.user && data.session) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          display_name: trimmedName,
          audience_type: audienceType,
          publication: trimmedPublication,
        })
      }

      if (!data.session) {
        return { needsEmailConfirmation: true }
      }

      return {}
    },
    [],
  )

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      return { error: 'Authentication is not configured.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthCallbackUrl(),
    })
    if (error) {
      return { error: error.message }
    }

    return {}
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      return { error: 'Authentication is not configured.' }
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return { error: error.message }
    }

    return {}
  }, [])

  const updateProfileDetails = useCallback(
    async ({
      audienceType,
      publication,
    }: {
      audienceType: AudienceType
      publication?: string | null
    }) => {
      const supabase = getSupabase()
      if (!supabase || !session?.user) {
        return { error: 'Not signed in.' }
      }

      const trimmedPublication =
        audienceType === 'journalist' ? publication?.trim() || null : null

      const { error } = await supabase
        .from('profiles')
        .update({
          audience_type: audienceType,
          publication: trimmedPublication,
        })
        .eq('id', session.user.id)

      if (error) {
        return { error: error.message }
      }

      await refreshProfile()
      return {}
    },
    [session?.user, refreshProfile],
  )

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      isAdmin,
      isProfileAdmin,
      adminSecretUnlocked,
      unlockAdminSecret,
      loading,
      configured,
      signIn,
      signUp,
      resetPasswordForEmail,
      updatePassword,
      signOut,
      refreshProfile,
      updateProfileDetails,
    }),
    [
      session,
      profile,
      isAdmin,
      isProfileAdmin,
      adminSecretUnlocked,
      unlockAdminSecret,
      loading,
      configured,
      signIn,
      signUp,
      resetPasswordForEmail,
      updatePassword,
      signOut,
      refreshProfile,
      updateProfileDetails,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
