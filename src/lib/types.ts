export type Accent = 'orange' | 'sky'
export type PlayerRole = 'Vanguard' | 'Duelist' | 'Strategist'
export type UserRole = 'admin' | 'captain' | 'player' | 'member'

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
