import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { useAuth } from '../contexts/AuthContext'
import { useSiteFeatures } from '../contexts/SiteFeaturesContext'
import { fetchPublishedBlogPosts, formatBlogDate, isBlogConfigured } from '../lib/blog'
import type { BlogPost } from '../types/blog'

export function BlogListPage() {
  const { isAdmin } = useAuth()
  const { settings, loading: settingsLoading } = useSiteFeatures()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const configured = isBlogConfigured()
  const blogDisabled = !settingsLoading && !settings.blog_enabled && !isAdmin

  useEffect(() => {
    if (blogDisabled) {
      setLoading(false)
      return
    }
    void (async () => {
      setLoading(true)
      setPosts(await fetchPublishedBlogPosts())
      setLoading(false)
    })()
  }, [blogDisabled])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {blogDisabled ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-england-navy">Blog</h1>
            <p className="mt-3 text-slate-600">The blog is not available right now.</p>
            <Link to="/" className="mt-6 inline-block font-semibold text-england-red hover:underline">
              Back to squad builder
            </Link>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-england-red">News</p>
              <h1 className="mt-1 text-3xl font-extrabold text-england-navy sm:text-4xl">Blog</h1>
              <p className="mt-2 text-slate-600">
                England WC &apos;30 squad builder updates, fan analysis, and youth call-up notes.
              </p>
            </header>

            {!configured ? (
              <p className="text-sm text-slate-500">Blog requires Supabase configuration.</p>
            ) : loading ? (
              <p className="text-sm text-slate-400">Loading posts…</p>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-slate-600">No posts published yet. Check back soon.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li key={post.id}>
                    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-england-red/30">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {formatBlogDate(post.published_at)}
                        {post.author_label && ` · ${post.author_label}`}
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-england-navy">
                        <Link to={`/blog/${post.slug}`} className="hover:text-england-red">
                          {post.title}
                        </Link>
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
                      )}
                      <Link
                        to={`/blog/${post.slug}`}
                        className="mt-4 inline-block text-sm font-semibold text-england-red hover:underline"
                      >
                        Read more →
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
