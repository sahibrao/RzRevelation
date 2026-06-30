# Rz Esports

Site for **Rz Esports** — a competitive Marvel Rivals house with three rosters
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
- ✅ Cloudflare Pages SPA routing (`public/_redirects`)
- ⏳ Comments, store checkout, admin roles — upcoming phases

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
│  └─ favicon.svg
├─ src/
│  ├─ components/         # Navbar, Footer, Layout, cards, PageHeader
│  ├─ pages/              # Home, Store, Blog, Team, Contact
│  ├─ data/placeholders.ts
│  ├─ lib/supabase.ts
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

## Roadmap

1. ~~Frontend skeleton~~ ✓
2. ~~Discord sign-in + account menu + Settings~~ ✓ ← you are here
3. Admin roles (multiple admins) + Supabase data model — announcements, comments, products, profiles (with RLS)
4. Pages wired to live data
5. Store + Stripe checkout
6. Admin panel
7. Deploy to Cloudflare Pages
