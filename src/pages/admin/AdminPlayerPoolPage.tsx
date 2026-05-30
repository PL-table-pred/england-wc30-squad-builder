import { useEffect, useMemo, useState } from 'react'
import {
  fetchContestSettings,
  setDisabledPlayerIds,
  setSiteFeatures,
  type SiteSettings,
} from '../../lib/admin'
import { PLAYERS } from '../../data/players'
import { useSiteFeatures } from '../../contexts/SiteFeaturesContext'
import {
  countPlayersByTier,
  getPlayerPoolTier,
  isPlayerVisibleInPool,
  normalizeSiteSettings,
} from '../../lib/playerPool'
import type { PoolTier } from '../../types/player'

const TIER_LABELS: Record<PoolTier, string> = {
  senior: 'Senior pool',
  u21: 'England U21',
  u18: 'England U18',
}

export function AdminPlayerPoolPage() {
  const { refresh: refreshSiteFeatures } = useSiteFeatures()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [u21Enabled, setU21Enabled] = useState(true)
  const [u18Enabled, setU18Enabled] = useState(true)
  const [statsEnabled, setStatsEnabled] = useState(true)
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set())
  const [tierFilter, setTierFilter] = useState<PoolTier | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [featuresBusy, setFeaturesBusy] = useState(false)
  const [playersBusy, setPlayersBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const raw = await fetchContestSettings()
    const normalized = normalizeSiteSettings(raw)
    setSettings(normalized)
    setU21Enabled(normalized.youth_u21_enabled)
    setU18Enabled(normalized.youth_u18_enabled)
    setStatsEnabled(normalized.stats_page_enabled)
    setDisabledIds(new Set(normalized.disabled_player_ids))
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const draftSettings = useMemo(
    (): SiteSettings => ({
      submissions_locked: settings?.submissions_locked ?? false,
      contact_email: settings?.contact_email ?? null,
      youth_u21_enabled: u21Enabled,
      youth_u18_enabled: u18Enabled,
      stats_page_enabled: statsEnabled,
      disabled_player_ids: [...disabledIds],
    }),
    [settings, u21Enabled, u18Enabled, statsEnabled, disabledIds],
  )

  const tierCounts = useMemo(() => countPlayersByTier(draftSettings), [draftSettings])

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return PLAYERS.filter((player) => {
      if (tierFilter !== 'all' && getPlayerPoolTier(player) !== tierFilter) return false
      if (!q) return true
      return (
        player.name.toLowerCase().includes(q) || player.currentClub.toLowerCase().includes(q)
      )
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [search, tierFilter])

  async function saveFeatures() {
    setFeaturesBusy(true)
    setMessage(null)
    const result = await setSiteFeatures({
      youthU21Enabled: u21Enabled,
      youthU18Enabled: u18Enabled,
      statsPageEnabled: statsEnabled,
    })
    setFeaturesBusy(false)
    if (!result.ok) {
      setMessage(result.error ?? 'Failed to save feature settings.')
      return
    }
    setSettings(normalizeSiteSettings(result.settings))
    await refreshSiteFeatures()
    setMessage('Feature settings saved.')
  }

  async function saveDisabledPlayers() {
    setPlayersBusy(true)
    setMessage(null)
    const result = await setDisabledPlayerIds([...disabledIds])
    setPlayersBusy(false)
    if (!result.ok) {
      setMessage(result.error ?? 'Failed to save player visibility.')
      return
    }
    setSettings(normalizeSiteSettings(result.settings))
    await refreshSiteFeatures()
    setMessage('Player visibility saved.')
  }

  function togglePlayer(id: string) {
    setDisabledIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">Player pool</h2>
        <p className="mt-1 text-sm text-slate-500">
          Control which players appear in the squad picker — youth squads, most-picked stats, and
          individual hide/show.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(['senior', 'u21', 'u18'] as PoolTier[]).map((tier) => (
          <div key={tier} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {TIER_LABELS[tier]}
            </p>
            <p className="mt-1 text-2xl font-bold text-england-navy">
              {tierCounts[tier].visible}
              <span className="text-base font-normal text-slate-400"> / {tierCounts[tier].total}</span>
            </p>
            <p className="text-xs text-slate-500">visible in picker</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">Public features</h3>
        <p className="mt-1 text-sm text-slate-500">
          Turn entire youth squads or the community stats page on or off site-wide.
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-england-navy">
              <input
                type="checkbox"
                checked={u21Enabled}
                onChange={(e) => setU21Enabled(e.target.checked)}
                className="rounded border-slate-300 text-england-red focus:ring-england-red"
              />
              <span>
                <span className="font-semibold">England U21 pool</span> — {tierCounts.u21.total}{' '}
                players
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-england-navy">
              <input
                type="checkbox"
                checked={u18Enabled}
                onChange={(e) => setU18Enabled(e.target.checked)}
                className="rounded border-slate-300 text-england-red focus:ring-england-red"
              />
              <span>
                <span className="font-semibold">England U18 pool</span> — {tierCounts.u18.total}{' '}
                players
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-england-navy">
              <input
                type="checkbox"
                checked={statsEnabled}
                onChange={(e) => setStatsEnabled(e.target.checked)}
                className="rounded border-slate-300 text-england-red focus:ring-england-red"
              />
              <span className="font-semibold">Most picked stats page</span> (/stats)
            </label>
            <button
              type="button"
              disabled={featuresBusy}
              onClick={() => void saveFeatures()}
              className="mt-2 rounded-lg bg-england-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {featuresBusy ? 'Saving…' : 'Save feature toggles'}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-england-navy">Individual players</h3>
        <p className="mt-1 text-sm text-slate-500">
          Hide specific players from the picker (they stay in existing squads and leaderboard
          history).
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['all', 'senior', 'u21', 'u18'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-semibold',
                tierFilter === tier
                  ? 'bg-england-navy text-white'
                  : 'bg-slate-100 text-england-navy hover:bg-slate-200',
              ].join(' ')}
            >
              {tier === 'all' ? 'All' : TIER_LABELS[tier]}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or club…"
          className="mt-3 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-england-red focus:outline-none focus:ring-1 focus:ring-england-red"
        />

        <div className="mt-4 max-h-[420px] overflow-y-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Visible</th>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Pos</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Club</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => {
                const hidden = disabledIds.has(player.id)
                const visible = isPlayerVisibleInPool(player, draftSettings)
                return (
                  <tr key={player.id} className="border-t border-slate-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!hidden}
                        onChange={() => togglePlayer(player.id)}
                        aria-label={`Show ${player.name} in picker`}
                        className="rounded border-slate-300 text-england-red focus:ring-england-red"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-england-navy">{player.name}</td>
                    <td className="px-3 py-2 text-slate-500">{player.position}</td>
                    <td className="px-3 py-2 uppercase text-xs text-slate-400">
                      {getPlayerPoolTier(player)}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{player.currentClub}</td>
                    <td className="sr-only">{visible ? 'visible' : 'hidden'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          disabled={playersBusy}
          onClick={() => void saveDisabledPlayers()}
          className="mt-4 rounded-lg bg-england-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {playersBusy ? 'Saving…' : 'Save player visibility'}
        </button>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  )
}
