import { useState } from 'react'
import type { Character } from '../lib/characters'

function monogram(name: string) {
  const words = name.split(/[\s-]+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/**
 * Square portrait chip for a character. Falls back to a monogram when the
 * character has no art yet — or when the file it points at fails to load.
 */
export default function CharacterPortrait({
  character,
  name,
  className = 'hero-chip',
}: {
  character: Character | null
  /** Shown when there's no matching character — e.g. a legacy free-text hero. */
  name?: string
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  const label = character?.name ?? name ?? '?'
  const src = broken ? null : character?.image

  return (
    <span className={`${className} clip-sm`}>
      {src ? (
        <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <span aria-hidden="true">{monogram(label)}</span>
      )}
    </span>
  )
}
