import { useState } from 'react'
import { resolveSquadPlayer } from '../lib/customPlayers'
import { decodeSquadFromUrl } from '../utils/shareSquad'
import { diffSquads, extractShareParam } from '../utils/squadCompare'
import { buildShareUrl } from '../utils/shareSquad'
import type { UseSquadReturn } from '../hooks/useSquad'
import { getAgeIn2030 } from '../types/player'

interface SquadCompareProps {
  squad: UseSquadReturn
}

function PlayerList({
  title,
  players,
  variant,
}: {
  title: string
  players: { id: string; name: string; birthYear: number }[]
  variant: 'added' | 'removed' | 'shared'
}) {
  const colors = {
    added: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    removed: 'text-rose-700 bg-rose-50 border-rose-100',
    shared: 'text-slate-700 bg-slate-50 border-slate-100',
  }

  return (
    <div className={`rounded-lg border p-3 ${colors[variant]}`}>
      <h4 className="text-xs font-bold uppercase tracking-wide">{title} ({players.length})</h4>
      {players.length === 0 ? (
        <p className="mt-2 text-xs opacity-70">None</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {players.map((player) => (
            <li key={player.id} className="text-sm">
              {player.name}{' '}
              <span className="text-xs opacity-60">({getAgeIn2030(player.birthYear)})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SquadCompare({ squad }: SquadCompareProps) {
  const [open, setOpen] = useState(false)
  const [urlA, setUrlA] = useState('')
  const [urlB, setUrlB] = useState('')

  const handleOpen = () => {
    setOpen(true)
    setUrlA(buildShareUrl(squad.state))
    setUrlB('')
  }

  const stateA = decodeSquadFromUrl(extractShareParam(urlA) ?? '')
  const stateB = decodeSquadFromUrl(extractShareParam(urlB) ?? '')

  const diff =
    stateA && stateB
      ? diffSquads(stateA, stateB, (id) =>
          resolveSquadPlayer(id, { ...stateA.customPlayers, ...stateB.customPlayers }),
        )
      : null

  const showBError = urlB.trim().length > 0 && !stateB
  const showAError = urlA.trim().length > 0 && !stateA

  return (
    <div className="mt-4">
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Compare squads
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-england-navy">Compare Squads</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-500 hover:text-england-red"
            >
              Close
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Paste two share links to see differences side by side. Squad A defaults to your current squad.
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-400">Squad A</span>
              <input
                type="text"
                value={urlA}
                onChange={(e) => setUrlA(e.target.value)}
                placeholder="Paste share link or ?s= value..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-400">Squad B</span>
              <input
                type="text"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                placeholder="Paste a friend's share link..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-england-red focus:ring-2 focus:ring-england-red/20"
              />
            </label>
          </div>

          {showAError && <p className="mt-2 text-sm text-rose-600">Squad A link is invalid.</p>}
          {showBError && <p className="mt-2 text-sm text-rose-600">Squad B link is invalid.</p>}

          {diff && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-england-navy">Squad A</p>
                  <p className="mt-1 text-slate-600">{diff.statsA.breakdown}</p>
                  <p className="text-slate-500">Avg age: {diff.statsA.averageAge ?? '—'}</p>
                  <p className="text-slate-500">
                    Formation: {diff.formationA}
                    {diff.captainA && ` · C: ${diff.captainA.name}`}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-england-navy">Squad B</p>
                  <p className="mt-1 text-slate-600">{diff.statsB.breakdown}</p>
                  <p className="text-slate-500">Avg age: {diff.statsB.averageAge ?? '—'}</p>
                  <p className="text-slate-500">
                    Formation: {diff.formationB}
                    {diff.captainB && ` · C: ${diff.captainB.name}`}
                  </p>
                </div>
              </div>

              {!diff.sameFormation && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Different formations: {diff.formationA} vs {diff.formationB}
                </p>
              )}
              {!diff.sameCaptain && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Different captains: {diff.captainA?.name ?? 'None'} vs {diff.captainB?.name ?? 'None'}
                </p>
              )}

              <div className="grid gap-3 lg:grid-cols-3">
                <PlayerList title="Only in Squad A" players={diff.onlyA} variant="added" />
                <PlayerList title="In both squads" players={diff.shared} variant="shared" />
                <PlayerList title="Only in Squad B" players={diff.onlyB} variant="removed" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
