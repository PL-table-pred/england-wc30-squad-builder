import { getPlayer } from '../data/players'
import type { UseSquadReturn } from '../hooks/useSquad'

interface CaptainPickerProps {
  squad: UseSquadReturn
}

export function CaptainPicker({ squad }: CaptainPickerProps) {
  if (squad.selectedPlayers.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="captain-select" className="text-sm font-semibold text-england-navy">
        Captain:
      </label>
      <select
        id="captain-select"
        value={squad.state.captainId ?? ''}
        onChange={(e) => squad.setCaptain(e.target.value || null)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-england-navy outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
      >
        <option value="">Select captain...</option>
        {squad.selectedPlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
      {squad.state.captainId && (
        <span className="rounded-full bg-england-navy px-2.5 py-0.5 text-xs font-bold text-white">
          {getPlayer(squad.state.captainId)?.name}
        </span>
      )}
    </div>
  )
}
