import { getPlayer } from '../data/players'
import { FORMATION_SLOTS } from '../utils/squadRules'
import { computeSquadStats } from '../utils/squadStats'
import type { UseSquadReturn } from '../hooks/useSquad'
import { getAgeIn2030 } from '../types/player'

interface SquadExportCardProps {
  squad: UseSquadReturn
}

export function SquadExportCard({ squad }: SquadExportCardProps) {
  const slots = FORMATION_SLOTS[squad.state.formation]
  const stats = computeSquadStats(squad.selectedPlayers)
  const captain = squad.state.captainId ? getPlayer(squad.state.captainId) : null
  const rows = getPitchRows(squad.state.formation)

  return (
    <div
      className="w-[1200px] bg-white p-10 text-england-navy"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="flex items-center gap-4 border-b-4 border-england-red pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-england-red">
          <svg viewBox="0 0 32 32" className="h-10 w-10" aria-hidden="true">
            <rect width="32" height="32" fill="#fff" />
            <rect x="14" width="4" height="32" fill="#CE1124" />
            <rect y="14" width="32" height="4" fill="#CE1124" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">England WC &apos;30</h1>
          <p className="mt-1 text-xl text-slate-500">My predicted squad</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">Formation</p>
          <p className="mt-1 text-2xl font-bold">{squad.state.formation}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">Captain</p>
          <p className="mt-1 text-2xl font-bold">{captain?.name ?? '—'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">Avg age</p>
          <p className="mt-1 text-2xl font-bold">{stats.averageAge ?? '—'}</p>
        </div>
      </div>

      <p className="mt-4 text-center text-lg font-semibold text-slate-600">{stats.breakdown}</p>

      <div className="mt-8 overflow-hidden rounded-2xl bg-pitch p-8">
        <div className="space-y-6">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4">
              {row.map((slotId) => {
                const slot = slots.find((s) => s.id === slotId)!
                const playerId = squad.state.startingXI[slotId]
                const player = playerId ? getPlayer(playerId) : null
                const isCaptain = playerId === squad.state.captainId

                return (
                  <div
                    key={slotId}
                    className="flex w-28 flex-col items-center rounded-xl bg-white px-2 py-3 text-center shadow-md"
                  >
                    <span className="text-xs font-bold uppercase text-pitch">{slot.label}</span>
                    <span className="mt-1 line-clamp-2 text-sm font-bold leading-tight">
                      {player ? player.name.split(' ').pop() : '—'}
                    </span>
                    {player && (
                      <span className="mt-1 text-[10px] text-slate-400">
                        Age {getAgeIn2030(player.birthYear)}
                      </span>
                    )}
                    {isCaptain && (
                      <span className="mt-1 rounded bg-england-navy px-2 py-0.5 text-[10px] font-bold text-white">
                        C
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {squad.benchPlayers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold uppercase tracking-wide text-slate-400">Bench</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {squad.benchPlayers.map((player) => (
              <span
                key={player.id}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium"
              >
                {player.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-slate-400">
        england-wc30-squad-builder · FIFA World Cup 2030 prediction
      </p>
    </div>
  )
}

function getPitchRows(formation: string): string[][] {
  switch (formation) {
    case '4-3-3':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['cm1', 'cm2', 'cm3'], ['lw', 'st', 'rw']]
    case '4-2-3-1':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['cdm1', 'cdm2'], ['lam', 'cam', 'ram'], ['st']]
    case '3-4-3':
      return [['gk'], ['cb1', 'cb2', 'cb3'], ['lwb', 'cm1', 'cm2', 'rwb'], ['lw', 'st', 'rw']]
    case '4-4-2':
      return [['gk'], ['lb', 'cb1', 'cb2', 'rb'], ['lm', 'cm1', 'cm2', 'rm'], ['st1', 'st2']]
    default:
      return [['gk']]
  }
}
