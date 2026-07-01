import type { DbPlayer } from '../lib/types'

function initials(tag: string) {
  return tag.slice(0, 2).toUpperCase()
}

export default function PlayerCard({ player }: { player: DbPlayer }) {
  return (
    <article className="panel clip">
      <span className="bracket" />
      <div className={`avatar avatar-${player.accent}`}>
        <span aria-hidden="true">{initials(player.gamertag)}</span>
        <span className="avatar-tag">
          <span className={player.accent === 'orange' ? 'tag tag-orange' : 'tag'}>{player.main_hero}</span>
        </span>
      </div>
      <div style={{ padding: '1.1rem 1.15rem 1.3rem' }}>
        <div className="flex items-center justify-between gap-3">
          <h3 style={{ fontSize: '1.35rem' }}>{player.gamertag}</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-sky)' }}>
            {player.role}
          </span>
        </div>
        <p style={{ color: 'var(--color-mute)', fontSize: '0.82rem', margin: '0.15rem 0 0.7rem' }}>
          {player.full_name}
        </p>
        <p style={{ color: 'var(--color-fog)', opacity: 0.78, fontSize: '0.9rem', lineHeight: 1.55 }}>
          {player.bio}
        </p>
      </div>
    </article>
  )
}
