import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminNavGrid } from '../../components/admin/AdminNavGrid'
import { AdminStatusCard } from '../../components/admin/AdminStatusCard'
import { fetchContestSettings } from '../../lib/admin'
import { fetchAllPredictions, fetchReferenceSquad } from '../../lib/leaderboard'
import { countPlayersByTier, normalizeSiteSettings } from '../../lib/playerPool'
import { fetchQaBots } from '../../lib/qaBots'
import { fetchAdminBlogPosts } from '../../lib/blogAdmin'

export function AdminDashboardPage() {
  const [referenceSet, setReferenceSet] = useState(false)
  const [submissionsLocked, setSubmissionsLocked] = useState(false)
  const [predictionCount, setPredictionCount] = useState(0)
  const [botCount, setBotCount] = useState(0)
  const [contactConfigured, setContactConfigured] = useState(false)
  const [u21Enabled, setU21Enabled] = useState(true)
  const [u18Enabled, setU18Enabled] = useState(true)
  const [statsEnabled, setStatsEnabled] = useState(true)
  const [blogEnabled, setBlogEnabled] = useState(true)
  const [publishedPosts, setPublishedPosts] = useState(0)
  const [visiblePool, setVisiblePool] = useState(0)

  useEffect(() => {
    void (async () => {
      const [reference, settingsRaw, predictions, bots, blogPosts] = await Promise.all([
        fetchReferenceSquad(),
        fetchContestSettings(),
        fetchAllPredictions(),
        fetchQaBots(),
        fetchAdminBlogPosts(),
      ])
      const settings = normalizeSiteSettings(settingsRaw)
      const tierCounts = countPlayersByTier(settings)
      setReferenceSet(Boolean(reference))
      setSubmissionsLocked(settings.submissions_locked)
      setContactConfigured(Boolean(settings.contact_email?.trim()))
      setU21Enabled(settings.youth_u21_enabled)
      setU18Enabled(settings.youth_u18_enabled)
      setStatsEnabled(settings.stats_page_enabled)
      setBlogEnabled(settings.blog_enabled)
      setPublishedPosts(blogPosts.filter((p) => p.published).length)
      setVisiblePool(tierCounts.senior.visible + tierCounts.u21.visible + tierCounts.u18.visible)
      setPredictionCount(predictions.length)
      setBotCount(bots.length)
    })()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Admin dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the squad builder, player pool, community stats, and contest settings.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatusCard
          label="Reference squad"
          value={referenceSet ? 'Published' : 'Not set'}
          hint={referenceSet ? 'Leaderboard scoring active' : 'Publish answer key'}
          variant={referenceSet ? 'success' : 'warning'}
        />
        <AdminStatusCard
          label="Submissions"
          value={submissionsLocked ? 'Locked' : 'Open'}
          hint={submissionsLocked ? 'Users cannot post new squads' : 'Community can submit'}
          variant={submissionsLocked ? 'warning' : 'success'}
        />
        <AdminStatusCard
          label="Player pool"
          value={String(visiblePool)}
          hint="Players visible in picker"
        />
        <AdminStatusCard
          label="Most picked"
          value={statsEnabled ? 'Live' : 'Hidden'}
          hint={statsEnabled ? '/stats is public' : 'Stats page disabled'}
          variant={statsEnabled ? 'success' : 'warning'}
        />
        <AdminStatusCard
          label="Blog"
          value={blogEnabled ? `${publishedPosts} live` : 'Hidden'}
          hint={blogEnabled ? 'Public /blog section' : 'Blog disabled'}
          variant={blogEnabled ? 'success' : 'warning'}
        />
        <AdminStatusCard
          label="U21 pool"
          value={u21Enabled ? 'On' : 'Off'}
          hint="England U21 call-ups"
          variant={u21Enabled ? 'success' : 'warning'}
        />
        <AdminStatusCard
          label="U18 pool"
          value={u18Enabled ? 'On' : 'Off'}
          hint="England U18 call-ups"
          variant={u18Enabled ? 'success' : 'warning'}
        />
        <AdminStatusCard
          label="Predictions"
          value={String(predictionCount)}
          hint="Total leaderboard entries"
        />
        <AdminStatusCard
          label="QA bots"
          value={String(botCount)}
          hint="Seeded test entries"
        />
        <AdminStatusCard
          label="Contact email"
          value={contactConfigured ? 'Set' : 'Default'}
          hint={contactConfigured ? 'Shown on legal pages' : 'Set in Site & contest settings'}
          variant={contactConfigured ? 'success' : 'warning'}
        />
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
        <h3 className="font-semibold text-violet-900">New features</h3>
        <p className="mt-1 text-sm text-violet-800/90">
          Control youth squads, stats visibility, and individual players from one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/admin/blog"
            className="rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Manage blog
          </Link>
          <Link
            to="/admin/players"
            className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-england-navy hover:bg-violet-100"
          >
            Player pool
          </Link>
          <Link
            to="/admin/settings"
            className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-england-navy hover:bg-violet-100"
          >
            Site &amp; legal settings
          </Link>
          {statsEnabled && (
            <Link
              to="/stats"
              className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-england-navy hover:bg-violet-100"
            >
              View most picked
            </Link>
          )}
        </div>
      </div>

      {!referenceSet && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">Reference squad not published</h3>
          <p className="mt-1 text-sm text-amber-800/90">
            Build your answer-key squad on the homepage, then publish it from the reference squad
            admin page.
          </p>
          <Link
            to="/admin/reference"
            className="mt-4 inline-block rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to reference squad
          </Link>
        </div>
      )}

      <AdminNavGrid />
    </div>
  )
}
