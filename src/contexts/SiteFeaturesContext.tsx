import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchContestSettings, type SiteSettings } from '../lib/admin'
import { DEFAULT_SITE_SETTINGS, filterPlayersBySettings, normalizeSiteSettings } from '../lib/playerPool'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Player } from '../types/player'

interface SiteFeaturesContextValue {
  settings: SiteSettings
  loading: boolean
  availablePlayers: Player[]
  refresh: () => Promise<void>
}

const SiteFeaturesContext = createContext<SiteFeaturesContextValue | null>(null)

export function SiteFeaturesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(isSupabaseConfigured())

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSettings(DEFAULT_SITE_SETTINGS)
      setLoading(false)
      return
    }
    setLoading(true)
    const raw = await fetchContestSettings()
    setSettings(normalizeSiteSettings(raw))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const availablePlayers = useMemo(() => filterPlayersBySettings(settings), [settings])

  const value = useMemo(
    () => ({ settings, loading, availablePlayers, refresh }),
    [settings, loading, availablePlayers, refresh],
  )

  return <SiteFeaturesContext.Provider value={value}>{children}</SiteFeaturesContext.Provider>
}

export function useSiteFeatures(): SiteFeaturesContextValue {
  const ctx = useContext(SiteFeaturesContext)
  if (!ctx) {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      loading: false,
      availablePlayers: filterPlayersBySettings(DEFAULT_SITE_SETTINGS),
      refresh: async () => undefined,
    }
  }
  return ctx
}
