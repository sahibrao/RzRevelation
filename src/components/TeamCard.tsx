import { Link } from 'react-router-dom'
import type { Team } from '../data/placeholders'

export default function TeamCard({ team }: { team: Team }) {
  const accentColor = team.accent === 'orange' ? 'var(--color-orange)' : 'var(--color-sky)'

  return (
    <Link
      to={`/team/${team.slug}`}
      className="panel clip"
      style={{ display: 'block', position: 'relative', padding: '0' }}
      aria-label={`${team.name} roster`}
    >
      <span className="bracket" />
      <div style={{ height: 4, background: accentColor }} />
      <div style={{ padding: '1.5rem 1.5rem 1.4rem' }}>
        <p className="eyebrow">{team.tagline}</p>
        <h3 style={{ fontSize: '1.7rem', margin: '0.7rem 0 0.6rem' }}>{team.name}</h3>
        <p
          style={{
            color: 'var(--color-mute)',
            lineHeight: 1.55,
            fontSize: '0.92rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {team.blurb}
        </p>

        <div className="flex items-center gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
          {team.roster.slice(0, 4).map((p) => (
            <span key={p.id} className="tag">{p.gamertag}</span>
          ))}
          <span className="tag tag-orange">+{team.roster.length - 4} more</span>
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: '1.4rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-mute)' }}>
            {team.roster.length} players
          </span>
          <span style={{ color: accentColor, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.92rem' }}>
            View roster →
          </span>
        </div>
      </div>
    </Link>
  )
}
