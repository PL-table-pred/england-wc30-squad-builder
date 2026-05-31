import { getStoredAdminSecret } from './adminAccess'
import { getSupabase } from './supabase'
import type { BlogPost, BlogPostInput } from '../types/blog'

function adminSecret(): string | null {
  return getStoredAdminSecret() || null
}

export async function fetchAdminBlogPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase.rpc('admin_list_blog_posts', {
    p_admin_secret: adminSecret(),
  })

  if (error) {
    console.error('Admin blog list failed:', error.message)
    return []
  }

  return (data ?? []) as BlogPost[]
}

export async function upsertBlogPost(
  input: BlogPostInput,
): Promise<{ ok: boolean; post?: BlogPost; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('admin_upsert_blog_post', {
    p_id: input.id ?? null,
    p_slug: input.slug,
    p_title: input.title,
    p_excerpt: input.excerpt,
    p_body: input.body,
    p_author_label: input.author_label || null,
    p_cover_image_url: input.cover_image_url || null,
    p_published: input.published,
    p_admin_secret: adminSecret(),
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, post: data as BlogPost }
}

export async function deleteBlogPost(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured.' }
  }

  const { data, error } = await supabase.rpc('admin_delete_blog_post', {
    p_id: id,
    p_admin_secret: adminSecret(),
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data) {
    return { ok: false, error: 'Post not found.' }
  }

  return { ok: true }
}
