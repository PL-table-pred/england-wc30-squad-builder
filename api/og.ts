import { decodeSquadParam, escapeXml } from './squadMeta'

export const config = {
  runtime: 'edge',
}

const SITE = 'england-wc30-squad-builder.vercel.app'

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url)
  const squadParam = searchParams.get('s')
  const meta = squadParam ? decodeSquadParam(squadParam) : null

  const title = meta ? `England WC '30 · ${meta.formation}` : "England WC '30 Squad Builder"
  const subtitle = meta
    ? `${meta.playerCount}/26 players${meta.captainLabel ? ` · Captain: ${meta.captainLabel}` : ''}`
    : 'Build & share your 2030 Three Lions squad prediction'

  const starters = meta?.starterLabels.length
    ? meta.starterLabels.join(' · ')
    : 'Pick 26 players · Choose formation · Share your link'

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="56" y="56" width="72" height="72" rx="12" fill="#CE1124"/>
  <text x="92" y="108" text-anchor="middle" fill="#ffffff" font-size="28" font-family="system-ui,sans-serif">🏴</text>
  <text x="148" y="88" fill="#ffffff" opacity="0.85" font-size="28" font-family="system-ui,sans-serif">England WC '30</text>
  <text x="148" y="148" fill="#ffffff" font-size="48" font-weight="700" font-family="system-ui,sans-serif">${escapeXml(truncate(title, 48))}</text>
  <text x="56" y="280" fill="#ffffff" font-size="32" font-weight="600" font-family="system-ui,sans-serif">${escapeXml(truncate(subtitle, 72))}</text>
  <text x="56" y="340" fill="#ffffff" opacity="0.75" font-size="22" font-family="system-ui,sans-serif">${escapeXml(truncate(starters, 120))}</text>
  <text x="56" y="580" fill="#ffffff" opacity="0.6" font-size="22" font-family="system-ui,sans-serif">${SITE}</text>
  <text x="1144" y="580" text-anchor="end" fill="#ffffff" opacity="0.6" font-size="20" font-family="system-ui,sans-serif">Fan prediction · Not affiliated with The FA</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
