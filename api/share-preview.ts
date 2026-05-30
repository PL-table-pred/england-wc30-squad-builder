import { decodeSquadParam } from './_lib/squadMeta'

export const config = {
  runtime: 'edge',
}

const DEFAULT_ORIGIN = 'https://england-wc30-squad-builder.vercel.app'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const origin = url.searchParams.get('origin') ?? DEFAULT_ORIGIN
  const squadParam = url.searchParams.get('s')

  const meta = squadParam ? decodeSquadParam(squadParam) : null

  const title = meta
    ? `England WC '30 squad · ${meta.formation}${meta.captainLabel ? ` · C: ${meta.captainLabel}` : ''}`
    : "England WC '30 Squad Builder"

  const description = meta
    ? `${meta.playerCount}-man England prediction for the 2030 World Cup. See the full squad on the builder.`
    : 'Build your predicted England squad for the 2030 FIFA World Cup. Pick 26 players, set your XI, and share.'

  const ogImage = squadParam
    ? `${origin}/api/og?s=${encodeURIComponent(squadParam)}`
    : `${origin}/api/og`

  const pageUrl = squadParam
    ? `${origin}/?s=${encodeURIComponent(squadParam)}`
    : origin

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="England WC '30 Squad Builder" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}" />
</head>
<body>
  <p><a href="${escapeHtml(pageUrl)}">${escapeHtml(title)}</a></p>
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
