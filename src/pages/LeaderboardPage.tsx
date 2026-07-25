import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Leaderboard } from '../components/Leaderboard'
import { SiteFooter } from '../components/SiteFooter'

export function LeaderboardPage() {
  const [refreshKey] = useState(0)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-slate-500">
          <Link to="/#builder" className="font-semibold text-england-red hover:underline">
            ← Back to squad builder
          </Link>
        </p>
        <Leaderboard refreshKey={refreshKey} />
      </main>
      <SiteFooter />
    </div>
  )
}
