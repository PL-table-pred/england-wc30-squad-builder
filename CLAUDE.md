# England WC '30 Squad Builder — Claude project guide

Use this document as the source of truth when working in this repo. Fan project — not affiliated with The FA or FIFA.

---

## What this project is

A **Vite + React** web app where users build a predicted **26-man England squad** for the **2030 FIFA World Cup**: pick players (built-in pool or custom names), choose formation, assign starting XI on a pitch, pick captain, share via URL, submit to a **community leaderboard** scored against an admin **reference squad**.

**Production:** https://england-wc30-squad-builder.vercel.app  
**GitHub:** https://github.com/PL-table-pred/england-wc30-squad-builder  
**Supabase (dedicated):** TimeCapsule England'30 — ref `nzypoiurjqvpohqmbide`  
**Dashboard:** https://supabase.com/dashboard/project/nzypoiurjqvpohqmbide  

Do **not** use the old shared pl-table-predict project (`mzjeodhsflhqtrhoeoxs`).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Build | Vite 6 |
| UI | React 19 + TypeScript |
| Routing | React Router (`BrowserRouter`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Client state | React hooks (`useSquad`, `AuthContext`) — no Redux |
| Backend | Supabase (Postgres + Auth + RPC) |
| Deploy | Vercel (`vercel.json`, static `dist/`) |
| PNG export | `html-to-image` |

---

## Environment variables

Copy `.env.example` → `.env` (gitignored):

```env
VITE_SUPABASE_URL=https://nzypoiurjqvpohqmbide.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase Dashboard → Settings → API>
VITE_APP_URL=https://england-wc30-squad-builder.vercel.app
```

All three should be set on **Vercel production** as well. `VITE_APP_URL` drives signup email redirect to `/auth/callback`.

Full DB docs: [`supabase/README.md`](supabase/README.md)

---

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build → dist/
npm run preview
```

Deploy: `git push origin main` (Vercel auto-build) or `npx vercel deploy --prod --yes`

---

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing + squad builder (`HomePage` → `SquadBuilder`) |
| `/login`, `/register` | Auth (fan / journalist + optional publication) |
| `/auth/callback` | Email confirmation / OAuth code exchange |
| `/admin` | Admin panel (nested routes below) |
| `/admin/reference` | Publish reference squad from current builder state |
| `/admin/bots` | QA bot seeding + full pitch editor per bot |
| `/admin/settings` | Lock/unlock community submissions |
| `/admin/submissions` | List/delete predictions |
| `/admin/users` | List users, promote `admin` role (logged-in admin only) |
| `/?admin=1` | Inline admin on homepage (reference squad + bots) after **admin secret** unlock |

---

## Architecture (high level)

```
App.tsx
  AuthProvider (contexts/AuthContext.tsx)
  BrowserRouter
    HomePage
      useSquad()                    ← squad state, undo, custom players
      SquadBuilder
        FormationPitch, SelectedSquad, ShareBar, Leaderboard, …
        AdminReferenceSquad, AdminBotMaker  (when ?admin=1 + secret)
    /login, /register, /auth/callback
    AdminLayout → AdminRoute → admin pages

Supabase client: src/lib/supabase.ts
Leaderboard/RPCs: src/lib/leaderboard.ts, src/lib/qaBots.ts, src/lib/admin.ts
```

**State flow:** `useSquad()` returns `UseSquadReturn` passed as `squad` prop. Components call `addPlayer`, `removePlayer`, `setFormation`, `setCaptain`, `pickPlayerForSlot`, `addCustomPlayer`, etc.

**Auth:** `useAuth()` — `user`, `profile`, `isAdmin` (profile role **or** admin-secret session), `signIn` / `signUp` / `signOut`.

---

## Squad builder (core)

### Rules (`src/utils/squadRules.ts`, `src/types/player.ts`)

- **26 players** max, **exactly 3 goalkeepers** (by `position === 'GK'`)
- Captain must be in the selected 26
- Formations: `4-3-3` (default), `4-2-3-1`, `3-4-3`, `4-4-2`
- `FORMATION_SLOTS` defines 11 pitch slots + acceptable `subPosition` per slot
- `autoAssignStartingXI()` fills XI on add/remove/formation change; users override via pitch / `assignToSlot`

### Player pool

- **Built-in:** ~68 players in `src/data/players.ts` (`PLAYERS`, `PLAYERS_BY_ID`, `getPlayer`)
- **Custom:** user-typed names via `src/lib/customPlayers.ts` — stored in `SquadState.customPlayers` with ids `custom:<uuid>`, `isCustom: true`
- **Picker UX:** `PlayerPickerModal` groups by position (GK/DEF/MID/FWD); **Custom player** option at top of each section (`CustomPlayerSectionOption.tsx`) with spelling tip
- Custom names score by **normalized name match** vs reference (not by id); catalog players still match by id

### Persistence & sharing (`src/utils/shareSquad.ts`)

Load priority on mount:

1. URL `?s=` (base64 JSON)
2. `localStorage` key `england-wc30-squad`
3. Empty squad

Payload includes optional `cp` array for custom players. Sign-up uses `emailRedirectTo` from `src/lib/appUrl.ts` → `/auth/callback`.

`useSquad({ persist: false, initialState })` used in admin bot editor so editing bots does not overwrite user localStorage.

---

## Leaderboard & scoring

### Submit / display

- `ShareBar` → `submit_squad_prediction` RPC (`src/lib/leaderboard.ts`)
- `Leaderboard.tsx` fetches predictions + reference, scores client-side

### Points (`src/utils/squadScore.ts`)

| Match | Points |
|-------|--------|
| Starter in both XIs | 10 each |
| Bench in both squads | 5 each |
| Captain (id or custom name identity) | 30 |

Max **215**. Custom players match reference when normalized names align.

### Reference squad

- Single row `reference_squad` (id `1`)
- Published via `set_reference_squad` RPC (admin profile **or** `app_settings.admin_secret`)
- Admin UI: homepage `?admin=1` + `AdminReferenceSquad`, or `/admin/reference`

---

## Admin access (two paths)

### 1. Admin secret (no SQL, no login required)

1. Get secret: `SELECT value FROM app_settings WHERE key = 'admin_secret';`
2. Open `https://england-wc30-squad-builder.vercel.app/?admin=1`
3. Enter secret in `AdminSecretGate` → sessionStorage unlock
4. Use inline **reference squad** + **QA bots** on homepage, or `/admin` (secret gate on layout)

RPCs accept `p_admin_secret`; `check_admin_secret` validates without login.

### 2. Logged-in admin (`profiles.role = 'admin'`)

- Register → promote in SQL: `UPDATE profiles SET role = 'admin' WHERE email = '…';`
- `/admin/users` for user list / role changes (requires profile admin; not secret-only)

`src/lib/adminAccess.ts` — `isAdminMode()`, `resolveAdminSecret()`, session helpers.

---

## QA bots

- `src/lib/qaBots.ts` — `seedQaBots`, `fetchQaBots`, `updateQaBot`, `deleteQaBot`, `deleteAllQaBots`
- `AdminBotMaker` — list + bulk create/delete
- `BotSquadEditor` — full pitch/squad UI like public builder, save updates `squad_param` + `bot_name`
- `seed_qa_bot_squads` RPC — fixed ambiguous `squad_param` variable (`v_squad_param` migration)
- Bots appear on leaderboard with `bot_name`; `is_bot = true`

---

## Supabase schema (summary)

**Tables:** `profiles`, `squad_predictions`, `reference_squad`, `app_settings`

**Key RPCs:** `submit_squad_prediction`, `increment_squad_views`, `set_reference_squad`, `get/set_contest_settings`, `seed_qa_bot_squads`, `delete_*_qa_bots`, `update_qa_bot`, `check_admin_secret`, `admin_list_profiles`, `admin_set_user_role`, `admin_delete_prediction`

**Auth trigger:** `on_auth_user_created` → `handle_new_user()` (display name, fan/journalist, publication from signup metadata)

**Migrations:** `supabase/migrations/` — canonical bootstrap `20260530170000_england30_complete_schema.sql`; later patches through `20260530200000_update_qa_bot.sql`

Apply to remote via Supabase MCP `apply_migration` or SQL editor. Auth Site URL: production app URL + redirect `/**` (see `supabase/config.toml`, `scripts/push-supabase-auth-config.ps1`).

---

## Key files (quick reference)

| Area | Files |
|------|--------|
| Squad state | `src/hooks/useSquad.ts` |
| Players | `src/data/players.ts`, `src/types/player.ts` |
| Custom players | `src/lib/customPlayers.ts`, `src/components/CustomPlayerSectionOption.tsx` |
| Rules / pitch | `src/utils/squadRules.ts`, `src/components/FormationPitch.tsx` |
| Share / score | `src/utils/shareSquad.ts`, `src/utils/squadScore.ts` |
| Auth | `src/contexts/AuthContext.tsx`, `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/AuthCallbackPage.tsx` |
| Admin | `src/components/admin/*`, `src/lib/admin.ts`, `src/lib/adminAccess.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Leaderboard | `src/components/Leaderboard.tsx`, `src/lib/leaderboard.ts` |
| Export PNG | `src/components/SquadExportCard.tsx`, `src/utils/exportSquadImage.ts` |
| Compare squads | `src/components/SquadCompare.tsx` |

---

## UI / styling

- Theme: `src/index.css` — `--color-england-red`, `--color-england-navy`, `--color-pitch`
- Desktop builder: pitch + squad columns; mobile tabs in `SquadBuilder`
- Admin bots page: wide layout (`AdminLayout` `max-w-7xl` on `/admin/bots`)

---

## User registration

- Fan vs journalist (`audience_type`); journalists require `publication`
- Metadata passed in `signUp` options → `handle_new_user` trigger
- Email confirmation should land on production `/auth/callback` when `VITE_APP_URL` + Supabase Site URL are correct

---

## Conventions for changes

- Functional components only; `interface` props; types in `src/types/`
- Tailwind utilities inline; match existing `squad` / `UseSquadReturn` patterns
- **Minimize scope** — small focused diffs
- Do not commit `.env`, `_ref-pl-table-predict/`, or reference clones
- Only commit when the user asks
- GK limits use `player.position === 'GK'`, not id prefix
- When adding RPCs: `SECURITY DEFINER`, `assert_admin_or_secret` where appropriate, migration in `supabase/migrations/`

---

## Common tasks

| Task | Where |
|------|--------|
| Add/edit catalog players | `src/data/players.ts` |
| Squad rules / formations | `src/types/player.ts`, `src/utils/squadRules.ts`, `FormationPitch` `getPitchRows()` |
| Custom player behavior | `src/lib/customPlayers.ts`, `PlayerPickerModal`, `shareSquad.ts`, `squadScore.ts` |
| Leaderboard / submit | `src/lib/leaderboard.ts`, RPC migrations |
| Admin secret / access | `app_settings`, `adminAccess.ts`, `AdminSecretGate` |
| Bots | `qaBots.ts`, `AdminBotMaker`, `BotSquadEditor`, bot RPC migrations |
| Auth / profiles | `AuthContext.tsx`, `20260530150000_user_profiles_auth.sql` |
| DB schema | `supabase/migrations/`, `supabase/README.md` |
| Deploy | push `main` or `npx vercel deploy --prod` |

---

## Related / out of repo

- `_ref-pl-table-predict/` — reference clone for pl-table-predict patterns (bots, admin); **not** part of deploy
- Old Supabase `mzjeodhsflhqtrhoeoxs` — do not point this app there

---

## Feature checklist (what exists today)

- [x] 26-man squad builder with pitch, bench, captain, formations
- [x] Undo/redo, localStorage, share URLs, squad compare
- [x] PNG export
- [x] Supabase leaderboard + reference scoring
- [x] Auth (login/register, fan/journalist profiles)
- [x] Admin secret flow (`?admin=1`) + `/admin` panel
- [x] Reference squad publish, contest lock, submission delete
- [x] QA bots (seed, edit on full pitch, delete)
- [x] Custom player names per position section + name-based scoring
- [x] Email callback route + `VITE_APP_URL`
- [ ] Live player data API (not planned)
- [ ] Server-side rendering (static SPA only)
