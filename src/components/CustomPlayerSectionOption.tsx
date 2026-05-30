import { useState } from 'react'
import {
  CUSTOM_PLAYER_SPELLING_TIP,
  createCustomPlayer,
  defaultSubPositionForPosition,
} from '../lib/customPlayers'
import type { Position } from '../types/player'
import type { UseSquadReturn } from '../hooks/useSquad'
import { canAddPlayer } from '../utils/squadRules'

interface CustomPlayerSectionOptionProps {
  position: Position
  squad: UseSquadReturn
  onAdded: (playerId: string) => void
}

export function CustomPlayerSectionOption({
  position,
  squad,
  onAdded,
}: CustomPlayerSectionOptionProps) {
  const [name, setName] = useState('')
  const [expanded, setExpanded] = useState(false)

  const trimmed = name.trim()
  const probe =
    trimmed.length >= 2
      ? createCustomPlayer(trimmed, position, defaultSubPositionForPosition(position))
      : null
  const check = probe ? canAddPlayer(probe, squad.selectedPlayers) : { allowed: false }

  function handleAdd() {
    if (!probe || !check.allowed) return
    const player = squad.addCustomPlayer(
      trimmed,
      position,
      defaultSubPositionForPosition(position),
    )
    setName('')
    setExpanded(false)
    onAdded(player.id)
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mb-2 w-full rounded-lg border border-dashed border-violet-300 bg-violet-50 px-3 py-2.5 text-left transition hover:border-violet-400 hover:bg-violet-100/80"
      >
        <p className="text-sm font-semibold text-violet-900">Custom player</p>
        <p className="mt-0.5 text-xs text-violet-800/90">
          Can&apos;t find who you&apos;re looking for? Use this to type their name.
        </p>
      </button>
    )
  }

  return (
    <div className="mb-2 rounded-lg border border-violet-300 bg-violet-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-violet-900">Custom player</p>
        <button
          type="button"
          onClick={() => {
            setExpanded(false)
            setName('')
          }}
          className="text-xs text-violet-700 hover:underline"
        >
          Cancel
        </button>
      </div>
      <p className="mt-1 text-xs text-violet-900/90">{CUSTOM_PLAYER_SPELLING_TIP}</p>
      <label className="mt-2 block">
        <span className="text-xs font-medium text-violet-800">Player name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jude Bellingham"
          autoFocus
          className="mt-1 w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-england-navy outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
      </label>
      <button
        type="button"
        onClick={handleAdd}
        disabled={trimmed.length < 2 || !check.allowed}
        title={trimmed.length < 2 ? 'Enter at least 2 characters' : check.reason}
        className="mt-2 w-full rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add custom player
      </button>
      {trimmed.length >= 2 && !check.allowed && check.reason && (
        <p className="mt-1 text-xs text-rose-600">{check.reason}</p>
      )}
    </div>
  )
}
