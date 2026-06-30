import { useParams, Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PlayerCard from '../components/PlayerCard'
import { getTeam } from '../data/placeholders'

export default function TeamDetail() {
  const { slug } = useParams()
  const team = slug ? getTeam(slug) : undefined

  if (!team) {
    return (
      <div className="shell section" style={{ minHeight: '50vh' }}>
        <p className="eyebrow">Not found</p>
        <h1 style={{ fontSize: '2rem', margin: '0.8rem 0 1rem' }}>That team doesn't exist.</h1>
        <Link className="btn btn-ghost" to="/team">← All teams</Link>
      </div>
    )
  }

  return (
    <>
      <PageHeader eyebrow={team.tagline} title={team.name} subtitle={team.blurb} />

      <section style={{ paddingBottom: '4rem' }}>
        <div className="shell">
          <Link
            to="/team"
            style={{ color: 'var(--color-sky-bright)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}
          >
            ← All teams
          </Link>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '1.5rem' }}>
            {team.roster.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
