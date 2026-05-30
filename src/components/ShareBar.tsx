import { useRef, useState } from 'react'
import { submitSquadPrediction } from '../lib/leaderboard'
import { isSupabaseConfigured } from '../lib/supabase'
import { buildShareUrl, clearShareParam, encodeSquadToUrl } from '../utils/shareSquad'
import { downloadSquadImage } from '../utils/exportSquadImage'
import type { UseSquadReturn } from '../hooks/useSquad'
import { SquadExportCard } from './SquadExportCard'

interface ShareBarProps {
  squad: UseSquadReturn
  onLeaderboardSubmit?: () => void
}

export function ShareBar({ squad, onLeaderboardSubmit }: ShareBarProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleCopyLink = async () => {
    const url = buildShareUrl(squad.state)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  const handleExport = async () => {
    if (!exportRef.current || squad.selectedPlayers.length === 0) return
    setExporting(true)
    try {
      await downloadSquadImage(exportRef.current)
    } catch {
      window.alert('Could not generate image. Try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleSubmitLeaderboard = async () => {
    if (!squad.validation.isComplete) return
    setSubmitting(true)
    setSubmitError(null)
    const result = await submitSquadPrediction(encodeSquadToUrl(squad.state))
    setSubmitting(false)
    if (result.ok) {
      setSubmitted(true)
      onLeaderboardSubmit?.()
    } else {
      setSubmitError(result.error ?? 'Failed to submit')
    }
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    squad.resetSquad()
    clearShareParam()
    setConfirmReset(false)
    setSubmitted(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-england-navy">Your prediction is auto-saved</p>
          <p className="text-xs text-slate-500">
            {squad.validation.isComplete
              ? 'Copy the link for rich previews on Twitter/WhatsApp — or download a PNG. Post to the leaderboard when ready.'
              : 'Finish your 26-man squad and pick a captain to share.'}
          </p>
          {submitError && <p className="mt-1 text-xs text-rose-600">{submitError}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={squad.undo}
            disabled={!squad.canUndo}
            title="Undo (Ctrl+Z)"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-england-navy transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={squad.redo}
            disabled={!squad.canRedo}
            title="Redo (Ctrl+Y)"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-england-navy transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={squad.selectedPlayers.length === 0 || exporting}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-england-navy transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? 'Generating…' : 'Download PNG'}
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={squad.selectedPlayers.length === 0}
            className="rounded-lg bg-england-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? 'Link copied!' : 'Copy share link'}
          </button>
          {isSupabaseConfigured() && (
            <button
              type="button"
              onClick={handleSubmitLeaderboard}
              disabled={!squad.validation.isComplete || submitting || submitted}
              className="rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitted ? 'Posted!' : submitting ? 'Posting…' : 'Post to leaderboard'}
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className={[
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              confirmReset
                ? 'bg-england-red text-white hover:bg-red-700'
                : 'bg-slate-100 text-england-navy hover:bg-slate-200',
            ].join(' ')}
          >
            {confirmReset ? 'Confirm reset' : 'Reset squad'}
          </button>
        </div>
      </div>

      <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden="true">
        <div ref={exportRef}>
          <SquadExportCard squad={squad} />
        </div>
      </div>
    </>
  )
}
