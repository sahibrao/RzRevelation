import { supabase } from './supabase'
import type {
  DbTeam,
  DbAnnouncement,
  DbProfile,
  DbPlayer,
  DbDiscordIdentity,
  DbMemberInvite,
  Member,
  TeamRole,
} from './types'
import { teams as seedTeams, announcements as seedAnnouncements } from '../data/placeholders'

// ── Fallback helpers (used when Supabase isn't configured) ───

function placeholderTeams(): DbTeam[] {
  return seedTeams.map((t, i) => ({
    id: t.slug,
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    blurb: t.blurb,
    accent: t.accent,
    sort_order: i,
    created_at: new Date().toISOString(),
    players: t.roster.map((p, j) => ({
      id: p.id,
      team_id: t.slug,
      profile_id: null,
      gamertag: p.gamertag,
      full_name: p.name,
      role: p.role,
      main_hero: p.main,
      accent: p.accent,
      bio: p.bio,
      sort_order: j,
      created_at: new Date().toISOString(),
    })),
  }))
}

function placeholderAnnouncements(): DbAnnouncement[] {
  return seedAnnouncements.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    excerpt: a.excerpt,
    body: null,
    published_at: new Date(a.date).toISOString(),
    created_at: new Date(a.date).toISOString(),
    author: { display_name: a.author, avatar_url: null },
  }))
}

// ── Query functions ──────────────────────────────────────────

export async function fetchTeams(): Promise<DbTeam[]> {
  if (!supabase) return placeholderTeams()

  const { data, error } = await supabase
    .from('teams')
    .select('*, players(*)')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'players' })

  if (error) {
    console.error('[db] fetchTeams:', error.message)
    return placeholderTeams()
  }
  return (data ?? []) as DbTeam[]
}

export async function fetchTeam(slug: string): Promise<DbTeam | null> {
  if (!supabase) return placeholderTeams().find((t) => t.slug === slug) ?? null

  const { data, error } = await supabase
    .from('teams')
    .select('*, players(*)')
    .eq('slug', slug)
    .order('sort_order', { referencedTable: 'players' })
    .single()

  if (error) {
    console.error('[db] fetchTeam:', error.message)
    return placeholderTeams().find((t) => t.slug === slug) ?? null
  }
  return data as DbTeam
}

export async function fetchAnnouncements(): Promise<DbAnnouncement[]> {
  if (!supabase) return placeholderAnnouncements()

  const { data, error } = await supabase
    .from('announcements')
    .select('*, author:profiles(display_name, avatar_url)')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[db] fetchAnnouncements:', error.message)
    return placeholderAnnouncements()
  }
  return (data ?? []) as DbAnnouncement[]
}

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[db] fetchProfile:', error.message)
    return null
  }
  return data as DbProfile
}

// ── Team / roster management (admins, captains, coaches) ────────
// Row Level Security enforces who can actually write what — these just
// surface a friendly error when Supabase isn't configured or the write
// gets rejected server-side.

type MutationResult = { error: string | null }

const NOT_CONFIGURED: MutationResult = { error: 'Supabase is not configured.' }

export async function updateTeamDetails(
  teamId: string,
  updates: { tagline?: string; blurb?: string },
): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase.from('teams').update(updates).eq('id', teamId)
  return { error: error?.message ?? null }
}

export async function createPlayer(
  player: Omit<DbPlayer, 'created_at'>,
): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase.from('players').insert(player)
  return { error: error?.message ?? null }
}

export async function updatePlayer(
  playerId: string,
  updates: Partial<Omit<DbPlayer, 'id' | 'team_id' | 'created_at'>>,
): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase.from('players').update(updates).eq('id', playerId)
  return { error: error?.message ?? null }
}

export async function deletePlayer(playerId: string): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase.from('players').delete().eq('id', playerId)
  return { error: error?.message ?? null }
}

// ── Member management (admins only) ─────────────────────────────
// Adding people to a team happens by Discord ID. If that account has already
// signed in we apply the role straight away; if it hasn't, we park an invite
// that the sign-up trigger claims on their first login. RLS restricts both
// tables to admins — these calls just surface the rejection.

/** Everyone with an account, joined to their Discord ID where we know it. */
export async function fetchMembers(): Promise<Member[]> {
  if (!supabase) return []

  const [profiles, identities] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at'),
    supabase.from('discord_identities').select('*'),
  ])

  if (profiles.error) {
    console.error('[db] fetchMembers:', profiles.error.message)
    return []
  }
  // non-admins simply get nothing back here; the page gates on role anyway
  if (identities.error) console.error('[db] fetchMembers identities:', identities.error.message)

  const byProfile = new Map(
    ((identities.data ?? []) as DbDiscordIdentity[]).map((i) => [i.profile_id, i]),
  )

  return ((profiles.data ?? []) as DbProfile[]).map((p) => ({
    ...p,
    discord_id: byProfile.get(p.id)?.discord_id ?? null,
    discord_username: byProfile.get(p.id)?.username ?? null,
  }))
}

/** Invites for Discord accounts that haven't signed in yet. */
export async function fetchMemberInvites(): Promise<DbMemberInvite[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('member_invites')
    .select('*')
    .is('claimed_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[db] fetchMemberInvites:', error.message)
    return []
  }
  return (data ?? []) as DbMemberInvite[]
}

type AddMemberInput = {
  discordId: string
  teamId: string
  role: TeamRole
  playerId?: string | null
  displayName?: string | null
  invitedBy: string
}

type AddMemberResult = MutationResult & {
  /** 'linked' — applied to a live account. 'invited' — waiting on first sign-in. */
  outcome?: 'linked' | 'invited'
  member?: Member
}

export async function addTeamMember(input: AddMemberInput): Promise<AddMemberResult> {
  if (!supabase) return NOT_CONFIGURED

  const { data: identity, error: lookupError } = await supabase
    .from('discord_identities')
    .select('profile_id')
    .eq('discord_id', input.discordId)
    .maybeSingle()

  if (lookupError) return { error: lookupError.message }

  // Already signed in at least once — apply the role now.
  if (identity) {
    const profileId = (identity as Pick<DbDiscordIdentity, 'profile_id'>).profile_id
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    if (profileError) return { error: profileError.message }

    const existing = data as DbProfile

    // Demoting an admin here would be a one-way trip — there's no UI to undo it.
    if (existing.role === 'admin') {
      return {
        error: `${existing.display_name ?? 'That account'} is an org admin. Admin is granted in SQL, so it has to be changed there too.`,
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: input.role, team_id: input.teamId })
      .eq('id', profileId)
    if (error) return { error: error.message }

    if (input.playerId) {
      const link = await linkPlayerToProfile(input.playerId, profileId)
      if (link.error) return { error: link.error }
    }

    return {
      error: null,
      outcome: 'linked',
      member: {
        ...existing,
        role: input.role,
        team_id: input.teamId,
        discord_id: input.discordId,
        discord_username: null,
      },
    }
  }

  // No account yet — park it until they sign in with Discord.
  const { error } = await supabase.from('member_invites').upsert(
    {
      discord_id: input.discordId,
      display_name: input.displayName?.trim() || null,
      team_id: input.teamId,
      role: input.role,
      player_id: input.playerId || null,
      invited_by: input.invitedBy,
      claimed_at: null,
      claimed_by: null,
    },
    { onConflict: 'discord_id' },
  )
  if (error) return { error: error.message }
  return { error: null, outcome: 'invited' }
}

export async function updateMember(
  profileId: string,
  updates: { role?: TeamRole; team_id?: string | null },
): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase.from('profiles').update(updates).eq('id', profileId)
  return { error: error?.message ?? null }
}

/** Drop someone off their team: back to plain member, roster spot released. */
export async function removeMemberFromTeam(profileId: string): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error: unlinkError } = await supabase
    .from('players')
    .update({ profile_id: null })
    .eq('profile_id', profileId)
  if (unlinkError) return { error: unlinkError.message }

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'member', team_id: null })
    .eq('id', profileId)
  return { error: error?.message ?? null }
}

/**
 * Point a roster card at an account (or clear it). One account can only hold
 * one spot, so any previous card for that profile is released first.
 */
export async function linkPlayerToProfile(
  playerId: string,
  profileId: string | null,
): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  if (profileId) {
    const { error: clearError } = await supabase
      .from('players')
      .update({ profile_id: null })
      .eq('profile_id', profileId)
      .neq('id', playerId)
    if (clearError) return { error: clearError.message }
  }

  const { error } = await supabase
    .from('players')
    .update({ profile_id: profileId })
    .eq('id', playerId)
  return { error: error?.message ?? null }
}

export async function updateMemberInvite(
  discordId: string,
  updates: { role?: TeamRole; team_id?: string; player_id?: string | null },
): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase
    .from('member_invites')
    .update(updates)
    .eq('discord_id', discordId)
  return { error: error?.message ?? null }
}

export async function deleteMemberInvite(discordId: string): Promise<MutationResult> {
  if (!supabase) return NOT_CONFIGURED

  const { error } = await supabase.from('member_invites').delete().eq('discord_id', discordId)
  return { error: error?.message ?? null }
}
