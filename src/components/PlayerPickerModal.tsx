import { useEffect, useMemo, useState } from 'react'
import { useSiteFeatures } from '../contexts/SiteFeaturesContext'
import { inferPositionForSlot } from '../lib/customPlayers'
import type { Position, SubPosition } from '../types/player'
import type { UseSquadReturn } from '../hooks/useSquad'
import { CustomPlayerSectionOption } from './CustomPlayerSectionOption'
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

const POSITION_SECTIONS: { position: Position; label: string }[] = [
  { position: 'GK', label: 'Goalkeepers' },
  { position: 'DEF', label: 'Defenders' },
  { position: 'MID', label: 'Midfielders' },
  { position: 'FWD', label: 'Forwards' },
]

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
  const { availablePlayers } = useSiteFeatures()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL')

  useEffect(() => {
    if (open) {
      setSearch('')
      const slotPosition = inferPositionForSlot(slotSubPositions)
      if (slotSubPositions?.length) {
        setFilter(slotPosition)
      } else {
        setFilter('ALL')
      }
    }
  }, [open, slotSubPositions])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const trimmedSearch = search.trim().toLowerCase()

  const playersBySection = useMemo(() => {
    const map = new Map<Position, typeof availablePlayers>()
    for (const section of POSITION_SECTIONS) {
      const players = availablePlayers.filter((player) => {
        if (player.position !== section.position) return false
        if (!trimmedSearch) return true
        return (
          player.name.toLowerCase().includes(trimmedSearch) ||
          player.currentClub.toLowerCase().includes(trimmedSearch)
        )
      }).sort((a, b) => {
        if (slotSubPositions?.length) {
          const aMatch = slotSubPositions.includes(a.subPosition) ? 0 : 1
          const bMatch = slotSubPositions.includes(b.subPosition) ? 0 : 1
          if (aMatch !== bMatch) return aMatch - bMatch
        }
        return a.name.localeCompare(b.name)
      })
      map.set(section.position, players)
    }
    return map
  }, [trimmedSearch, slotSubPositions, availablePlayers])

  const visibleSections =
    filter === 'ALL' ? POSITION_SECTIONS : POSITION_SECTIONS.filter((s) => s.position === filter)

  function handleCustomAdded(playerId: string) {
    onSelect(playerId)
    onClose()
  }

  if (!open) return null

  const title = slotLabel ? `Choose ${slotLabel}` : 'Choose player'
  const totalVisible = visibleSections.reduce(
    (sum, section) => sum + (playersBySection.get(section.position)?.length ?? 0),
    0,
  )

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
                  ? 'Suggested positions shown first in each section.'
                  : 'Browse by position or search by name.'}
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
            placeholder="Search by name or club…"
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
          {visibleSections.map((section) => {
            const players = playersBySection.get(section.position) ?? []
            return (
              <section key={section.position} className="mb-5 last:mb-0">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {section.label}
                </h3>

                <CustomPlayerSectionOption
                  position={section.position}
                  squad={squad}
                  onAdded={handleCustomAdded}
                />

                {players.length > 0 ? (
                  <div className="grid gap-2">
                    {players.map((player) => {
                      const inSquad = squad.isSelected(player.id)
                      const check = squad.canAdd(player.id)
                      const canPick = inSquad || check.allowed
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
                ) : (
                  <p className="py-3 text-center text-xs text-slate-400">
                    No players match your search in this section.
                  </p>
                )}
              </section>
            )
          })}

          {totalVisible === 0 && trimmedSearch && (
            <p className="py-4 text-center text-sm text-slate-500">
              Nobody in the list matches &ldquo;{search.trim()}&rdquo; — use{' '}
              <span className="font-medium">Custom player</span> at the top of a position section.
            </p>
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
