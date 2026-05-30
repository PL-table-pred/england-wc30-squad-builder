import { FORMATIONS } from '../utils/squadRules'
import type { Formation } from '../types/player'
import type { UseSquadReturn } from '../hooks/useSquad'

interface FormationPickerProps {
  squad: UseSquadReturn
}

export function FormationPicker({ squad }: FormationPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-england-navy">Formation:</span>
      {FORMATIONS.map((formation: Formation) => (
        <button
          key={formation}
          type="button"
          onClick={() => squad.setFormation(formation)}
          className={[
            'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
            squad.state.formation === formation
              ? 'bg-england-red text-white shadow-sm'
              : 'bg-white text-england-navy ring-1 ring-slate-200 hover:bg-slate-50',
          ].join(' ')}
        >
          {formation}
        </button>
      ))}
    </div>
  )
}
