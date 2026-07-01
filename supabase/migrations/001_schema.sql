-- ============================================================
-- RzRevelation — initial schema
-- Run once in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- teams (created first; profiles has a FK to it)
create table if not exists public.teams (
  id         uuid        primary key default gen_random_uuid(),
  slug       text        unique not null,
  name       text        not null,
  tagline    text        not null,
  blurb      text        not null,
  accent     text        not null check (accent in ('orange', 'sky')),
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

-- one profile per auth user; role defaults to 'member' on sign-up
create table if not exists public.profiles (
  id           uuid        references auth.users on delete cascade primary key,
  display_name text,
  avatar_url   text,
  role         text        not null default 'member'
                           check (role in ('admin', 'captain', 'player', 'member')),
  team_id      uuid        references public.teams on delete set null,
  created_at   timestamptz not null default now()
);

-- roster players per team; optionally linked to a profile when the player has an account
create table if not exists public.players (
  id         text        primary key,
  team_id    uuid        references public.teams    on delete cascade not null,
  profile_id uuid        references public.profiles on delete set null,
  gamertag   text        not null,
  full_name  text        not null,
  role       text        not null check (role in ('Vanguard', 'Duelist', 'Strategist')),
  main_hero  text        not null,
  accent     text        not null check (accent in ('orange', 'sky')),
  bio        text        not null,
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

-- blog / news posts; author_id is null for org-wide staff posts
create table if not exists public.announcements (
  id           text        primary key,
  title        text        not null,
  category     text        not null,
  excerpt      text        not null,
  body         text,
  author_id    uuid        references public.profiles on delete set null,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- ── Trigger: auto-create profile on Discord sign-up ──────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Helper: read the calling user's role ─────────────────────

create or replace function public.auth_role()
returns text language sql security definer
set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── Row Level Security ────────────────────────────────────────

alter table public.teams         enable row level security;
alter table public.profiles      enable row level security;
alter table public.players       enable row level security;
alter table public.announcements enable row level security;

-- teams: anyone can read; only admins can write
create policy "teams_select" on public.teams
  for select using (true);
create policy "teams_insert" on public.teams
  for insert with check (public.auth_role() = 'admin');
create policy "teams_update" on public.teams
  for update using (public.auth_role() = 'admin');
create policy "teams_delete" on public.teams
  for delete using (public.auth_role() = 'admin');

-- profiles: anyone can read; users can only write their own row
create policy "profiles_select" on public.profiles
  for select using (true);
create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- players: anyone can read; admins and captains can write
create policy "players_select" on public.players
  for select using (true);
create policy "players_insert" on public.players
  for insert with check (public.auth_role() in ('admin', 'captain'));
create policy "players_update" on public.players
  for update using (public.auth_role() in ('admin', 'captain'));
create policy "players_delete" on public.players
  for delete using (public.auth_role() in ('admin', 'captain'));

-- announcements: anyone can read; admins and captains can write
create policy "announcements_select" on public.announcements
  for select using (true);
create policy "announcements_insert" on public.announcements
  for insert with check (public.auth_role() in ('admin', 'captain'));
create policy "announcements_update" on public.announcements
  for update using (public.auth_role() in ('admin', 'captain'));
create policy "announcements_delete" on public.announcements
  for delete using (public.auth_role() in ('admin', 'captain'));
