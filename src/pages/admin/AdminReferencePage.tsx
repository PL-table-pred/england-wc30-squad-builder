import { Link } from 'react-router-dom'
import { AdminReferenceSquad } from '../../components/AdminReferenceSquad'
import { useSquad } from '../../hooks/useSquad'

export function AdminReferencePage() {
  const squad = useSquad()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Reference squad</h2>
        <p className="mt-1 text-sm text-slate-500">
          Publish the official answer key for leaderboard scoring. Your squad is saved in this
          browser — build it on the{' '}
          <Link to="/#builder" className="font-semibold text-england-red hover:underline">
            squad builder
          </Link>{' '}
          first if needed.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Current squad: {squad.validation.totalCount}/26 players
          {squad.validation.hasCaptain ? ' · Captain selected' : ' · No captain yet'}
        </p>
      </div>

      <AdminReferenceSquad squad={squad} embedded />
    </div>
  )
}
