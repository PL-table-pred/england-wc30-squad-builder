import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SquadScoreBreakdown } from '../utils/squadScore'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && url !== 'https://your-project.supabase.co')
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

export interface SquadPredictionRow {
  id: string
  squad_param: string
  view_count: number
  created_at: string
  is_bot?: boolean
  bot_name?: string | null
}

export interface QaBotRow extends SquadPredictionRow {
  is_bot: true
  bot_name: string
}

export interface ReferenceSquadRow {
  id: number
  squad_param: string
  label: string | null
  updated_at: string
}

export interface LeaderboardEntry extends SquadPredictionRow {
  score: SquadScoreBreakdown
}
