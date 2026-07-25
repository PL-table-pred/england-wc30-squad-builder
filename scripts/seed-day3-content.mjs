/**
 * Day 3 seed: print SQL for blog posts + reference squad (run via Supabase MCP / SQL editor).
 * Node: node scripts/seed-day3-content.mjs > /tmp/day3.sql
 */
import { writeFileSync } from 'node:fs'

const posts = [
  {
    slug: 'how-scoring-works',
    title: 'How leaderboard scoring works (10 / 5 / 30)',
    excerpt:
      'Your prediction is scored against the admin reference squad: 10 points per shared starter, 5 per shared bench player, and 30 if you match the captain.',
    body: `When you post a squad to the LionXI leaderboard, we do not grade you on vibes. We compare your 26-man prediction to a single **reference squad** published by the site admins.

## The three ways to score

**Starters (10 points each).** If a player is in your starting XI and also in the reference starting XI, that is 10 points. Formation slots do not have to match — identity matters (catalog player id, or normalised custom name).

**Bench (5 points each).** If a player is in your 26 but not in your XI, and the same player is in the reference 26 but not in the reference XI, that is 5 points. Someone you start who they bench (or the reverse) does not earn the starter or bench bonus for that pairing.

**Captain (30 points).** Match the reference captain and you pick up a flat 30. Captain must be one of your selected 26.

## Maximum score

Perfect alignment is **215**: 11 × 10 for the XI, 15 × 5 for the bench, plus 30 for captain. Most predictions will land well below that — the fun is arguing over the edges.

## Custom names

Custom players you type in do not match by id. They score when the **normalised name** lines up with a custom (or matching) name on the reference. Spelling matters — see our note on [custom player names](/blog/custom-player-names).

## Where to check

Build on the [homepage](/), then watch community trends on [most picked stats](/stats). Scoring only works once a reference squad is live — admins can update it anytime as the real England picture shifts toward 2030.`,
  },
  {
    slug: 'how-to-build-a-26-man-squad',
    title: 'How to build a 26-man England WC squad',
    excerpt:
      'A practical walkthrough of the LionXI builder: 26 players, exactly three goalkeepers, formation, starting XI, captain, then share or post.',
    body: `England will take a **26-man** World Cup squad. LionXI mirrors that rule so your prediction feels like a real tournament list, not an 11-a-side dream team.

## The hard rules

You need **exactly 26** selected players and **exactly three goalkeepers** (position GK). The captain must be inside that 26. Formations available today: **4-3-3** (default), **4-2-3-1**, **3-4-3**, and **4-4-2**.

## A sensible order of work

**1. Lock the gloves.** Pick three keepers before you fall down a rabbit hole of wingers. One clear No.1, one experienced deputy, one younger upside pick is a common shape.

**2. Build the spine.** Two centre-backs you trust, a holding midfielder, a creator, and a centre-forward who can lead the line. Everything else hangs off that spine.

**3. Balance the bench.** Tournament squads are about injuries and game states. Duplicate positions on the bench (a second left-back, a versatile midfielder) usually ages better than eleven attackers.

**4. Set the XI and captain.** The pitch auto-fills when you change formation; drag or tap to override. Captaincy is also a scoring lever on the [leaderboard](/#leaderboard) — 30 points if you match the reference.

## Youth and custom names

If youth pools are enabled, U21 and U18 players appear in the picker. For prospects not in the catalog yet, add a **custom player** under the right position section. Then share your link or PNG, or post when you are happy.

Open the [squad builder](/) and treat the first save as a draft — undo exists for a reason.`,
  },
  {
    slug: 'u21-u18-watchlist',
    title: 'U21 / U18 names worth watching for 2030',
    excerpt:
      'Transfer chatter around England U21s — especially Norwich’s Kellen Fisher — plus how youth names fit a 2030 World Cup prediction on LionXI.',
    body: `Four years is a long time in international football. Plenty of names in today’s England Under-21 orbit will be knocking on the senior door by **2030** — or already through it.

## Transfer watch (July 2026)

Recent England U21 coverage has been dominated by club interest rather than tournament headlines. The clearest thread: **Kellen Fisher** of Norwich. Reports have linked **Everton** and **Newcastle** with the England U21 full-back, while **Hull City** have also been mentioned as exploring a deal. Treat every link as rumour until a club confirms it — but the signal is real: Premier League sides are treating U21 minutes as a scouting shortlist.

Elsewhere in the same news cycle: West Ham have been linked with an England U21 midfielder; former U21 midfielder **Baker** moved from Stoke toward Turkey; and keeper **Tommy Simkin** joined Doncaster on loan. None of that locks a 2030 XI, but it shows how quickly pathways change.

On LionXI, Fisher sits in the youth midfield pool and Simkin among the U21 keepers — useful if you want your prediction to include players still climbing.

## How to use youth on this site

When admins enable U21 / U18 pools, those players appear in the picker alongside the senior shortlist. You still only get **three goalkeepers** and **26** total. Youth picks cost the same as seniors on the [leaderboard](/#leaderboard) — they only help if they make the eventual reference squad.

## Building a watchlist, not a fantasy

A good 2030 prediction usually mixes locked seniors with **two or three** high-upside youth names, not a full academy XI. Use [most picked stats](/stats) to see whether the community is early on the same prospects.

Further reading: [England Under-21s news roundup (NewsNow)](https://www.newsnow.co.uk/h/Sport/Football/International/England/England+Under-21s). Then [build your squad](/).`,
  },
  {
    slug: 'custom-player-names',
    title: 'Why custom names need exact spelling',
    excerpt:
      'Custom players score by normalised name match against the reference squad — not by id. Small spelling differences can cost you points.',
    body: `The built-in LionXI pool will never cover every name you want for 2030. That is why each position section has a **Custom player** option.

## How matching works

Catalog players (Saka, Bellingham, and the rest) match the reference by **stable id**. Custom players you type in get ids like \`custom:…\` that only exist in your browser or share link.

When we score, custom entries match if the **normalised name** lines up with a name on the reference side (also custom, or the same spelling). Normalisation strips noise so "J. Smith" and "j smith" can align — but **"Kellen Fisher"** and **"Kelen Fisher"** will not.

## Practical tips

**Copy the common spelling** used in club and England coverage. Prefer full names over nicknames unless the reference is clearly going to use the nickname.

**One identity per player.** Do not add the same prospect twice under slightly different strings.

**Share links carry customs.** The \`cp\` payload in a share URL includes your custom names so friends see the same squad. If they retype the name differently and post separately, scoring can diverge.

If you are aiming for leaderboard points, treat spelling like a password: close is not enough. More on points in [how scoring works](/blog/how-scoring-works).`,
  },
  {
    slug: 'contest-rules',
    title: 'Contest rules and when submissions lock',
      excerpt:
        'How public predictions, locks, and admin tools work on LionXI — and what winning the leaderboard actually means.',
      body: `LionXI is a **fan prediction** tool. Posting to the leaderboard is optional; you can always build and share locally.

## Submitting

When submissions are open and you are signed in, **Post to leaderboard** stores your encoded squad. Anyone can read the public leaderboard and [stats](/stats).

## Locks

Admins can **lock submissions** from site settings. When locked, new posts are rejected so the board stays stable around a reveal or deadline. Your local builder still works — you just cannot push a new prediction until the lock lifts.

## Scoring and winners

Ranks come from comparing each prediction to the current **reference squad**. Admins can change that reference as England's real picture evolves. There is no cash prize and no official FA or FIFA standing — see our [terms](/terms) and [disclaimer post](/blog/unofficial-fan-tool).

## Fair use

Do not spam the board with automated junk accounts. Admins can delete predictions and manage roles. If something looks wrong, use the [contact page](/contact).`,
    },
  {
    slug: 'unofficial-fan-tool',
    title: 'This is an unofficial fan tool (disclaimer)',
    excerpt:
      'LionXI is an independent fan project by TimeCapsule Football. Not affiliated with The FA, FIFA, or any club.',
    body: `England WC '30 Squad Builder — **LionXI** at [lionxi.co](https://lionxi.co) — is an unofficial fan product run by TimeCapsule Football.

## What that means

We are **not** affiliated with, endorsed by, or connected to The Football Association, FIFA, UEFA, the Premier League, or any club. Player names appear for editorial discussion and prediction entertainment only.

Leaderboard scores compare fan predictions to an **admin reference squad** for game purposes. That is not an official England squad announcement.

## Ads and privacy

We may show advertising to cover hosting. Data handling is described in our [privacy policy](/privacy). Site rules sit in the [terms of use](/terms).

## Contact

Questions, corrections, or takedown requests: [contact](/contact). Then get back to arguing about the last winger slot on the [builder](/).`,
  },
]

function sqlString(s) {
  return s.replace(/'/g, "''")
}

const squadParam =
  'eyJmIjoiNC0zLTMiLCJzIjpbImdrLXBpY2tmb3JkIiwiZ2stdHJhZmZvcmQiLCJnay1yYW1zZGFsZSIsImRlZi1ndWVoaSIsImRlZi1jb2x3aWxsIiwiZGVmLXF1YW5zYWgiLCJkZWYtbGl2cmFtZW50byIsImRlZi1oYWxsIiwiZGVmLWphbWVzIiwiZGVmLWxld2lzLXNrZWxseSIsImRlZi1zdG9uZXMiLCJkZWYta29uc2EiLCJtaWQtYmVsbGluZ2hhbSIsIm1pZC1yaWNlIiwibWlkLWZvZGVuIiwibWlkLXBhbG1lciIsIm1pZC1tYWlub28iLCJtaWQtd2hhcnRvbiIsIm1pZC1lemUiLCJmd2Qtc2FrYSIsImZ3ZC1nb3Jkb24iLCJmd2Qta2FuZSIsImZ3ZC1tYWR1ZWtlIiwiZndkLWRlbGFwIiwiZndkLXdhdGtpbnMiLCJmd2QtZ2l0dGVucyJdLCJ4aSI6eyJnayI6ImdrLXBpY2tmb3JkIiwibGIiOiJkZWYtaGFsbCIsImNiMSI6ImRlZi1ndWVoaSIsImNiMiI6ImRlZi1jb2x3aWxsIiwicnIiOiJkZWYtbGl2cmFtZW50byIsImNtMSI6Im1pZC1yaWNlIiwiY20yIjoibWlkLWJlbGxpbmdoYW0iLCJjbTMiOiJtaWQtZm9kZW4iLCJsdyI6ImZ3ZC1nb3Jkb24iLCJzdCI6ImZ3ZC1rYW5lIiwicnciOiJmd2Qtc2FrYSJ9LCJjIjoibWlkLWJlbGxpbmdoYW0ifQ=='

const lines = []
lines.push('-- Day 3 content seed')
for (const post of posts) {
  lines.push(`INSERT INTO public.blog_posts (slug, title, excerpt, body, author_label, cover_image_url, published, published_at, updated_at)
VALUES (
  '${post.slug}',
  '${sqlString(post.title)}',
  '${sqlString(post.excerpt)}',
  $body$${post.body}$body$,
  'LionXI',
  NULL,
  true,
  now(),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  author_label = EXCLUDED.author_label,
  published = true,
  published_at = COALESCE(blog_posts.published_at, now()),
  updated_at = now();
`)
}

lines.push(`INSERT INTO public.reference_squad (id, squad_param, label, updated_at)
VALUES (1, '${squadParam}', 'LionXI starter reference — Jul 2026', now())
ON CONFLICT (id) DO UPDATE SET
  squad_param = EXCLUDED.squad_param,
  label = EXCLUDED.label,
  updated_at = now();
`)

const sql = lines.join('\n')
writeFileSync(new URL('./day3-seed.sql', import.meta.url), sql, 'utf8')
console.log('Wrote scripts/day3-seed.sql', sql.length, 'chars')
