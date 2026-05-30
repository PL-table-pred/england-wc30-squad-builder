import type { Player } from '../types/player'
import { getAgeIn2030 } from '../types/player'

const POSITION_COLORS: Record<Player['position'], string> = {
  GK: 'bg-amber-100 text-amber-900 border-amber-200',
  DEF: 'bg-blue-100 text-blue-900 border-blue-200',
  MID: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  FWD: 'bg-rose-100 text-rose-900 border-rose-200',
}

interface PlayerCardProps {
  player: Player
  onSelect: (id: string) => void
  disabled?: boolean
  disabledReason?: string
  active?: boolean
  inSquad?: boolean
}

export function PlayerCard({
  player,
  onSelect,
  disabled,
  disabledReason,
  active,
  inSquad,
}: PlayerCardProps) {
  const age = getAgeIn2030(player.birthYear)

  return (
    <button
      type="button"
      onClick={() => onSelect(player.id)}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={[
        'w-full rounded-lg border p-3 text-left transition-all',
        active
          ? 'border-england-red bg-red-50 ring-2 ring-england-red/30'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-england-navy">{player.name}</p>
          <p className="truncate text-xs text-slate-500">{player.currentClub}</p>
        </div>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${POSITION_COLORS[player.position]}`}
        >
          {player.subPosition}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
        <span>Age in 2030: {age}</span>
        {inSquad && <span className="font-medium text-england-red">In squad</span>}
      </div>
    </button>
  )
}
