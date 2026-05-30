import { getSupabase, isSupabaseConfigured, type SquadPredictionRow } from './supabase'

export async function fetchLeaderboard(limit = 20): Promise<SquadPredictionRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('squad_predictions')
    .select('id, squad_param, view_count, created_at')
    .order('view_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Leaderboard fetch failed:', error.message)
    return []
  }

  return data ?? []
}

export async function submitSquadPrediction(squadParam: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Leaderboard is not configured.' }
  }

  const { error } = await supabase.rpc('submit_squad_prediction', {
    p_squad_param: squadParam,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function incrementSquadViews(squadParam: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const { error } = await supabase.rpc('increment_squad_views', {
    p_squad_param: squadParam,
  })

  if (error) {
    console.error('View increment failed:', error.message)
  }
}

export function trackSquadViewFromUrl(): void {
  if (!isSupabaseConfigured()) return

  const params = new URLSearchParams(window.location.search)
  const squadParam = params.get('s')
  if (!squadParam) return

  const sessionKey = `squad-viewed:${squadParam.slice(0, 64)}`
  if (sessionStorage.getItem(sessionKey)) return
  sessionStorage.setItem(sessionKey, '1')

  void incrementSquadViews(squadParam)
}
