import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Formation, Player, Position, SquadState, SubPosition } from '../types/player'
import {
  createCustomPlayer,
  isCustomPlayerId,
  playersFromSquadState,
  resolveSquadPlayer,
} from '../lib/customPlayers'
import { PLAYERS_BY_ID } from '../data/players'
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
    customPlayers: {},
  }
}

function isKnownPlayerId(id: string, customPlayers: Record<string, Player>): boolean {
  return Boolean(PLAYERS_BY_ID[id] || customPlayers[id])
}

function normalizeState(raw: Partial<SquadState> & Pick<SquadState, 'selectedIds'>): SquadState {
  const customPlayers = { ...(raw.customPlayers ?? {}) }
  const validIds = raw.selectedIds.filter((id) => isKnownPlayerId(id, customPlayers))
  const formation = raw.formation ?? '4-3-3'
  const slots = FORMATION_SLOTS[formation]
  const startingXI = createEmptyStartingXI(formation)
  for (const slot of slots) {
    const playerId = raw.startingXI?.[slot.id]
    if (playerId && validIds.includes(playerId)) {
      startingXI[slot.id] = playerId
    }
  }
  const prunedCustom: Record<string, Player> = {}
  for (const id of validIds) {
    if (isCustomPlayerId(id) && customPlayers[id]) {
      prunedCustom[id] = customPlayers[id]
    }
  }
  return {
    selectedIds: validIds,
    startingXI,
    formation,
    captainId: raw.captainId && validIds.includes(raw.captainId) ? raw.captainId : null,
    customPlayers: prunedCustom,
  }
}

function loadInitialState(initial?: SquadState | null, readUrl = true): SquadState {
  if (initial) return normalizeState(initial)

  if (readUrl) {
    const fromUrl = readSquadFromLocation()
    if (fromUrl) return normalizeState(fromUrl)
  }

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

export interface UseSquadOptions {
  /** When false, do not read/write localStorage (admin bot editor). */
  persist?: boolean
  /** Initial squad; skips URL/localStorage when set. */
  initialState?: SquadState | null
}

export function useSquad(options?: UseSquadOptions) {
  const persist = options?.persist !== false
  const readUrl = persist && !options?.initialState

  const [{ past, present, future }, setUndo] = useState<UndoState>(() => ({
    past: [],
    present: loadInitialState(options?.initialState, readUrl),
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

  const selectedPlayers = useMemo(() => playersFromSquadState(state), [state])

  const starterPlayers = useMemo(() => {
    const starterIds = new Set(Object.values(state.startingXI).filter(Boolean))
    return selectedPlayers.filter((player) => starterIds.has(player.id))
  }, [selectedPlayers, state.startingXI])

  const validation = useMemo(
    () => validateSquad(selectedPlayers, state.captainId),
    [selectedPlayers, state.captainId],
  )

  useEffect(() => {
    if (!persist) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, persist])

  const resolvePlayer = useCallback(
    (id: string) => resolveSquadPlayer(id, state.customPlayers ?? {}),
    [state.customPlayers],
  )

  const addPlayerToSquad = useCallback(
    (player: Player, prev: SquadState): SquadState | null => {
      const currentPlayers = playersFromSquadState(prev)
      const check = canAddPlayer(player, currentPlayers)
      if (!check.allowed) return null

      const customPlayers = { ...(prev.customPlayers ?? {}) }
      if (player.isCustom) {
        customPlayers[player.id] = player
      }

      const selectedIds = [...prev.selectedIds, player.id]
      const selectedPlayersList = selectedIds
        .map((pid) => resolveSquadPlayer(pid, customPlayers))
        .filter((p): p is Player => Boolean(p))
      const startingXI = autoAssignStartingXI(prev.formation, selectedPlayersList)
      return { ...prev, selectedIds, customPlayers, startingXI }
    },
    [],
  )

  const addPlayer = useCallback(
    (id: string) => {
      const player = resolveSquadPlayer(id, state.customPlayers ?? {})
      if (!player) return

      pushState((prev) => addPlayerToSquad(player, prev) ?? prev)
    },
    [pushState, addPlayerToSquad, state.customPlayers],
  )

  const addCustomPlayer = useCallback(
    (name: string, position: Position, subPosition: SubPosition) => {
      const player = createCustomPlayer(name, position, subPosition)
      pushState((prev) => addPlayerToSquad(player, prev) ?? prev)
      return player
    },
    [pushState, addPlayerToSquad],
  )

  const removePlayer = useCallback(
    (id: string) => {
      pushState((prev) => {
        const selectedIds = prev.selectedIds.filter((pid) => pid !== id)
        const startingXI = { ...prev.startingXI }
        for (const slotId of Object.keys(startingXI)) {
          if (startingXI[slotId] === id) startingXI[slotId] = null
        }
        const customPlayers = { ...(prev.customPlayers ?? {}) }
        if (isCustomPlayerId(id)) {
          delete customPlayers[id]
        }
        return {
          ...prev,
          selectedIds,
          startingXI,
          customPlayers,
          captainId: prev.captainId === id ? null : prev.captainId,
        }
      })
    },
    [pushState],
  )

  const setFormation = useCallback(
    (formation: Formation) => {
      pushState((prev) => {
        const selectedPlayersList = playersFromSquadState(prev)
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
        const customPlayers = prev.customPlayers ?? {}
        const player = resolveSquadPlayer(playerId, customPlayers)
        if (!player) return prev

        let selectedIds = [...prev.selectedIds]
        if (!selectedIds.includes(playerId)) {
          const updated = addPlayerToSquad(player, { ...prev, selectedIds })
          if (!updated) return prev
          selectedIds = updated.selectedIds
          const startingXI = { ...updated.startingXI, [slotId]: playerId }
          for (const key of Object.keys(startingXI)) {
            if (key !== slotId && startingXI[key] === playerId) {
              startingXI[key] = null
            }
          }
          return { ...updated, startingXI }
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
    [pushState, addPlayerToSquad],
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
    if (persist) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [persist])

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
      const player = resolveSquadPlayer(id, state.customPlayers ?? {})
      if (!player) return { allowed: false, reason: 'Unknown player' }
      return canAddPlayer(player, selectedPlayers)
    },
    [state.customPlayers, selectedPlayers],
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
    addCustomPlayer,
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
    resolvePlayer,
    isSelected: (id: string) => state.selectedIds.includes(id),
  }
}

export type UseSquadReturn = ReturnType<typeof useSquad>
