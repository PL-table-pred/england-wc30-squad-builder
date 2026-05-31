import { getSupabase, isSupabaseConfigured } from './supabase'
import type { BlogPost } from '../types/blog'

export async function fetchPublishedBlogPosts(limit = 20): Promise<BlogPost[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase.rpc('list_published_blog_posts', { p_limit: limit })
  if (error) {
    console.error('Blog list fetch failed:', error.message)
    return []
  }

  return (data ?? []) as BlogPost[]
}

export async function fetchPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase()
  if (!supabase || !slug.trim()) return null

  const { data, error } = await supabase.rpc('get_published_blog_post', { p_slug: slug.trim() })
  if (error) {
    console.error('Blog post fetch failed:', error.message)
    return null
  }

  return (data as BlogPost | null) ?? null
}

export function formatBlogDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function isBlogConfigured(): boolean {
  return isSupabaseConfigured()
}
