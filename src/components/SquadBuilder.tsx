import { useEffect, useState } from 'react'
import type { UseSquadReturn } from '../hooks/useSquad'
import { CaptainPicker } from './CaptainPicker'
import { FormationPicker } from './FormationPicker'
import { FormationPitch } from './FormationPitch'
import { Leaderboard } from './Leaderboard'
import { SelectedSquad } from './SelectedSquad'
import { ShareBar } from './ShareBar'
import { SquadCompare } from './SquadCompare'

type MobileTab = 'pitch' | 'squad'

interface SquadBuilderProps {
  squad: UseSquadReturn
}

export function SquadBuilder({ squad }: SquadBuilderProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('pitch')
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        squad.undo()
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        squad.redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [squad])

  const tabs: { id: MobileTab; label: string }[] = [
    { id: 'pitch', label: 'Pitch' },
    { id: 'squad', label: 'Squad' },
  ]

  return (
    <section id="builder" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-3">
        <FormationPicker squad={squad} />
        <CaptainPicker squad={squad} />
      </div>

      <ShareBar squad={squad} onLeaderboardSubmit={() => setLeaderboardKey((k) => k + 1)} />
      <SquadCompare squad={squad} />
      <Leaderboard key={leaderboardKey} />

      <div className="mt-4 lg:hidden">
        <div className="flex rounded-lg bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={[
                'flex-1 rounded-md py-2 text-sm font-semibold transition-colors',
                mobileTab === tab.id
                  ? 'bg-white text-england-red shadow-sm'
                  : 'text-slate-600',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
        <div className={`min-h-[480px] lg:block ${mobileTab === 'pitch' ? 'block' : 'hidden'}`}>
          <FormationPitch squad={squad} />
        </div>
        <div className={`min-h-[480px] lg:block ${mobileTab === 'squad' ? 'block' : 'hidden'}`}>
          <SelectedSquad squad={squad} />
        </div>
      </div>
    </section>
  )
}
