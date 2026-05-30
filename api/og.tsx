import { ImageResponse } from '@vercel/og'
import { decodeSquadParam } from './_lib/squadMeta'

export const config = {
  runtime: 'edge',
}

const SITE = 'england-wc30-squad-builder.vercel.app'

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url)
  const squadParam = searchParams.get('s')
  const meta = squadParam ? decodeSquadParam(squadParam) : null

  const title = meta ? `England WC '30 · ${meta.formation}` : "England WC '30 Squad Builder"
  const subtitle = meta
    ? `${meta.playerCount}/26 players${meta.captainLabel ? ` · Captain: ${meta.captainLabel}` : ''}`
    : 'Build & share your 2030 Three Lions squad prediction'

  const starters =
    meta?.starterLabels.length ?
      meta.starterLabels.join(' · ')
    : 'Pick 26 players · Choose formation · Share your link'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 45%, #1a0a0a 100%)',
          color: 'white',
          padding: 56,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: '#CE1124',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            🏴
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, opacity: 0.85 }}>England WC &apos;30</div>
            <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 600, opacity: 0.95 }}>{subtitle}</div>
          <div
            style={{
              fontSize: 22,
              opacity: 0.75,
              maxWidth: 1000,
              lineHeight: 1.4,
            }}
          >
            {starters}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: 0.6 }}>
          <span>{SITE}</span>
          <span>Fan prediction · Not affiliated with The FA</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
