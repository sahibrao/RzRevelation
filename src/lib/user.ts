import type { User } from '@supabase/supabase-js'

/** Best available display name from the Discord identity / metadata. */
export function displayName(user: User): string {
  const m = (user.user_metadata ?? {}) as Record<string, unknown>
  return (
    (m.display_name as string) ||
    (m.full_name as string) ||
    (m.name as string) ||
    user.email ||
    'Member'
  )
}

/** Discord avatar URL, if present. */
export function avatarUrl(user: User): string | undefined {
  const m = (user.user_metadata ?? {}) as Record<string, unknown>
  return (m.avatar_url as string) || (m.picture as string) || undefined
}

/** 1–2 letter fallback for when there is no avatar image. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
