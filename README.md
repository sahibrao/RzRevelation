# RzRevelation

Site for **RzRevelation** — a competitive Marvel Rivals house with three rosters
(Rz Recharge, Rz Revelation, Rz Revenants).
Built with React + TypeScript + Vite + Tailwind, backed by Supabase, with Stripe for the store. Deploys to Cloudflare Pages.

This includes the **themed frontend skeleton** (navigation, all five pages, the full
design system, placeholder content) plus **Discord sign-in** with an account menu and a
Settings page. Live data and payments come next.

---

## What's in this build

- ✅ Vite + React 18 + TypeScript
- ✅ Tailwind v4 design system in `src/index.css` (your navy / orange / sky / black palette as tokens)
- ✅ Angular "HUD" visual identity — clipped panels, accent brackets, gamer typography
- ✅ Responsive navbar (with mobile menu) + footer
- ✅ Pages: **Home**, **Store**, **Blog**, **Teams** (with per-team roster pages), **Contact**
- ✅ Placeholder roster, products, and announcements (`src/data/placeholders.ts`)
- ✅ Supabase client + auth provider (`src/lib/supabase.ts`, `src/lib/auth.tsx`)
- ✅ Discord sign-in, account menu in the navbar, **Settings** page, protected routes
- ✅ Supabase data model — teams, players, announcements, profiles (`supabase/migrations/`)
- ✅ Roles: **admin** (full access), **captain** / **coach** (edit their own team's roster + description), **player** / **member** (read-only) — see [Roles & permissions](#roles--permissions)
- ✅ Admin UI at `/admin` — add players/captains/coaches to a team by Discord ID, change or remove them later, no SQL
- ✅ Cloudflare Pages SPA routing (`public/_redirects`)
- ✅ Dark / light mode — toggle in the navbar, remembers your choice, follows the OS until you pick
- ✅ Character library in `src/content/characters/` — one markdown file per Marvel Rivals hero, powering the roster hero picker and player-card portraits
- ⏳ Comments, store checkout — upcoming phases

## Prerequisites

- Node.js 18+ and npm

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## Project structure

```
rzrevelation/
├─ public/
│  ├─ _redirects          # SPA fallback for Cloudflare Pages
│  ├─ logo.png            # brand mark (navbar, footer, apple-touch-icon)
│  └─ favicon.png         # 64x64 crop of the mark
├─ src/
│  ├─ components/         # Navbar, Footer, Layout, cards, PageHeader, HeroPicker
│  ├─ pages/              # Home, Store, Blog, Team, Contact
│  ├─ content/characters/ # one .md per playable character (+ optional portrait art)
│  ├─ data/placeholders.ts
│  ├─ lib/supabase.ts
│  ├─ lib/characters.ts   # loads the character folder at build time
│  ├─ lib/theme.tsx       # dark/light provider
│  ├─ index.css           # design tokens + component styles (the identity lives here)
│  ├─ App.tsx             # routes
│  └─ main.tsx
├─ .env.example
└─ vite.config.ts
```

## Palette

| Token            | Hex       | Role                         |
| ---------------- | --------- | ---------------------------- |
| `navy-900`       | `#0A1628` | Primary field / background   |
| `orange`         | `#FF6A1A` | Heat — CTAs, highlights      |
| `sky`            | `#4EA8E8` | Cool trim — links, accents   |
| `ink`            | `#05080F` | Black detailing — depth      |

Change these in the `@theme` block at the top of `src/index.css` and the whole site follows.

## Dark & light mode

`src/index.css` has two layers. The `@theme` block is the fixed brand palette; below
it, `:root` defines the **semantic tokens** everything actually reads from
(`--surface-1`, `--border`, `--page-bg`, `--color-fog`, …), and
`:root[data-theme="light"]` re-points those for light mode.

When you add a colour, add it as a semantic token — a raw hex in a component will
look wrong in one of the two themes.

The theme lives on `<html data-theme="…">`. A small script in `index.html` sets it
before first paint so light mode doesn't flash navy; `src/lib/theme.tsx` owns it
after that, persists the choice to `localStorage` under `rz-theme`, and follows
`prefers-color-scheme` until someone hits the toggle. The toggle is the sun/moon
button in the navbar (and a row in the mobile menu).

Two surfaces stay dark in both themes on purpose: player-card art plates
(`.avatar`) and store swatches (`.swatch`).

## Characters

Every playable character is a markdown file in `src/content/characters/`:

```markdown
---
name: Hela
role: Duelist
---

Goddess of Death, raining soul daggers from above.
```

Captains and coaches pick from these on **Manage team** instead of typing a hero
name, and the choice drives the portrait on the public roster card.

**Artwork is optional.** Drop `hela.png` next to `hela.md` and it's picked up
automatically — `.png`, `.jpg`, `.webp`, and `.avif` all work, cropped 4:5 from the
top on player cards. Anything without art falls back to a monogram, so the picker
works fine before the images land. See `src/content/characters/_README.md` for the
full convention.

---

## Enable sign-in (Discord)

The auth code is live — sign-in, the account menu, and the Settings page all work as
soon as you connect Supabase + Discord. No keys are needed to browse the static pages;
until they're added, the "Sign in" button is inert and `/settings` shows a config notice.

1. **Supabase project** — create one, then copy the Project URL and the
   **publishable key** (`sb_publishable_…`) — the legacy **anon** key also works —
   from **Project Settings → API Keys** into a `.env.local` file (copy `.env.example`).

2. **Discord application** — in the
   [Discord Developer Portal](https://discord.com/developers/applications), create an app.
   Under **OAuth2**, add a redirect:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   Copy the **Client ID** and **Client Secret**.

3. **Connect them in Supabase** — Authentication → Providers → **Discord**: enable it and
   paste the Client ID + Secret.

4. **Set the redirect URLs** — Authentication → URL Configuration:
   set **Site URL** to `http://localhost:5173` (for dev) and add `http://localhost:5173/**`
   (and your production URL later) under **Redirect URLs**.

5. **Restart** `npm run dev` after creating `.env.local`.

## Roles & permissions

Run the SQL in `supabase/migrations/` in order, in the Supabase SQL editor:
`001_schema.sql` (tables + RLS), then `supabase/seed.sql` (sample teams/players),
then `002_team_roles.sql` (roles, scoping, the profile-self-promotion fix), then
`003_member_management.sql` (Discord ID map + pending invites, powering `/admin`).

Every signed-in user gets a `profiles` row (via a trigger on `auth.users`) with role
`member` by default. Roles:

| Role                | Can do |
| ------------------- | ------ |
| `admin`              | Everything — create/edit/delete any team, roster, or announcement; change anyone's role |
| `captain` / `coach`  | Edit their **own** team's tagline/blurb and roster (add, edit, remove players) at `/manage` |
| `player` / `member`  | Read-only; can edit their own display name in Settings |

**Granting admin:** still deliberately SQL-only. Add the Discord user ID to the
`admin_discord_ids` array in `003_member_management.sql` (it supersedes the copy in
`002`) and re-run that file — Discord app → User Settings → Advanced → enable Developer
Mode, then right-click your name → Copy User ID. Anyone signing in for the first time
with a listed ID becomes an admin automatically. To promote an account that already
exists, run:

```sql
update public.profiles set role = 'admin'
where id = (select profile_id from public.discord_identities where discord_id = '<their discord id>');
```

**Adding players, captains, and coaches:** admins do this at **`/admin`** (Members &
roles, in the account menu) — no SQL.

- Paste someone's **Discord user ID**, pick a **team** and a **role** (Player / Captain /
  Coach), and optionally link them to a **roster card** from that team.
- If that Discord account has signed in before, the role applies immediately. If it never
  has, the invite parks in `member_invites` and the sign-up trigger applies the role, team,
  and roster card the first time they log in with Discord.
- Roles and teams can be changed at any time from the same page, and **Remove** drops
  someone back to a plain member and frees their roster card (their account stays).
- Anyone who has already signed in but has no team shows under **No team**, so you can add
  them without hunting for their ID.

Linking an account to a roster card (`players.profile_id`, now unique per account) is what
a future "players manage their own schedule" feature hangs off — that's why the option is
there before there's anything to schedule.

Discord IDs live in their own `discord_identities` table, readable only by admins and the
account itself, rather than on the world-readable `profiles` table.

## Roadmap

1. ~~Frontend skeleton~~ ✓
2. ~~Discord sign-in + account menu + Settings~~ ✓
3. ~~Supabase data model + roles (admin/captain/coach) with RLS~~ ✓
4. ~~Admin UI for adding members + assigning roles~~ ✓ ← you are here
5. Player schedules (hangs off the account ↔ roster-card link)
6. Admin UI for posting announcements
7. Store + Stripe checkout
8. Deploy to Cloudflare Pages
