import { useEffect } from 'react'
import { useSquad } from '../hooks/useSquad'
import { trackSquadViewFromUrl } from '../lib/leaderboard'
import { Header } from '../components/Header'
import { LandingHero } from '../components/LandingHero'
import { SquadBuilder } from '../components/SquadBuilder'

export function HomePage() {
  const squad = useSquad()

  useEffect(() => {
    trackSquadViewFromUrl()
  }, [])

  const scrollToBuilder = () => {
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <LandingHero onStart={scrollToBuilder} />
      <SquadBuilder squad={squad} />
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        England WC &apos;30 Squad Builder — a fan prediction tool, not affiliated with the FA.
      </footer>
    </div>
  )
}
