# Supabase — England WC '30 Squad Builder

## Project

| | |
|--|--|
| **Name** | TimeCapsule England'30 |
| **Project ref** | `nzypoiurjqvpohqmbide` |
| **Dashboard** | https://supabase.com/dashboard/project/nzypoiurjqvpohqmbide |
| **API URL** | `https://nzypoiurjqvpohqmbide.supabase.co` |

This is the **dedicated** database for the squad builder. It is separate from the older `mzjeodhsflhqtrhoeoxs` project (shared with pl-table-predict).

## Apply schema

For a fresh project, run the single bootstrap migration:

`migrations/20260530170000_england30_complete_schema.sql`

Older incremental migrations (`20260530120000` … `20260530160000`) were applied during development on the shared project; the bootstrap file is the canonical full schema for **TimeCapsule England'30**.

## Tables (4)

### `profiles`
User accounts (extends `auth.users`).

| Column | Purpose |
|--------|---------|
| `id` | UUID, FK → `auth.users` |
| `email` | Login email |
| `display_name` | Shown in UI |
| `role` | `user` or `admin` |
| `audience_type` | `fan` or `journalist` |
| `publication` | Website/magazine (journalists only) |
| `created_at` | Signup time |

### `squad_predictions`
Community leaderboard entries.

| Column | Purpose |
|--------|---------|
| `squad_param` | Base64-encoded squad JSON (unique) |
| `view_count` | Share link views |
| `is_bot` | QA bot row |
| `bot_name` | Display name for bots |

### `reference_squad`
Single-row answer key for scoring (id always `1`).

### `app_settings`
Key/value config (`admin_secret`, `submissions_locked`).

## Functions (RPC)

| Function | Who can call | Purpose |
|----------|--------------|---------|
| `submit_squad_prediction` | anon, authenticated | Post to leaderboard |
| `increment_squad_views` | anon, authenticated | Track share views |
| `set_reference_squad` | admin or secret | Publish answer key |
| `get_contest_settings` | everyone | Read lock state |
| `set_contest_settings` | admin | Lock/unlock submissions |
| `seed_qa_bot_squads` | admin or secret | Create test bots |
| `delete_all_qa_bots` | admin or secret | Remove all bots |
| `delete_qa_bot` | admin or secret | Remove one bot |
| `admin_list_profiles` | admin | User list |
| `admin_set_user_role` | admin | Promote/demote admin |
| `admin_delete_prediction` | admin | Remove submission |
| `is_admin` | authenticated | Role check |

Trigger `on_auth_user_created` on `auth.users` → creates/updates `profiles` with fan/journalist metadata.

## Remote status (TimeCapsule England'30)

Applied on project `nzypoiurjqvpohqmbide`:

- Tables: `profiles`, `squad_predictions`, `reference_squad`, `app_settings` (RLS on)
- Auth trigger: `on_auth_user_created` → `handle_new_user()`
- RPCs: leaderboard, reference squad, bots, admin secret check, contest settings
- Migrations: `england30_*`, `check_admin_secret`, `function_grants_hardening_v2`, `england30_bootstrap_settings`

**Auth URL config** (Site URL + redirects) lives in `supabase/config.toml`. Push it once you have a Supabase access token:

```powershell
$env:SUPABASE_ACCESS_TOKEN = '<from Dashboard → Account → Access Tokens>'
.\scripts\push-supabase-auth-config.ps1
# or: npx supabase login && npx supabase config push --project-ref nzypoiurjqvpohqmbide
```

Until that runs, confirmation emails may still default to whatever Site URL is set in the dashboard. The app always sends `emailRedirectTo` to production `/auth/callback`.

## App environment

Local `.env` and Vercel:

```
VITE_SUPABASE_URL=https://nzypoiurjqvpohqmbide.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Dashboard → Settings → API>
VITE_APP_URL=https://england-wc30-squad-builder.vercel.app
```

## Admin (no account / SQL promote)

1. Open `https://england-wc30-squad-builder.vercel.app/?admin=1`
2. Admin secret (SQL Editor): `SELECT value FROM public.app_settings WHERE key = 'admin_secret';`
3. Unlock reference squad + QA bots for the session. Full panel: `/admin` with the same secret.
