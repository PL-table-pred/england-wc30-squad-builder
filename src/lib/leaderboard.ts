import { decodeSquadFromUrl } from '../utils/shareSquad'
import { calculateSquadScore } from '../utils/squadScore'
import {
  getSupabase,
  isSupabaseConfigured,
  type LeaderboardEntry,
  type ReferenceSquadRow,
  type SquadPredictionRow,
} from './supabase'

export async function fetchReferenceSquad(): Promise<ReferenceSquadRow | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('reference_squad')
    .select('id, squad_param, label, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('Reference squad fetch failed:', error.message)
    return null
  }

  return data
}

export async function fetchAllPredictions(): Promise<SquadPredictionRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('squad_predictions')
    .select('id, squad_param, view_count, created_at, is_bot, bot_name')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Predictions fetch failed:', error.message)
    return []
  }

  return data ?? []
}

export async function fetchLeaderboard(limit = 20): Promise<{
  entries: LeaderboardEntry[]
  reference: ReferenceSquadRow | null
}> {
  const reference = await fetchReferenceSquad()
  const predictions = await fetchAllPredictions()

  if (!reference) {
    return { entries: [], reference: null }
  }

  const referenceState = decodeSquadFromUrl(reference.squad_param)
  if (!referenceState) {
    return { entries: [], reference }
  }

  const entries: LeaderboardEntry[] = []

  for (const row of predictions) {
    const predictionState = decodeSquadFromUrl(row.squad_param)
    if (!predictionState) continue

    entries.push({
      ...row,
      score: calculateSquadScore(predictionState, referenceState),
    })
  }

  entries.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return { entries: entries.slice(0, limit), reference }
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

export async function setReferenceSquad(
  squadParam: string,
  adminSecret?: string,
  label?: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { error } = await supabase.rpc('set_reference_squad', {
    p_squad_param: squadParam,
    p_admin_secret: adminSecret ?? null,
    p_label: label ?? null,
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

