import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BlogBody } from '../components/BlogBody'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { useAuth } from '../contexts/AuthContext'
import { useSiteFeatures } from '../contexts/SiteFeaturesContext'
import { fetchPublishedBlogPost, formatBlogDate } from '../lib/blog'
import type { BlogPost } from '../types/blog'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAdmin } = useAuth()
  const { settings, loading: settingsLoading } = useSiteFeatures()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const blogDisabled = !settingsLoading && !settings.blog_enabled && !isAdmin

  useEffect(() => {
    if (!slug || blogDisabled) {
      setLoading(false)
      return
    }
    void (async () => {
      setLoading(true)
      setPost(await fetchPublishedBlogPost(slug))
      setLoading(false)
    })()
  }, [slug, blogDisabled])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link to="/blog" className="text-sm font-semibold text-england-red hover:underline">
          ← All posts
        </Link>

        {blogDisabled ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">The blog is not available right now.</p>
          </div>
        ) : loading ? (
          <p className="mt-8 text-sm text-slate-400">Loading…</p>
        ) : !post ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-england-navy">Post not found</h1>
            <p className="mt-2 text-sm text-slate-500">This article may have been removed or is not published.</p>
          </div>
        ) : (
          <article className="mt-6">
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt=""
                className="mb-6 w-full rounded-xl object-cover shadow-sm"
                style={{ maxHeight: '320px' }}
              />
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatBlogDate(post.published_at)}
              {post.author_label && ` · ${post.author_label}`}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-england-navy sm:text-4xl">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <BlogBody content={post.body} />
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
