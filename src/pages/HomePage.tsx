import { useEffect } from 'react'
import { useSquad } from '../hooks/useSquad'
import { trackSquadViewFromUrl } from '../lib/leaderboard'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
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
      <SiteFooter />
    </div>
  )
}
