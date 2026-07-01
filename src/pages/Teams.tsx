import PageHeader from '../components/PageHeader'
import TeamCard from '../components/TeamCard'
import { useTeams } from '../lib/hooks'
import { ORG } from '../data/placeholders'

export default function Teams() {
  const { teams, loading } = useTeams()

  return (
    <>
      <PageHeader
        eyebrow="The house"
        title="Our teams."
        subtitle={`Three ${ORG.game} rosters under one banner. Tap a squad to meet the players.`}
      />

      <section style={{ paddingBottom: '4rem' }}>
        <div className="shell">
          {loading ? (
            <p style={{ color: 'var(--color-mute)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              Loading…
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.slug} team={team} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
