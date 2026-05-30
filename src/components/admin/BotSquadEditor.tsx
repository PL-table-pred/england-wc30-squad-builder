import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { deleteQaBot, updateQaBot } from '../../lib/qaBots'
import { fetchReferenceSquad } from '../../lib/leaderboard'
import { useSquad } from '../../hooks/useSquad'
import { decodeSquadFromUrl, encodeSquadToUrl } from '../../utils/shareSquad'
import { calculateSquadScore } from '../../utils/squadScore'
import type { QaBotRow } from '../../lib/supabase'
import { CaptainPicker } from '../CaptainPicker'
import { FormationPicker } from '../FormationPicker'
import { FormationPitch } from '../FormationPitch'
import { SelectedSquad } from '../SelectedSquad'

type MobileTab = 'pitch' | 'squad'

interface BotSquadEditorProps {
  bot: QaBotRow
  adminSecret?: string
  onSaved: () => void
  onDeleted: () => void
}

export function BotSquadEditor({
  bot,
  adminSecret,
  onSaved,
  onDeleted,
}: BotSquadEditorProps) {
  const { isProfileAdmin } = useAuth()
  const initialState = useMemo(
    () => decodeSquadFromUrl(bot.squad_param),
    [bot.squad_param],
  )
  const squad = useSquad({ persist: false, initialState })
  const [botName, setBotName] = useState(bot.bot_name)
  const [mobileTab, setMobileTab] = useState<MobileTab>('pitch')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [referenceScore, setReferenceScore] = useState<number | null>(null)

  useEffect(() => {
    setBotName(bot.bot_name)
  }, [bot.bot_name, bot.id])

  useEffect(() => {
    void (async () => {
      const reference = await fetchReferenceSquad()
      if (!reference) {
        setReferenceScore(null)
        return
      }
      const refState = decodeSquadFromUrl(reference.squad_param)
      if (!refState) {
        setReferenceScore(null)
        return
      }
      setReferenceScore(calculateSquadScore(squad.state, refState).total)
    })()
  }, [squad.state, bot.id])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        squad.undo()
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        squad.redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [squad])

  const savedParam = bot.squad_param
  const currentParam = encodeSquadToUrl(squad.state)
  const isDirty = currentParam !== savedParam || botName.trim() !== bot.bot_name

  async function handleSave() {
    const trimmedName = botName.trim()
    if (trimmedName.length < 1) {
      setMessage({ type: 'error', text: 'Bot name is required.' })
      return
    }
    if (!squad.validation.isComplete) {
      setMessage({
        type: 'error',
        text: 'Complete the 26-man squad, starting XI, and captain before saving.',
      })
      return
    }

    setBusy(true)
    setMessage(null)

    const result = await updateQaBot({
      id: bot.id,
      squadParam: currentParam,
      botName: trimmedName,
      adminSecret: isProfileAdmin ? undefined : adminSecret,
    })

    setBusy(false)

    if (!result.ok) {
      setMessage({ type: 'error', text: result.error ?? 'Failed to save bot.' })
      return
    }

    setMessage({ type: 'success', text: 'Bot squad saved.' })
    onSaved()
  }

  function handleRevert() {
    const restored = decodeSquadFromUrl(savedParam)
    if (restored) {
      squad.loadState(restored)
    }
    setBotName(bot.bot_name)
    setMessage(null)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete bot "${bot.bot_name}"?`)) return
    setBusy(true)
    const result = await deleteQaBot(bot.id, isProfileAdmin ? undefined : adminSecret)
    setBusy(false)
    if (!result.ok) {
      setMessage({ type: 'error', text: result.error ?? 'Failed to delete bot.' })
      return
    }
    onDeleted()
  }

  const tabs: { id: MobileTab; label: string }[] = [
    { id: 'pitch', label: 'Pitch' },
    { id: 'squad', label: 'Squad' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Display name</span>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-england-navy outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
            />
          </label>
          <p className="mt-1 text-xs text-slate-500">
            {squad.state.formation} · {squad.state.selectedIds.length}/26
            {squad.state.captainId ? ' · Captain set' : ' · Pick a captain'}
            {referenceScore !== null && ` · vs reference: ${referenceScore} pts`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy || !isDirty}
            className="rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={handleRevert}
            disabled={busy || !isDirty}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-england-navy hover:bg-slate-50 disabled:opacity-50"
          >
            Revert
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={busy}
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </p>
      )}

      {!initialState && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This bot has invalid squad data — build a new squad below and save.
        </p>
      )}

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <FormationPicker squad={squad} />
        <CaptainPicker squad={squad} />
      </div>

      <div className="lg:hidden">
        <div className="flex rounded-lg bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={[
                'flex-1 rounded-md py-2 text-sm font-semibold transition-colors',
                mobileTab === tab.id
                  ? 'bg-white text-england-red shadow-sm'
                  : 'text-slate-600',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
        <div
          className={`min-h-[420px] lg:block ${mobileTab === 'pitch' ? 'block' : 'hidden'}`}
        >
          <FormationPitch squad={squad} />
        </div>
        <div
          className={`min-h-[420px] lg:block ${mobileTab === 'squad' ? 'block' : 'hidden'}`}
        >
          <SelectedSquad squad={squad} />
        </div>
      </div>
    </div>
  )
}
