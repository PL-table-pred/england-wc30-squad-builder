import type { SquadState } from '../types/player'
import { squadPlayerIdentity } from '../lib/customPlayers'

export const XI_POINTS = 10
export const BENCH_POINTS = 5
export const CAPTAIN_POINTS = 30

export interface SquadScoreBreakdown {
  xiMatches: number
  benchMatches: number
  captainMatch: boolean
  xiPoints: number
  benchPoints: number
  captainPoints: number
  total: number
}

export function getStartingXIIds(state: SquadState): Set<string> {
  return new Set(
    Object.values(state.startingXI).filter((id): id is string => id !== null && id !== undefined),
  )
}

export function getBenchIds(state: SquadState): Set<string> {
  const xiIds = getStartingXIIds(state)
  return new Set(state.selectedIds.filter((id) => !xiIds.has(id)))
}

function countIdentityMatches(predIds: Set<string>, refIds: Set<string>, pred: SquadState, ref: SquadState): number {
  const predCustom = pred.customPlayers ?? {}
  const refCustom = ref.customPlayers ?? {}
  let matches = 0

  for (const predId of predIds) {
    const predKey = squadPlayerIdentity(predId, predCustom)
    for (const refId of refIds) {
      if (squadPlayerIdentity(refId, refCustom) === predKey) {
        matches++
        break
      }
    }
  }

  return matches
}

function captainsMatch(prediction: SquadState, reference: SquadState): boolean {
  if (!prediction.captainId || !reference.captainId) return false
  const predCustom = prediction.customPlayers ?? {}
  const refCustom = reference.customPlayers ?? {}
  return (
    squadPlayerIdentity(prediction.captainId, predCustom) ===
    squadPlayerIdentity(reference.captainId, refCustom)
  )
}

export function calculateSquadScore(
  prediction: SquadState,
  reference: SquadState,
): SquadScoreBreakdown {
  const predXI = getStartingXIIds(prediction)
  const refXI = getStartingXIIds(reference)
  const predBench = getBenchIds(prediction)
  const refBench = getBenchIds(reference)

  const xiMatches = countIdentityMatches(predXI, refXI, prediction, reference)
  const benchMatches = countIdentityMatches(predBench, refBench, prediction, reference)
  const captainMatch = captainsMatch(prediction, reference)

  const xiPoints = xiMatches * XI_POINTS
  const benchPoints = benchMatches * BENCH_POINTS
  const captainPoints = captainMatch ? CAPTAIN_POINTS : 0

  return {
    xiMatches,
    benchMatches,
    captainMatch,
    xiPoints,
    benchPoints,
    captainPoints,
    total: xiPoints + benchPoints + captainPoints,
  }
}

export function formatScoreBreakdown(score: SquadScoreBreakdown): string {
  const captain = score.captainMatch ? 'C✓' : 'C✗'
  return `${score.xiMatches}/11 XI · ${score.benchMatches} bench · ${captain}`
}
