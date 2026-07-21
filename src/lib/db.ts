import { supabase } from './supabase'
import type { DbTeam, DbAnnouncement, DbProfile, DbPlayer } from './types'
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
