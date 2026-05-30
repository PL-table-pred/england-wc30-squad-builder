# England WC '30 Squad Builder

An interactive website for predicting England's 26-man squad for the 2030 FIFA World Cup. Pick players, choose a formation, assign your starting XI, name a captain, and share your prediction via link.

## Features

- Curated pool of 70+ England players and prospects
- Full 26-man squad builder with 3-goalkeeper rule
- Formation presets: 4-3-3, 4-2-3-1, 3-4-3, 4-4-2
- Visual pitch for starting XI assignment
- Auto-save to browser localStorage
- Shareable prediction links
- **Download PNG** — export your squad as an image for Twitter/X
- **Community leaderboard** — post your squad and see most-viewed predictions (Supabase)

## Environment (leaderboard)

Copy `.env.example` to `.env` and set your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

The leaderboard is optional — the app works without it. On Vercel/Netlify, add the same variables in your project settings.

The database migration lives in `supabase/migrations/`.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

The static output is in the `dist/` folder.

## Deploy

### Vercel (recommended)

**Live site:** [england-wc30-squad-builder.vercel.app](https://england-wc30-squad-builder.vercel.app)

1. Push this repo to GitHub
2. Import the project at [vercel.com](https://vercel.com) — or run `npx vercel deploy --prod` from the project root
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Vercel auto-detects Vite via [`vercel.json`](vercel.json)

### Netlify

1. Run `npm run build`
2. Deploy the `dist/` folder via drag-and-drop at [netlify.com](https://netlify.com)

Or connect your repo with build command `npm run build` and publish directory `dist`.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4

## License

MIT — fan project, not affiliated with The FA or FIFA.
