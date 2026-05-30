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
- **Community leaderboard** — post your squad; ranked by accuracy vs an admin reference squad (Supabase)

## Leaderboard scoring

Each submitted prediction is scored against a single **reference squad** (set by admin):

| Match | Points |
|-------|--------|
| Player in your starting XI and reference starting XI | 10 each |
| Player on your bench and reference bench | 5 each |
| Correct captain | 30 |

Max score: **215** (11 starters + 15 bench + captain).

## Environment (Supabase)

This app uses the dedicated Supabase project **TimeCapsule England'30** (`nzypoiurjqvpohqmbide`).

Copy `.env.example` to `.env`:

```
VITE_SUPABASE_URL=https://nzypoiurjqvpohqmbide.supabase.co
VITE_SUPABASE_ANON_KEY=<from Dashboard → Settings → API>
```

Dashboard: https://supabase.com/dashboard/project/nzypoiurjqvpohqmbide

Full schema docs: [`supabase/README.md`](supabase/README.md)

On Vercel, set the same two variables in project settings, then redeploy.

### Admin panel

1. Register at `/register`, then promote yourself in SQL:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
2. Open `/admin` (dashboard, reference squad, bots, users, settings).
3. Build a complete squad on the homepage, then publish it under **Reference squad**.

To rotate the secret:
```sql
UPDATE app_settings SET value = 'your-new-uuid-here' WHERE key = 'admin_secret';
```

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

**GitHub:** [github.com/PL-table-pred/england-wc30-squad-builder](https://github.com/PL-table-pred/england-wc30-squad-builder)

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
