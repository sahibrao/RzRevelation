-- ============================================================
-- RzRevelation — team roles & scoped permissions
-- Run AFTER 001_schema.sql (and after seed.sql if you've already run it)
-- in the Supabase SQL editor (Dashboard → SQL Editor → New query)
--
-- What this adds:
--   • a 'coach' role, alongside the existing admin/captain/player/member
--   • admins keep full access to everything (teams, players, announcements,
--     everyone's profile)
--   • captains and coaches can only edit their OWN team: its tagline/blurb
--     and its roster (add, edit, remove players) — not other teams, and not
--     the team's identity fields (slug/name/accent/sort_order)
--   • new sign-ins whose Discord user ID is in ADMIN_DISCORD_IDS below are
--     auto-promoted to admin — see step 1
--   • closes a gap in 001: previously ANY signed-in user could grant
--     themselves admin by updating their own profiles row, since the RLS
--     policy only checked row ownership, not which columns changed
-- ============================================================

-- ── 1. Allow the 'coach' role ─────────────────────────────────

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'captain', 'coach', 'player', 'member'));

-- ── 2. Helper: read the calling user's team ───────────────────

create or replace function public.auth_team_id()
returns uuid language sql security definer
set search_path = public as $$
  select team_id from public.profiles where id = auth.uid()
$$;

-- ── 3. Auto-grant admin by Discord ID on sign-up ──────────────
--
-- Add the Discord user ID(s) of your org's admins below (the Discord
-- snowflake, not the username). To find yours: Discord app → User Settings
-- → Advanced → enable Developer Mode, then right-click your name in any
-- server → "Copy User ID".
--
-- This only fires for NEW sign-ins. To promote someone who already has an
-- account, run manually instead:
--   update public.profiles set role = 'admin' where id =
--     (select id from auth.users where raw_user_meta_data->>'provider_id' = '<their discord id>');
-- Same pattern works for role = 'captain' / 'coach', plus set team_id:
--   update public.profiles set role = 'captain', team_id =
--     (select id from public.teams where slug = 'revelation')
--   where id = (select id from auth.users where raw_user_meta_data->>'provider_id' = '<their discord id>');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  admin_discord_ids text[] := array[
    '687913571426107394'  -- Sahib
  ];
  discord_id text := new.raw_user_meta_data->>'provider_id';
begin
  insert into public.profiles (id, display_name, avatar_url, role)
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
    ),
    case when discord_id = any(admin_discord_ids) then 'admin' else 'member' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- (trigger itself is unchanged from 001 — re-declared here only because the
-- function body above replaces it; safe to run repeatedly)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 4. Lock down which profile columns non-admins can change ──
--
-- Without this, the old "profiles_update" policy (id = auth.uid()) let any
-- signed-in user set their own role/team_id to whatever they wanted.

create or replace function public.enforce_profile_edit_scope()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if public.auth_role() = 'admin' then
    return new;
  end if;
  if old.role is distinct from new.role or old.team_id is distinct from new.team_id then
    raise exception 'Only admins can change role or team assignment';
  end if;
  return new;
end;
$$;

drop trigger if exists profile_edit_scope on public.profiles;
create trigger profile_edit_scope
  before update on public.profiles
  for each row execute procedure public.enforce_profile_edit_scope();

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid() or public.auth_role() = 'admin')
  with check (id = auth.uid() or public.auth_role() = 'admin');

-- ── 5. Lock down which team columns captains/coaches can change ─
--
-- They may edit tagline/blurb (the "description") on their own team, but
-- not rename/re-slug/re-accent/reorder it — that stays admin-only.

create or replace function public.enforce_team_edit_scope()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if public.auth_role() = 'admin' then
    return new;
  end if;
  if old.slug is distinct from new.slug
     or old.name is distinct from new.name
     or old.accent is distinct from new.accent
     or old.sort_order is distinct from new.sort_order then
    raise exception 'Only admins can change team identity fields';
  end if;
  return new;
end;
$$;

drop trigger if exists team_edit_scope on public.teams;
create trigger team_edit_scope
  before update on public.teams
  for each row execute procedure public.enforce_team_edit_scope();

drop policy if exists "teams_update" on public.teams;
create policy "teams_update" on public.teams
  for update using (
    public.auth_role() = 'admin'
    or (public.auth_role() in ('captain', 'coach') and id = public.auth_team_id())
  );

-- ── 6. Scope player (roster) writes to the captain/coach's team ─

drop policy if exists "players_insert" on public.players;
create policy "players_insert" on public.players
  for insert with check (
    public.auth_role() = 'admin'
    or (public.auth_role() in ('captain', 'coach') and team_id = public.auth_team_id())
  );

drop policy if exists "players_update" on public.players;
create policy "players_update" on public.players
  for update using (
    public.auth_role() = 'admin'
    or (public.auth_role() in ('captain', 'coach') and team_id = public.auth_team_id())
  )
  with check (
    public.auth_role() = 'admin'
    or (public.auth_role() in ('captain', 'coach') and team_id = public.auth_team_id())
  );

drop policy if exists "players_delete" on public.players;
create policy "players_delete" on public.players
  for delete using (
    public.auth_role() = 'admin'
    or (public.auth_role() in ('captain', 'coach') and team_id = public.auth_team_id())
  );
