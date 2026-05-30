import { generateBotSquadParam } from './generateBotSquad'
import { filterPlayersBySettings } from './playerPool'
import { pickUniqueQaPersonas } from './qaDisplayNames'
import { fetchPublicSiteSettings } from './siteSettings'
import { getSupabase, type QaBotRow } from './supabase'

export type SeedQaBotsResult = {
  created: number
  errors: string[]
  bots: { displayName: string; squadParam: string }[]
}

export async function fetchQaBots(): Promise<QaBotRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('squad_predictions')
    .select('id, squad_param, view_count, created_at, is_bot, bot_name')
    .eq('is_bot', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('QA bots fetch failed:', error.message)
    return []
  }

  return (data ?? []) as QaBotRow[]
}

export async function seedQaBots(
  count: number,
  adminSecret?: string,
): Promise<{ ok: boolean; result?: SeedQaBotsResult; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const safeCount = Math.min(50, Math.max(1, count))
  const personas = pickUniqueQaPersonas(safeCount)
  const settings = await fetchPublicSiteSettings()
  const pool = filterPlayersBySettings(settings)
  const payload = personas.map((persona) => ({
    bot_name: persona.displayName,
    squad_param: generateBotSquadParam(pool),
  }))

  const { data, error } = await supabase.rpc('seed_qa_bot_squads', {
    p_admin_secret: adminSecret ?? null,
    p_bots: payload,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  const result = data as { created: number; errors: string[] }
  return {
    ok: true,
    result: {
      created: result.created ?? 0,
      errors: result.errors ?? [],
      bots: payload.map((b, i) => ({
        displayName: personas[i].displayName,
        squadParam: b.squad_param,
      })),
    },
  }
}

export async function deleteAllQaBots(
  adminSecret?: string,
): Promise<{ ok: boolean; deleted?: number; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('delete_all_qa_bots', {
    p_admin_secret: adminSecret ?? null,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, deleted: data as number }
}

export async function updateQaBot(input: {
  id: string
  squadParam: string
  botName?: string
  adminSecret?: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('update_qa_bot', {
    p_id: input.id,
    p_squad_param: input.squadParam,
    p_bot_name: input.botName ?? null,
    p_admin_secret: input.adminSecret ?? null,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data) {
    return { ok: false, error: 'Bot not found.' }
  }

  return { ok: true }
}

export async function deleteQaBot(
  id: string,
  adminSecret?: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('delete_qa_bot', {
    p_id: id,
    p_admin_secret: adminSecret ?? null,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data) {
    return { ok: false, error: 'Bot not found or already deleted.' }
  }

  return { ok: true }
}
