import { useCallback, useEffect, useState } from 'react'
import { fetchAdminUsers, setUserRole, type AdminProfileRow } from '../../lib/admin'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types/profile'

function audienceLabel(row: AdminProfileRow): string {
  if (row.audience_type === 'journalist') {
    return row.publication ? `Journalist · ${row.publication}` : 'Journalist'
  }
  if (row.audience_type === 'fan') return 'Fan'
  return '—'
}

export function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const rows = await fetchAdminUsers()
    setUsers(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function toggleAdmin(target: AdminProfileRow) {
    const nextRole: UserRole = target.role === 'admin' ? 'user' : 'admin'
    if (target.id === user?.id && nextRole === 'user') {
      setStatus('You cannot remove your own admin role here.')
      return
    }

    const result = await setUserRole(target.id, nextRole)
    if (!result.ok) {
      setStatus(result.error ?? 'Failed to update role.')
      return
    }

    setStatus(
      nextRole === 'admin'
        ? `${target.display_name ?? target.email} is now an admin.`
        : `Removed admin from ${target.display_name ?? target.email}.`,
    )
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Users &amp; admins</h2>
        <p className="mt-1 text-sm text-slate-500">
          View registered users, fan vs journalist signups, and promote admins.
        </p>
      </div>

      {status && (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {status}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-400">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium text-england-navy">
                      {row.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.email ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{audienceLabel(row)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.role === 'admin'
                            ? 'rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800'
                            : 'text-slate-500'
                        }
                      >
                        {row.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void toggleAdmin(row)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-england-navy hover:bg-slate-50"
                      >
                        {row.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
