import { useState, type ReactNode } from 'react'
import type { UseSquadReturn } from '../hooks/useSquad'
import { getDragSlot } from '../utils/pitchDrag'

interface BenchDropZoneProps {
  squad: UseSquadReturn
  children: ReactNode
  className?: string
  emptyLabel?: string
}

export function BenchDropZone({
  squad,
  children,
  className = '',
  emptyLabel = 'Drop here to move to bench',
}: BenchDropZoneProps) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsOver(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsOver(false)
    const slotId = getDragSlot(event)
    if (slotId) squad.assignToSlot(slotId, null)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'rounded-lg border-2 border-dashed transition-colors',
        isOver
          ? 'border-england-red bg-red-50'
          : 'border-slate-200 bg-slate-50/50',
        className,
      ].join(' ')}
    >
      {isOver && (
        <p className="mb-2 text-center text-xs font-semibold text-england-red">{emptyLabel}</p>
      )}
      {children}
    </div>
  )
}
