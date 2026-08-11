import type { PlayerRole } from './types'

/**
 * The playable-character list, built at bundle time from `src/content/characters/`.
 *
 * One markdown file per character:
 *
 *   ---
 *   name: Doctor Strange
 *   role: Vanguard
 *   ---
 *
 *   Sorcerer Supreme — shields, portals, and the Dark Dimension.
 *
 * Artwork is optional. Drop `doctor-strange.png` next to `doctor-strange.md`
 * and it gets picked up automatically; anything without art falls back to a
 * monogram. `image: /some/path.png` in the frontmatter overrides the match.
 */

/** `Flex` covers Deadpool, who isn't locked to one role. */
export type CharacterRole = PlayerRole | 'Flex'

export type Character = {
  slug: string
  name: string
  role: CharacterRole
  /** Resolved URL for the portrait, or null when no art has been added yet. */
  image: string | null
  description: string
}

const ROLES: CharacterRole[] = ['Vanguard', 'Duelist', 'Strategist', 'Flex']

/** Role display order, so pickers group the same way the game does. */
const ROLE_ORDER: Record<CharacterRole, number> = { Vanguard: 0, Duelist: 1, Strategist: 2, Flex: 3 }

const markdownFiles = import.meta.glob('../content/characters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const artFiles = import.meta.glob('../content/characters/*.{png,jpg,jpeg,webp,avif}', {
  import: 'default',
  eager: true,
}) as Record<string, string>

function basename(path: string) {
  return path.split('/').pop()!.replace(/\.[^.]+$/, '')
}

/** Minimal `key: value` frontmatter reader — enough for name/role/image. */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw.trim())
  if (!match) return { data: {}, body: raw.trim() }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '')
    if (key) data[key] = value
  }
  return { data, body: match[2].trim() }
}

const artBySlug = new Map<string, string>()
for (const [path, url] of Object.entries(artFiles)) {
  artBySlug.set(basename(path), url)
}

function toCharacter(path: string, raw: string): Character {
  const slug = basename(path)
  const { data, body } = parseFrontmatter(raw)
  const role = ROLES.includes(data.role as CharacterRole) ? (data.role as CharacterRole) : 'Flex'

  return {
    slug,
    name: data.name || slug,
    role,
    image: data.image || artBySlug.get(slug) || null,
    description: body,
  }
}

/** Every character, grouped by role then alphabetical. `_`-prefixed files
 *  (like `_README.md`) are notes for humans, not characters. */
export const CHARACTERS: Character[] = Object.entries(markdownFiles)
  .filter(([path]) => !basename(path).startsWith('_'))
  .map(([path, raw]) => toCharacter(path, raw))
  .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name))

export const CHARACTER_ROLES = ROLES

/** Lowercase, `&` spelled out, punctuation dropped — so "Cloak & Dagger",
 *  "cloak-and-dagger" and "Cloak and Dagger" all land on the same key. */
function normalizeKey(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '')
}

/** Older roster rows were free text, so accept the shorthands people typed. */
const ALIASES: Record<string, string> = {
  drstrange: 'doctor-strange',
  strange: 'doctor-strange',
  cap: 'captain-america',
  capamerica: 'captain-america',
  punisher: 'the-punisher',
  frankcastle: 'the-punisher',
  thing: 'the-thing',
  hood: 'the-hood',
  jeff: 'jeff-the-land-shark',
  jefftheshark: 'jeff-the-land-shark',
  landshark: 'jeff-the-land-shark',
  bucky: 'winter-soldier',
  rocket: 'rocket-raccoon',
  mrfantastic: 'mister-fantastic',
  reedrichards: 'mister-fantastic',
  logan: 'wolverine',
  peni: 'peni-parker',
  starlord: 'star-lord',
  jeangrey: 'phoenix',
}

const byKey = new Map<string, Character>()
for (const character of CHARACTERS) {
  byKey.set(normalizeKey(character.slug), character)
  byKey.set(normalizeKey(character.name), character)
}

/** Resolve a stored `main_hero` string to a character, or null if it's custom. */
export function findCharacter(value: string | null | undefined): Character | null {
  if (!value) return null
  const key = normalizeKey(value)
  const alias = ALIASES[key]
  return byKey.get(alias ? normalizeKey(alias) : key) ?? null
}

/** Portrait URL for a stored hero name, or null when there's no art for it. */
export function characterImage(value: string | null | undefined): string | null {
  return findCharacter(value)?.image ?? null
}
