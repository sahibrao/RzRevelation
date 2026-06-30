import PageHeader from '../components/PageHeader'
import TeamCard from '../components/TeamCard'
import { teams, ORG } from '../data/placeholders'

export default function Teams() {
  return (
    <>
      <PageHeader
        eyebrow="The house"
        title="Our teams."
        subtitle={`Three ${ORG.game} rosters under one banner. Tap a squad to meet the players.`}
      />

      <section style={{ paddingBottom: '4rem' }}>
        <div className="shell">
          <div className="grid gap-6 md:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.slug} team={team} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
