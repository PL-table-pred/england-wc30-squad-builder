import { useMemo, useState } from 'react'
import { getAgeIn2030 } from '../types/player'
import type { Player } from '../types/player'
import { computeSquadStats } from '../utils/squadStats'
import type { UseSquadReturn } from '../hooks/useSquad'
import { PlayerPickerModal } from './PlayerPickerModal'
import { BenchDropZone } from './BenchDropZone'

interface SelectedSquadProps {
  squad: UseSquadReturn
}

function SquadPlayerRow({
  player,
  squad,
  isStarter,
}: {
  player: Player
  squad: UseSquadReturn
  isStarter: boolean
}) {
  const isCaptain = squad.state.captainId === player.id

  return (
    <li
      className={[
        'flex items-center justify-between gap-2 rounded-lg border px-3 py-2',
        isStarter ? 'border-england-red/20 bg-red-50/50' : 'border-slate-100 bg-slate-50',
      ].join(' ')}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-england-navy">{player.name}</p>
          {isStarter && (
            <span className="rounded bg-england-red/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-england-red">
              XI
            </span>
          )}
          {isCaptain && (
            <span className="rounded bg-england-navy px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              C
            </span>
          )}
          {player.isCustom && (
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-800">
              Custom
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          {player.subPosition}
          {player.isCustom ? ' · spell correctly to score' : ` · Age ${getAgeIn2030(player.birthYear)}`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => squad.removePlayer(player.id)}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-england-red hover:bg-red-50"
      >
        Remove
      </button>
    </li>
  )
}

export function SelectedSquad({ squad }: SelectedSquadProps) {
  const [benchPickerOpen, setBenchPickerOpen] = useState(false)
  const stats = useMemo(() => computeSquadStats(squad.selectedPlayers), [squad.selectedPlayers])

  return (
    <>
      <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-england-navy">Your Squad</h2>
            {!squad.validation.isFull && (
              <button
                type="button"
                onClick={() => setBenchPickerOpen(true)}
                className="rounded-lg bg-england-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Add to bench
              </button>
            )}
          </div>

          {squad.selectedPlayers.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-england-navy">
                {stats.breakdown}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Stat label="Average age" value={stats.averageAge !== null ? String(stats.averageAge) : '—'} />
                <Stat label="Total" value={`${squad.validation.totalCount}/26`} />
                <Stat
                  label="Youngest"
                  value={
                    stats.youngest
                      ? `${stats.youngest.player.name.split(' ').pop()} (${stats.youngest.age})`
                      : '—'
                  }
                />
                <Stat
                  label="Oldest"
                  value={
                    stats.oldest
                      ? `${stats.oldest.player.name.split(' ').pop()} (${stats.oldest.age})`
                      : '—'
                  }
                />
              </div>
            </div>
          )}

          {squad.selectedPlayers.length === 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <Stat label="Total" value={`${squad.validation.totalCount}/26`} />
              <Stat label="Goalkeepers" value={`${squad.validation.gkCount}/3`} />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {squad.selectedPlayers.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Click a position on the pitch to start building your squad.
            </p>
          ) : (
            <div className="space-y-4">
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-england-red">
                  Starting XI
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-england-red">
                    {squad.starterPlayers.length}
                  </span>
                </h3>
                {squad.starterPlayers.length > 0 ? (
                  <ul className="space-y-1">
                    {squad.starterPlayers.map((player) => (
                      <SquadPlayerRow key={player.id} player={player} squad={squad} isStarter />
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Assign players on the pitch.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Bench
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                    {squad.benchPlayers.length}
                  </span>
                </h3>
                <BenchDropZone squad={squad} className="p-2">
                  {squad.benchPlayers.length > 0 ? (
                    <ul className="space-y-1">
                      {squad.benchPlayers.map((player) => (
                        <SquadPlayerRow key={player.id} player={player} squad={squad} isStarter={false} />
                      ))}
                    </ul>
                  ) : (
                    <p className="px-2 py-4 text-center text-xs text-slate-400">
                      Drag a starter here from the pitch
                    </p>
                  )}
                </BenchDropZone>
              </section>
            </div>
          )}
        </div>

        {!squad.validation.isComplete && squad.validation.messages.length > 0 && (
          <div className="border-t border-slate-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800">To complete your squad:</p>
            <ul className="mt-1 list-inside list-disc text-xs text-amber-700">
              {squad.validation.messages.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <PlayerPickerModal
        open={benchPickerOpen}
        onClose={() => setBenchPickerOpen(false)}
        onSelect={(id) => squad.addPlayer(id)}
        squad={squad}
        slotLabel="bench player"
      />
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
      <p className="text-slate-400">{label}</p>
      <p className="truncate font-semibold text-england-navy">{value}</p>
    </div>
  )
}
