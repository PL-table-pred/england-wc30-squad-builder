export const PITCH_SLOT_DRAG = 'application/x-england-pitch-slot'

export function setDragSlot(event: React.DragEvent, slotId: string): void {
  event.dataTransfer.setData(PITCH_SLOT_DRAG, slotId)
  event.dataTransfer.effectAllowed = 'move'
}

export function getDragSlot(event: React.DragEvent): string | null {
  const slotId = event.dataTransfer.getData(PITCH_SLOT_DRAG)
  return slotId || null
}
