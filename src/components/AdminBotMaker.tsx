import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { resolveAdminSecret } from '../lib/adminAccess'
import { PLAYERS } from '../data/players'
import { formatSquadSummaryLine } from '../lib/customPlayers'
import { decodeSquadFromUrl } from '../utils/shareSquad'
import { deleteAllQaBots, fetchQaBots, seedQaBots } from '../lib/qaBots'
import type { QaBotRow } from '../lib/supabase'
import { BotSquadEditor } from './admin/BotSquadEditor'

function botSummary(bot: QaBotRow): string {
  const state = decodeSquadFromUrl(bot.squad_param)
  if (!state) return 'Invalid squad'
  return formatSquadSummaryLine(state)
}

interface AdminBotMakerProps {
  onBotsChanged?: () => void
  embedded?: boolean
}

export function AdminBotMaker({ onBotsChanged, embedded = false }: AdminBotMakerProps) {
  const { isProfileAdmin } = useAuth()
  const [secret, setSecret] = useState('')
  const [createCount, setCreateCount] = useState(10)
  const [bots, setBots] = useState<QaBotRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const loadBots = useCallback(async () => {
    const rows = await fetchQaBots()
    setBots(rows)
    setSelectedId((current) => (current && rows.some((b) => b.id === current) ? current : null))
  }, [])

  useEffect(() => {
    void loadBots()
  }, [loadBots])

  const selectedBot = bots.find((b) => b.id === selectedId) ?? null

  function adminSecretArg(): string | undefined {
    return isProfileAdmin ? undefined : resolveAdminSecret(secret)
  }

  async function runAction(label: string, action: () => Promise<void>) {
    if (!isProfileAdmin && !resolveAdminSecret(secret)) {
      setStatus('Enter the admin secret first.')
      return
    }
    setBusy(true)
    setStatus(`${label}…`)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  function handleCreate() {
    void runAction('Creating bots', async () => {
      const result = await seedQaBots(createCount, adminSecretArg())
      if (!result.ok) {
        setStatus(result.error ?? 'Failed to create bots.')
        return
      }
      let msg = `Created ${result.result?.created ?? 0} bot(s).`
      const errors = result.result?.errors ?? []
      if (errors.length) {
        msg += ` Warnings: ${errors.join('; ')}`
      }
      setStatus(msg)
      await loadBots()
      onBotsChanged?.()
    })
  }

  function handleDeleteAll() {
    if (!window.confirm('Delete all QA bot predictions? This cannot be undone.')) return
    void runAction('Deleting all bots', async () => {
      const result = await deleteAllQaBots(adminSecretArg())
      if (!result.ok) {
        setStatus(result.error ?? 'Failed to delete bots.')
        return
      }
      setStatus(`Deleted ${result.deleted ?? 0} bot(s).`)
      setSelectedId(null)
      await loadBots()
      onBotsChanged?.()
    })
  }

  const wrapperClass = embedded
    ? 'space-y-4'
    : 'mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-sm'

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <>
          <h3 className="text-lg font-bold text-england-navy">Admin — QA bots</h3>
          <p className="mt-1 text-sm text-slate-600">
            Seed the leaderboard with realistic random squad predictions. Bots appear on the
            community leaderboard with generated display names.
          </p>
        </>
      )}

      {!isProfileAdmin && !resolveAdminSecret() && (
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase text-slate-400">Admin secret</span>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="From Supabase app_settings table"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
        </label>
      )}

      {status && (
        <p className="mt-3 whitespace-pre-wrap rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-700">
          {status}
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-violet-200 bg-white px-3 py-2">
          <p className="text-xs uppercase text-slate-400">Total bots</p>
          <p className="text-2xl font-bold text-england-navy">{bots.length}</p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-white px-3 py-2">
          <p className="text-xs uppercase text-slate-400">Player pool</p>
          <p className="text-sm font-semibold text-england-navy">Built-in ({PLAYERS.length} players)</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-violet-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-england-navy">Bulk actions</h4>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">
            Count
            <input
              type="number"
              min={1}
              max={50}
              value={createCount}
              onChange={(e) => setCreateCount(parseInt(e.target.value, 10) || 1)}
              className="ml-2 w-16 rounded border border-slate-200 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy}
            className="rounded-lg border border-violet-400/50 bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-200 disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Create bots'}
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={busy || bots.length === 0}
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            Delete all bots
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(220px,260px)_1fr]">
        <div className="rounded-lg border border-violet-200 bg-white xl:max-h-[calc(100vh-12rem)] xl:overflow-hidden xl:flex xl:flex-col">
          <div className="border-b border-violet-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Bot list
          </div>
          <ul className="max-h-[40vh] overflow-y-auto xl:max-h-none xl:flex-1">
            {bots.length === 0 && (
              <li className="px-3 py-4 text-sm text-slate-500">No bots yet — create some above.</li>
            )}
            {bots.map((bot) => (
              <li key={bot.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(bot.id)}
                  className={[
                    'w-full border-b border-violet-50 px-3 py-2.5 text-left text-sm transition hover:bg-violet-50',
                    selectedId === bot.id ? 'bg-violet-50' : '',
                  ].join(' ')}
                >
                  <div className="font-medium text-england-navy">{bot.bot_name}</div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">{botSummary(bot)}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-[200px] rounded-lg border border-violet-200 bg-white p-4 xl:overflow-y-auto">
          {selectedBot ? (
            <BotSquadEditor
              key={selectedBot.id}
              bot={selectedBot}
              adminSecret={adminSecretArg()}
              onSaved={async () => {
                setStatus('Bot saved.')
                await loadBots()
                onBotsChanged?.()
              }}
              onDeleted={async () => {
                setStatus('Bot deleted.')
                setSelectedId(null)
                await loadBots()
                onBotsChanged?.()
              }}
            />
          ) : (
            <p className="text-sm text-slate-500">
              Select a bot to view and edit their squad on the pitch — same as the public builder.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
