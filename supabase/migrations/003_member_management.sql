-- ============================================================
-- RzRevelation — member management
-- Run AFTER 002_team_roles.sql in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query)
--
-- What this adds:
--   • discord_identities — maps each profile to its Discord user ID, so admins
--     can find and manage people by Discord ID from the site instead of hand-
--     writing SQL. auth.users isn't readable from the browser; this is.
--   • member_invites — an admin can add someone who has NEVER signed in yet.
--     The role + team + roster spot are applied automatically the first time
--     that Discord account logs in.
--   • players.profile_id is now unique — one roster spot per account. That link
--     is what a future "players manage their own schedule" feature hangs off.
--
-- Admin stays a manual, SQL-only grant (the allowlist in 002). Everything this
-- migration enables is capped at captain / coach / player on purpose.
-- ============================================================

-- ── 1. Discord identity map ───────────────────────────────────

create table if not exists public.discord_identities (
  profile_id uuid        primary key references public.profiles on delete cascade,
  discord_id text        unique not null,
  username   text,
  created_at timestamptz not null default now()
);

-- Backfill everyone who has already signed in. Migrations run as the table
-- owner, so reading auth.users here is fine (the browser never can).
insert into public.discord_identities (profile_id, discord_id, username)
select p.id,
       u.raw_user_meta_data->>'provider_id',
       coalesce(
         u.raw_user_meta_data->>'preferred_username',
         u.raw_user_meta_data->>'name',
         u.raw_user_meta_data->>'full_name'
       )
from public.profiles p
join auth.users u on u.id = p.id
where u.raw_user_meta_data->>'provider_id' is not null
on conflict (profile_id) do nothing;

-- ── 2. Pending invites (people who haven't signed in yet) ─────

create table if not exists public.member_invites (
  discord_id   text        primary key,
  display_name text,
  team_id      uuid        not null references public.teams on delete cascade,
  role         text        not null check (role in ('captain', 'coach', 'player')),
  player_id    text        references public.players  on delete set null,
  invited_by   uuid        references public.profiles on delete set null,
  created_at   timestamptz not null default now(),
  claimed_at   timestamptz,
  claimed_by   uuid        references public.profiles on delete set null
);

create index if not exists member_invites_pending
  on public.member_invites (claimed_at) where claimed_at is null;

-- ── 3. One roster spot per account ────────────────────────────

create unique index if not exists players_profile_id_key
  on public.players (profile_id) where profile_id is not null;

-- ── 4. Sign-up trigger: record the Discord ID, claim any invite ─
--
-- Role and team are resolved BEFORE the profile row is inserted, deliberately:
-- updating profiles here would trip the enforce_profile_edit_scope trigger from
-- 002, since auth.uid() is null inside the sign-up transaction.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  -- Discord user IDs that get admin on first sign-in. Discord app → User
  -- Settings → Advanced → Developer Mode, then right-click a name → Copy User ID.
  admin_discord_ids text[] := array[
    '687913571426107394'  -- Sahib
  ];
  v_discord_id text := new.raw_user_meta_data->>'provider_id';
  v_username   text := coalesce(
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name'
  );
  v_is_admin boolean := v_discord_id is not null and v_discord_id = any(admin_discord_ids);
  v_invite   public.member_invites%rowtype;
begin
  -- an admin invite would be a privilege-escalation hole; the table's check
  -- constraint already caps invites at captain/coach/player
  if not v_is_admin and v_discord_id is not null then
    select * into v_invite
      from public.member_invites mi
     where mi.discord_id = v_discord_id
       and mi.claimed_at is null;
  end if;

  insert into public.profiles (id, display_name, avatar_url, role, team_id)
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
    case
      when v_is_admin then 'admin'
      when v_invite.discord_id is not null then v_invite.role
      else 'member'
    end,
    v_invite.team_id
  )
  on conflict (id) do nothing;

  if v_discord_id is null then
    return new;
  end if;

  -- an ID can only map to one profile; the live account wins, so a stale row
  -- can never raise a unique violation and fail the whole sign-up
  delete from public.discord_identities
   where discord_id = v_discord_id and profile_id <> new.id;

  insert into public.discord_identities (profile_id, discord_id, username)
  values (new.id, v_discord_id, v_username)
  on conflict (profile_id) do update
    set discord_id = excluded.discord_id,
        username   = excluded.username;

  if v_invite.discord_id is null then
    return new;
  end if;

  -- hand them the roster spot the admin reserved, if any
  if v_invite.player_id is not null then
    update public.players set profile_id = new.id where id = v_invite.player_id;
  end if;

  update public.member_invites mi
     set claimed_at = now(), claimed_by = new.id
   where mi.discord_id = v_discord_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. Keep the Discord identity fresh on later sign-ins ──────
--
-- Usernames change; the ID never does. This keeps the admin list readable.

create or replace function public.sync_discord_identity()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  v_discord_id text := new.raw_user_meta_data->>'provider_id';
begin
  -- never let a metadata refresh break sign-in if the profile is missing
  if v_discord_id is null
     or not exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

  delete from public.discord_identities
   where discord_id = v_discord_id and profile_id <> new.id;

  insert into public.discord_identities (profile_id, discord_id, username)
  values (
    new.id,
    v_discord_id,
    coalesce(
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name'
    )
  )
  on conflict (profile_id) do update
    set discord_id = excluded.discord_id,
        username   = excluded.username;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of raw_user_meta_data on auth.users
  for each row execute procedure public.sync_discord_identity();

-- ── 6. Row Level Security ─────────────────────────────────────
--
-- Discord IDs stay out of the world-readable profiles table on purpose: anyone
-- can read profiles (the blog joins it for author names), and a public list of
-- every member's Discord ID is a free DM-spam target.

alter table public.discord_identities enable row level security;
alter table public.member_invites     enable row level security;

drop policy if exists "discord_identities_select" on public.discord_identities;
create policy "discord_identities_select" on public.discord_identities
  for select using (profile_id = auth.uid() or public.auth_role() = 'admin');

drop policy if exists "discord_identities_admin" on public.discord_identities;
create policy "discord_identities_admin" on public.discord_identities
  for all using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

drop policy if exists "member_invites_admin" on public.member_invites;
create policy "member_invites_admin" on public.member_invites
  for all using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');
