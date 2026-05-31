import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteBlogPost, fetchAdminBlogPosts, upsertBlogPost } from '../../lib/blogAdmin'
import { setSiteFeatures } from '../../lib/admin'
import { useSiteFeatures } from '../../contexts/SiteFeaturesContext'
import { formatBlogDate } from '../../lib/blog'
import type { BlogPost } from '../../types/blog'
import { isValidBlogSlug, slugifyTitle } from '../../utils/blogSlug'

type EditorMode = 'list' | 'edit'

const emptyDraft = () => ({
  id: null as string | null,
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  author_label: '',
  cover_image_url: '',
  published: false,
  slugTouched: false,
})

export function AdminBlogPage() {
  const { settings, refresh } = useSiteFeatures()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [mode, setMode] = useState<EditorMode>('list')
  const [draft, setDraft] = useState(emptyDraft)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [blogEnabled, setBlogEnabled] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const rows = await fetchAdminBlogPosts()
    setPosts(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    setBlogEnabled(settings.blog_enabled)
    void load()
  }, [load, settings.blog_enabled])

  function openNew() {
    setDraft(emptyDraft())
    setMode('edit')
    setMessage(null)
  }

  function openEdit(post: BlogPost) {
    setDraft({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      author_label: post.author_label ?? '',
      cover_image_url: post.cover_image_url ?? '',
      published: post.published,
      slugTouched: true,
    })
    setMode('edit')
    setMessage(null)
  }

  function updateTitle(title: string) {
    setDraft((d) => ({
      ...d,
      title,
      slug: d.slugTouched ? d.slug : slugifyTitle(title),
    }))
  }

  async function saveBlogEnabled(enabled: boolean) {
    setBusy(true)
    setMessage(null)
    const result = await setSiteFeatures({
      youthU21Enabled: settings.youth_u21_enabled,
      youthU18Enabled: settings.youth_u18_enabled,
      statsPageEnabled: settings.stats_page_enabled,
      blogEnabled: enabled,
    })
    setBusy(false)
    if (!result.ok) {
      setMessage(result.error ?? 'Failed to update blog visibility.')
      return
    }
    setBlogEnabled(enabled)
    await refresh()
    setMessage(enabled ? 'Blog section is now public.' : 'Blog section is hidden from the site.')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValidBlogSlug(draft.slug)) {
      setMessage('Slug must be lowercase letters, numbers, and hyphens only.')
      return
    }

    setBusy(true)
    setMessage(null)
    const result = await upsertBlogPost({
      id: draft.id,
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body,
      author_label: draft.author_label,
      cover_image_url: draft.cover_image_url,
      published: draft.published,
    })
    setBusy(false)

    if (!result.ok) {
      setMessage(result.error ?? 'Failed to save post.')
      return
    }

    setMessage(draft.published ? 'Post published.' : 'Draft saved.')
    setMode('list')
    await load()
  }

  async function handleDelete() {
    if (!draft.id) return
    if (!window.confirm('Delete this post permanently?')) return

    setBusy(true)
    const result = await deleteBlogPost(draft.id)
    setBusy(false)

    if (!result.ok) {
      setMessage(result.error ?? 'Delete failed.')
      return
    }

    setMessage('Post deleted.')
    setMode('list')
    await load()
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-england-navy">
              {draft.id ? 'Edit post' : 'New post'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Markdown-lite: ## headings, **bold**, [links](url).</p>
          </div>
          <button
            type="button"
            onClick={() => setMode('list')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
          >
            ← Back to list
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="blog-title" className="block text-sm font-semibold text-england-navy">
              Title
            </label>
            <input
              id="blog-title"
              required
              value={draft.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
            />
          </div>
          <div>
            <label htmlFor="blog-slug" className="block text-sm font-semibold text-england-navy">
              URL slug
            </label>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>/blog/</span>
              <input
                id="blog-slug"
                required
                value={draft.slug}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, slug: e.target.value, slugTouched: true }))
                }
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
              />
            </div>
          </div>
          <div>
            <label htmlFor="blog-excerpt" className="block text-sm font-semibold text-england-navy">
              Excerpt
            </label>
            <textarea
              id="blog-excerpt"
              rows={2}
              value={draft.excerpt}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
            />
          </div>
          <div>
            <label htmlFor="blog-body" className="block text-sm font-semibold text-england-navy">
              Body
            </label>
            <textarea
              id="blog-body"
              required
              rows={14}
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="blog-author" className="block text-sm font-semibold text-england-navy">
                Author label (optional)
              </label>
              <input
                id="blog-author"
                value={draft.author_label}
                onChange={(e) => setDraft((d) => ({ ...d, author_label: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
              />
            </div>
            <div>
              <label htmlFor="blog-cover" className="block text-sm font-semibold text-england-navy">
                Cover image URL (optional)
              </label>
              <input
                id="blog-cover"
                type="url"
                value={draft.cover_image_url}
                onChange={(e) => setDraft((d) => ({ ...d, cover_image_url: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
              />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-england-navy">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
              className="rounded border-slate-300 text-england-red focus:ring-england-red"
            />
            Published (visible on /blog)
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-england-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save post'}
            </button>
            {draft.id && draft.published && (
              <Link
                to={`/blog/${draft.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50"
              >
                Preview live
              </Link>
            )}
            {draft.id && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete()}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-england-navy">Blog</h2>
          <p className="mt-1 text-sm text-slate-500">
            Write posts for the public blog at{' '}
            <Link to="/blog" className="font-semibold text-england-red hover:underline">
              /blog
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-england-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          New post
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">Blog section visibility</h3>
        <p className="mt-1 text-sm text-slate-500">
          When off, /blog is hidden from navigation and shows an unavailable message (admins can still
          edit here).
        </p>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-semibold text-england-navy">
          <input
            type="checkbox"
            checked={blogEnabled}
            disabled={busy}
            onChange={(e) => void saveBlogEnabled(e.target.checked)}
            className="rounded border-slate-300 text-england-red focus:ring-england-red"
          />
          Blog enabled on site
        </label>
      </div>

      {message && (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No posts yet. Create your first article.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-england-navy">{post.title}</p>
                  <p className="text-xs text-slate-500">
                    /blog/{post.slug}
                    {' · '}
                    {post.published ? (
                      <span className="text-emerald-700">Published {formatBlogDate(post.published_at)}</span>
                    ) : (
                      <span className="text-amber-700">Draft</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {post.published && (
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-england-navy hover:bg-slate-50"
                    >
                      View
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-england-navy hover:bg-slate-200"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
