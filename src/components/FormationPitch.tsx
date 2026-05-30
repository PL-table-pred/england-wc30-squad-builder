import { useRef, useState } from 'react'
import { getPlayer } from '../data/players'
import { FORMATION_SLOTS } from '../utils/squadRules'
import { setDragSlot } from '../utils/pitchDrag'
import type { UseSquadReturn } from '../hooks/useSquad'
import { BenchDropZone } from './BenchDropZone'
import { PlayerPickerModal } from './PlayerPickerModal'

interface FormationPitchProps {
  squad: UseSquadReturn
}

export function FormationPitch({ squad }: FormationPitchProps) {
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [draggingSlot, setDraggingSlot] = useState<string | null>(null)
  const didDrag = useRef(false)
  const slots = FORMATION_SLOTS[squad.state.formation]
  const rows = getPitchRows(squad.state.formation)

  const activeSlotData = activeSlot ? slots.find((s) => s.id === activeSlot) : null
  const currentPlayerId = activeSlot ? squad.state.startingXI[activeSlot] : null

  const handleSelect = (playerId: string) => {
    if (!activeSlot) return
    squad.pickPlayerForSlot(activeSlot, playerId)
    setActiveSlot(null)
  }

  const handleClear = () => {
    if (!activeSlot) return
    squad.assignToSlot(activeSlot, null)
    setActiveSlot(null)
  }

  const handleSlotClick = (slotId: string) => {
    if (didDrag.current) {
      didDrag.current = false
      return
    }
    setActiveSlot(slotId)
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-england-navy">Starting XI</h2>
          <p className="mt-1 text-sm text-slate-500">
            Click a position to choose a player. Drag a name to the bench to remove them from the XI.
          </p>
        </div>

        <div className="p-4">
          <div className="relative mx-auto max-w-lg overflow-hidden rounded-xl bg-pitch shadow-inner">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
              <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/60" />
              <div className="absolute bottom-0 left-1/2 h-16 w-40 -translate-x-1/2 border-2 border-b-0 border-white/60" />
              <div className="absolute top-0 left-1/2 h-16 w-40 -translate-x-1/2 border-2 border-t-0 border-white/60" />
            </div>

            <div className="relative space-y-3 p-4 py-6">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {row.map((slotId) => {
                    const slot = slots.find((s) => s.id === slotId)!
                    const playerId = squad.state.startingXI[slotId]
                    const player = playerId ? getPlayer(playerId) : null
                    const isCaptain = playerId === squad.state.captainId
                    const isDragging = draggingSlot === slotId

                    return (
                      <div
                        key={slotId}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSlotClick(slotId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSlotClick(slotId)
                          }
                        }}
                        draggable={!!player}
                        onDragStart={(e) => {
                          if (!player) return
                          didDrag.current = true
                          setDraggingSlot(slotId)
                          setDragSlot(e, slotId)
                        }}
                        onDragEnd={() => {
                          setDraggingSlot(null)
                          setTimeout(() => {
                            didDrag.current = false
                          }, 0)
                        }}
                        className={[
                          'flex w-20 cursor-pointer flex-col items-center rounded-lg border-2 px-1 py-2 text-center transition-all',
                          isDragging
                            ? 'border-white/60 bg-white/60 opacity-50'
                            : 'border-white/30 bg-white/90 hover:border-white hover:bg-white hover:shadow-md',
                          player ? 'cursor-grab active:cursor-grabbing' : '',
                        ].join(' ')}
                      >
                        <span className="text-[10px] font-bold uppercase text-pitch">{slot.label}</span>
                        {player ? (
                          <>
                            <span className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-tight text-england-navy">
                              {player.name.split(' ').pop()}
                            </span>
                            {isCaptain && (
                              <span className="mt-0.5 rounded bg-england-navy px-1 text-[8px] font-bold text-white">
                                C
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="mt-1 text-[10px] text-slate-400">Pick</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Bench ({squad.benchPlayers.length})
            </h3>
            <BenchDropZone squad={squad} className="min-h-[3rem] p-3">
              {squad.benchPlayers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {squad.benchPlayers.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-england-navy ring-1 ring-slate-200"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  Drag a starter here to bench them
                </p>
              )}
            </BenchDropZone>
          </div>
        </div>
      </div>

      <PlayerPickerModal
        open={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        onSelect={handleSelect}
        squad={squad}
        slotLabel={activeSlotData?.label}
        slotSubPositions={activeSlotData?.subPositions}
        currentPlayerId={currentPlayerId}
        onClear={currentPlayerId ? handleClear : undefined}
      />
    </>
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
