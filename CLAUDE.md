# England WC '30 Squad Builder — Project Overview

## What this is

A static, client-side web app where users build a predicted **26-man England squad** for the **2030 FIFA World Cup**. Users pick players from a curated pool, choose a formation, assign a starting XI on a visual pitch, name a captain, and share their prediction via URL.

Fan project — not affiliated with The FA or FIFA.

## Tech stack

| Layer | Choice |
|-------|--------|
| Build | Vite 6 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| State | React hooks only — no Redux, no router |
| Persistence | `localStorage` + URL query param (`?s=...`) |
| Backend | None |

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # preview production build
```

## Architecture

```
App.tsx
  └── useSquad()          ← single source of truth for all squad state
        ├── data/players.ts
        ├── utils/squadRules.ts
        └── utils/shareSquad.ts

SquadBuilder
  ├── FormationPitch      ← click slot → PlayerPickerModal
  ├── SelectedSquad       ← 26-man roster + Add to bench
  ├── FormationPicker
  ├── CaptainPicker
  └── ShareBar            ← copy link, reset, undo/redo
```

State flows **down** from `useSquad()` into components via a `squad` prop (`UseSquadReturn`). Components call methods like `addPlayer`, `removePlayer`, `setFormation`, `setCaptain`, `assignToSlot`.

## Key files

| File | Role |
|------|------|
| `src/hooks/useSquad.ts` | Squad state, add/remove logic, auto-assign XI, localStorage sync |
| `src/data/players.ts` | Static pool of ~68 England players/prospects |
| `src/types/player.ts` | `Player`, `SquadState`, `Formation`, constants (26 max, 3 GK) |
| `src/utils/squadRules.ts` | Formation slot definitions, validation, `autoAssignStartingXI()` |
| `src/utils/shareSquad.ts` | Base64 JSON encode/decode for `?s=` URL sharing |
| `src/components/SquadBuilder.tsx` | Main 3-column layout; mobile tabs (Pool / Pitch / Squad) |

## Squad rules (enforced in code)

- **26 players max**
- **Exactly 3 goalkeepers** (min and max)
- Captain must be one of the selected 26
- Starting XI = 11 slots defined per formation in `FORMATION_SLOTS`
- On add/remove/formation change, `autoAssignStartingXI()` fills pitch slots by matching `subPosition`
- Users can manually override slot assignments via `assignToSlot()`

## Player data model

```typescript
interface Player {
  id: string           // e.g. "mid-bellingham"
  name: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  subPosition: SubPosition  // e.g. 'CB', 'CM', 'ST' — used for pitch placement
  birthYear: number    // age in 2030 = 2030 - birthYear
  currentClub: string  // informational only
}
```

To add/edit players, modify `PLAYERS` array in `src/data/players.ts`. IDs must be unique; GK IDs start with `gk-` (used by goalkeeper count logic in `canAddPlayer`).

## Formations

Supported: `4-3-3` (default), `4-2-3-1`, `3-4-3`, `4-4-2`.

Each formation has 11 pitch slots in `FORMATION_SLOTS` with acceptable `subPositions` per slot. Pitch row layout is hardcoded in `FormationPitch.tsx` → `getPitchRows()`.

## Persistence & sharing

**Load priority on mount:**
1. URL param `?s=` (base64-encoded JSON) — from `readSquadFromLocation()`
2. `localStorage` key `england-wc30-squad`
3. Empty squad (4-3-3, no players)

**Auto-save:** every state change writes to `localStorage`.

**Share:** `ShareBar` calls `buildShareUrl()` which encodes `{ f, s, xi, c }` into `?s=`.

## UI / styling

- England palette via Tailwind theme in `src/index.css`: `--color-england-red`, `--color-england-navy`, `--color-pitch`
- Desktop: 3-column grid (pool | pitch | squad)
- Mobile: tab switcher in `SquadBuilder.tsx`
- Landing hero scrolls to `#builder` section

## What is NOT in scope (v1)

- No backend, auth, or database
- No live player data API
- No community leaderboard or aggregated predictions
- No PNG export

## Extra features (implemented)

- **Stats sidebar** (`SelectedSquad` + `utils/squadStats.ts`): `3 GK / 8 DEF / …` breakdown, average age, youngest/oldest
- **Bench vs starters**: squad list split into Starting XI (red tint, XI badge) and Bench sections
- **Undo/redo** (`useSquad`): 50-step history; ShareBar buttons; Ctrl+Z / Ctrl+Y (skipped when focus is in inputs)
- **Compare squads** (`SquadCompare`): paste two share links; diffs players, formations, captains, stats
- **Player picker modal** (`PlayerPickerModal`): opens when clicking a pitch slot; full player list with search/filters
- **Drag to bench** (`BenchDropZone` + `pitchDrag.ts`): drag starters from pitch to bench
- **Community leaderboard** (`Leaderboard`, `lib/leaderboard.ts`): Supabase table `squad_predictions`; post via ShareBar; views tracked on `?s=` load
- **PNG export** (`SquadExportCard`, `exportSquadImage.ts`): Download PNG button in ShareBar via `html-to-image`

## Common tasks for future work

| Task | Where to look |
|------|---------------|
| Add/remove players | `src/data/players.ts` |
| Change squad rules | `src/types/player.ts` + `src/utils/squadRules.ts` |
| Add a formation | `Formation` type, `FORMATION_SLOTS`, `getPitchRows()` |
| New UI section | `src/components/`, wire through `SquadBuilder` or `App` |
| Deploy | Build `dist/`, deploy to Vercel/Netlify (see `README.md`) |

## Conventions

- Functional components only, no class components
- Props typed with `interface`, exported types in `src/types/`
- Tailwind utility classes inline — no separate CSS modules
- Keep changes minimal; match existing naming (`squad` prop, `UseSquadReturn` type)
- Do not edit the plan file at `.cursor/plans/`
