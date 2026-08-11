import { useEffect, useMemo, useRef, useState } from 'react'
import { CHARACTERS, CHARACTER_ROLES, findCharacter } from '../lib/characters'
import type { CharacterRole } from '../lib/characters'
import CharacterPortrait from './CharacterPortrait'

/**
 * Character selector for a roster slot. Stores the character's display name,
 * so rows written before this existed keep working — an unrecognised value is
 * shown as-is and labelled, rather than being silently dropped.
 */
export default function HeroPicker({
  value,
  onChange,
  id,
  labelledBy,
}: {
  value: string
  onChange: (name: string) => void
  id?: string
  /** id of the element labelling this control. */
  labelledBy?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<CharacterRole | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = findCharacter(value)

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()

    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return CHARACTERS.filter((c) => {
      if (roleFilter && c.role !== roleFilter) return false
      return !needle || c.name.toLowerCase().includes(needle)
    })
  }, [query, roleFilter])

  const pick = (name: string) => {
    onChange(name)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        id={id}
        type="button"
        className="hero-trigger clip-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        onClick={() => setOpen((v) => !v)}
      >
        <CharacterPortrait character={selected} name={value} />
        <span style={{ flex: 1, minWidth: 0 }}>
          {value ? (
            <>
              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selected?.name ?? value}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-mute)' }}>
                {selected ? selected.role : 'Not in the character list'}
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--color-mute)' }}>Choose a character…</span>
          )}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ color: 'var(--color-mute)', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="hero-pop clip-sm">
          <div className="hero-pop-head">
            <input
              ref={searchRef}
              className="field clip-sm"
              style={{ padding: '0.5rem 0.7rem', fontSize: '0.88rem' }}
              placeholder="Search characters…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="hero-filters">
              <button
                type="button"
                className="hero-filter clip-sm"
                aria-pressed={roleFilter === null}
                onClick={() => setRoleFilter(null)}
              >
                All
              </button>
              {CHARACTER_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className="hero-filter clip-sm"
                  aria-pressed={roleFilter === role}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {results.length === 0 ? (
            <p className="hero-empty">No character matches “{query}”.</p>
          ) : (
            <div className="hero-grid" role="listbox" aria-label="Characters">
              {results.map((character) => (
                <button
                  key={character.slug}
                  type="button"
                  role="option"
                  aria-selected={selected?.slug === character.slug}
                  className="hero-option clip-sm"
                  title={character.description}
                  onClick={() => pick(character.name)}
                >
                  <CharacterPortrait character={character} />
                  <span>{character.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
