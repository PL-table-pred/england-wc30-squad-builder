import { useCallback, useEffect, useMemo, useState } from 'react'
import { PLAYERS, PLAYERS_BY_ID } from '../data/players'
import type { Formation, SquadState } from '../types/player'
import {
  autoAssignStartingXI,
  canAddPlayer,
  createEmptyStartingXI,
  FORMATION_SLOTS,
  STORAGE_KEY,
  validateSquad,
} from '../utils/squadRules'
import { readSquadFromLocation } from '../utils/shareSquad'

const MAX_HISTORY = 50

interface UndoState {
  past: SquadState[]
  present: SquadState
  future: SquadState[]
}

function emptySquad(): SquadState {
  return {
    selectedIds: [],
    startingXI: createEmptyStartingXI('4-3-3'),
    formation: '4-3-3',
    captainId: null,
  }
}

function normalizeState(raw: Partial<SquadState> & Pick<SquadState, 'selectedIds'>): SquadState {
  const validIds = raw.selectedIds.filter((id) => PLAYERS_BY_ID[id])
  const formation = raw.formation ?? '4-3-3'
  const slots = FORMATION_SLOTS[formation]
  const startingXI = createEmptyStartingXI(formation)
  for (const slot of slots) {
    const playerId = raw.startingXI?.[slot.id]
    if (playerId && validIds.includes(playerId)) {
      startingXI[slot.id] = playerId
    }
  }
  return {
    selectedIds: validIds,
    startingXI,
    formation,
    captainId: raw.captainId && validIds.includes(raw.captainId) ? raw.captainId : null,
  }
}

function loadInitialState(): SquadState {
  const fromUrl = readSquadFromLocation()
  if (fromUrl) return normalizeState(fromUrl)

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return normalizeState(JSON.parse(stored) as SquadState)
    }
  } catch {
    // ignore corrupt storage
  }

  return emptySquad()
}

export function useSquad() {
  const [{ past, present, future }, setUndo] = useState<UndoState>(() => ({
    past: [],
    present: loadInitialState(),
    future: [],
  }))

  const state = present

  const pushState = useCallback((updater: SquadState | ((prev: SquadState) => SquadState)) => {
    setUndo(({ past, present: current, future: _future }) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      if (next === current) return { past, present: current, future: [] }
      return {
        past: [...past, current].slice(-MAX_HISTORY),
        present: next,
        future: [],
      }
    })
  }, [])

  const selectedPlayers = useMemo(
    () => state.selectedIds.map((id) => PLAYERS_BY_ID[id]).filter(Boolean),
    [state.selectedIds],
  )

  const starterPlayers = useMemo(() => {
    const starterIds = new Set(Object.values(state.startingXI).filter(Boolean))
    return selectedPlayers.filter((player) => starterIds.has(player.id))
  }, [selectedPlayers, state.startingXI])

  const validation = useMemo(
    () => validateSquad(PLAYERS, state.selectedIds, state.captainId),
    [state.selectedIds, state.captainId],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addPlayer = useCallback(
    (id: string) => {
      const player = PLAYERS_BY_ID[id]
      if (!player) return

      pushState((prev) => {
        const check = canAddPlayer(player, prev.selectedIds)
        if (!check.allowed) return prev

        const selectedIds = [...prev.selectedIds, id]
        const selectedPlayersList = selectedIds.map((pid) => PLAYERS_BY_ID[pid])
        const startingXI = autoAssignStartingXI(prev.formation, selectedPlayersList)
        return { ...prev, selectedIds, startingXI }
      })
    },
    [pushState],
  )

  const removePlayer = useCallback(
    (id: string) => {
      pushState((prev) => {
        const selectedIds = prev.selectedIds.filter((pid) => pid !== id)
        const startingXI = { ...prev.startingXI }
        for (const slotId of Object.keys(startingXI)) {
          if (startingXI[slotId] === id) startingXI[slotId] = null
        }
        return {
          ...prev,
          selectedIds,
          startingXI,
          captainId: prev.captainId === id ? null : prev.captainId,
        }
      })
    },
    [pushState],
  )

  const setFormation = useCallback(
    (formation: Formation) => {
      pushState((prev) => {
        const selectedPlayersList = prev.selectedIds.map((id) => PLAYERS_BY_ID[id])
        return {
          ...prev,
          formation,
          startingXI: autoAssignStartingXI(formation, selectedPlayersList),
        }
      })
    },
    [pushState],
  )

  const setCaptain = useCallback(
    (id: string | null) => {
      pushState((prev) => ({ ...prev, captainId: id }))
    },
    [pushState],
  )

  const pickPlayerForSlot = useCallback(
    (slotId: string, playerId: string) => {
      pushState((prev) => {
        const player = PLAYERS_BY_ID[playerId]
        if (!player) return prev

        let selectedIds = [...prev.selectedIds]
        if (!selectedIds.includes(playerId)) {
          const check = canAddPlayer(player, selectedIds)
          if (!check.allowed) return prev
          selectedIds = [...selectedIds, playerId]
        }

        const startingXI = { ...prev.startingXI, [slotId]: playerId }
        for (const key of Object.keys(startingXI)) {
          if (key !== slotId && startingXI[key] === playerId) {
            startingXI[key] = null
          }
        }
        return { ...prev, selectedIds, startingXI }
      })
    },
    [pushState],
  )

  const assignToSlot = useCallback(
    (slotId: string, playerId: string | null) => {
      pushState((prev) => {
        if (playerId && !prev.selectedIds.includes(playerId)) return prev
        const startingXI = { ...prev.startingXI, [slotId]: playerId }
        if (playerId) {
          for (const key of Object.keys(startingXI)) {
            if (key !== slotId && startingXI[key] === playerId) {
              startingXI[key] = null
            }
          }
        }
        return { ...prev, startingXI }
      })
    },
    [pushState],
  )

  const resetSquad = useCallback(() => {
    setUndo({ past: [], present: emptySquad(), future: [] })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const loadState = useCallback((next: SquadState) => {
    setUndo({ past: [], present: normalizeState(next), future: [] })
  }, [])

  const undo = useCallback(() => {
    setUndo(({ past, present, future }) => {
      if (past.length === 0) return { past, present, future }
      const previous = past[past.length - 1]
      return {
        past: past.slice(0, -1),
        present: previous,
        future: [present, ...future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setUndo(({ past, present, future }) => {
      if (future.length === 0) return { past, present, future }
      const next = future[0]
      return {
        past: [...past, present],
        present: next,
        future: future.slice(1),
      }
    })
  }, [])

  const canAdd = useCallback(
    (id: string) => {
      const player = PLAYERS_BY_ID[id]
      if (!player) return { allowed: false, reason: 'Unknown player' }
      return canAddPlayer(player, state.selectedIds)
    },
    [state.selectedIds],
  )

  const benchPlayers = useMemo(() => {
    const inXI = new Set(Object.values(state.startingXI).filter(Boolean))
    return selectedPlayers.filter((player) => !inXI.has(player.id))
  }, [selectedPlayers, state.startingXI])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  return {
    state,
    selectedPlayers,
    starterPlayers,
    benchPlayers,
    validation,
    addPlayer,
    removePlayer,
    setFormation,
    setCaptain,
    pickPlayerForSlot,
    assignToSlot,
    resetSquad,
    loadState,
    undo,
    redo,
    canUndo,
    canRedo,
    canAdd,
    isSelected: (id: string) => state.selectedIds.includes(id),
  }
}

export type UseSquadReturn = ReturnType<typeof useSquad>
