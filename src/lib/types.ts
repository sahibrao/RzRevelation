export type Accent = 'orange' | 'sky'
export type PlayerRole = 'Vanguard' | 'Duelist' | 'Strategist'
export type UserRole = 'admin' | 'captain' | 'coach' | 'player' | 'member'

/** Roles an admin can hand out from the site. `admin` stays a manual SQL grant. */
export type TeamRole = 'captain' | 'coach' | 'player'

export type DbProfile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  team_id: string | null
  created_at: string
}

export type DbPlayer = {
  id: string
  team_id: string
  profile_id: string | null
  gamertag: string
  full_name: string
  role: PlayerRole
  main_hero: string
  accent: Accent
  bio: string
  sort_order: number
  created_at: string
}

export type DbTeam = {
  id: string
  slug: string
  name: string
  tagline: string
  blurb: string
  accent: Accent
  sort_order: number
  created_at: string
  players: DbPlayer[]
}

/** profiles ↔ Discord user ID. Admin-readable only (plus your own row). */
export type DbDiscordIdentity = {
  profile_id: string
  discord_id: string
  username: string | null
  created_at: string
}

/**
 * A team slot reserved for a Discord account that hasn't signed in yet. The
 * sign-up trigger applies the role/team/roster spot on their first login.
 */
export type DbMemberInvite = {
  discord_id: string
  display_name: string | null
  team_id: string
  role: TeamRole
  player_id: string | null
  invited_by: string | null
  created_at: string
  claimed_at: string | null
  claimed_by: string | null
}

/** A profile plus its Discord identity — what the admin member list renders. */
export type Member = DbProfile & {
  discord_id: string | null
  discord_username: string | null
}

export type DbAnnouncement = {
  id: string
  title: string
  category: string
  excerpt: string
  body: string | null
  published_at: string
  created_at: string
  author: Pick<DbProfile, 'display_name' | 'avatar_url'> | null
}
