import { useEffect, useMemo, useState } from 'react'
import { PLAYERS } from '../data/players'
import type { Position, SubPosition } from '../types/player'
import type { UseSquadReturn } from '../hooks/useSquad'
import { PlayerCard } from './PlayerCard'

interface PlayerPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (playerId: string) => void
  squad: UseSquadReturn
  slotLabel?: string
  slotSubPositions?: SubPosition[]
  currentPlayerId?: string | null
  onClear?: () => void
}

const FILTERS: Array<Position | 'ALL'> = ['ALL', 'GK', 'DEF', 'MID', 'FWD']

export function PlayerPickerModal({
  open,
  onClose,
  onSelect,
  squad,
  slotLabel,
  slotSubPositions,
  currentPlayerId,
  onClear,
}: PlayerPickerModalProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL')

  useEffect(() => {
    if (open) {
      setSearch('')
      setFilter('ALL')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const filtered = useMemo(() => {
    return PLAYERS.filter((player) => {
      const matchesFilter = filter === 'ALL' || player.position === filter
      const matchesSearch =
        search.trim() === '' ||
        player.name.toLowerCase().includes(search.toLowerCase()) ||
        player.currentClub.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    }).sort((a, b) => {
      if (slotSubPositions) {
        const aMatch = slotSubPositions.includes(a.subPosition) ? 0 : 1
        const bMatch = slotSubPositions.includes(b.subPosition) ? 0 : 1
        if (aMatch !== bMatch) return aMatch - bMatch
      }
      return a.name.localeCompare(b.name)
    })
  }, [filter, search, slotSubPositions])

  if (!open) return null

  const title = slotLabel ? `Choose ${slotLabel}` : 'Choose player'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-picker-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="player-picker-title" className="text-lg font-bold text-england-navy">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {slotSubPositions
                  ? 'Suggested positions shown first.'
                  : 'Pick a player to add to your squad.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-england-navy"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <input
            type="search"
            placeholder="Search by name or club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
          />
          <div className="mt-3 flex flex-wrap gap-1">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  filter === item
                    ? 'bg-england-red text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            {filtered.map((player) => {
              const inSquad = squad.isSelected(player.id)
              const canPick = inSquad || squad.canAdd(player.id).allowed
              const check = squad.canAdd(player.id)
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={(id) => {
                    onSelect(id)
                    onClose()
                  }}
                  disabled={!canPick}
                  disabledReason={!inSquad ? check.reason : undefined}
                  active={player.id === currentPlayerId}
                  inSquad={inSquad}
                />
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No players match your search.</p>
          )}
        </div>

        {currentPlayerId && onClear && (
          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={() => {
                onClear()
                onClose()
              }}
              className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-england-red hover:bg-red-50"
            >
              Clear this position
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
