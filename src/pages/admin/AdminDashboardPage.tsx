import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminNavGrid } from '../../components/admin/AdminNavGrid'
import { AdminStatusCard } from '../../components/admin/AdminStatusCard'
import { fetchContestSettings } from '../../lib/admin'
import { fetchAllPredictions, fetchReferenceSquad } from '../../lib/leaderboard'
import { fetchQaBots } from '../../lib/qaBots'

export function AdminDashboardPage() {
  const [referenceSet, setReferenceSet] = useState(false)
  const [submissionsLocked, setSubmissionsLocked] = useState(false)
  const [predictionCount, setPredictionCount] = useState(0)
  const [botCount, setBotCount] = useState(0)

  useEffect(() => {
    void (async () => {
      const [reference, settings, predictions, bots] = await Promise.all([
        fetchReferenceSquad(),
        fetchContestSettings(),
        fetchAllPredictions(),
        fetchQaBots(),
      ])
      setReferenceSet(Boolean(reference))
      setSubmissionsLocked(settings.submissions_locked)
      setPredictionCount(predictions.length)
      setBotCount(bots.length)
    })()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Admin dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the England WC &apos;30 squad builder contest, reference squad, and community
          submissions.
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
          label="Predictions"
          value={String(predictionCount)}
          hint="Total leaderboard entries"
        />
        <AdminStatusCard
          label="QA bots"
          value={String(botCount)}
          hint="Seeded test entries"
        />
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
