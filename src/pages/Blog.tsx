import PageHeader from '../components/PageHeader'
import AnnouncementCard from '../components/AnnouncementCard'
import { announcements } from '../data/placeholders'

export default function Blog() {
  return (
    <>
      <PageHeader
        eyebrow="News & announcements"
        title="The latest from Rz."
        subtitle="Roster moves, tournament runs, and community events across all three squads — straight from the org. Member comments arrive with the data-model phase."
      />

      <section style={{ paddingBottom: '4rem' }}>
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-2">
            {announcements.map((post) => (
              <AnnouncementCard key={post.id} post={post} />
            ))}
          </div>

          <p
            style={{
              marginTop: '2rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--color-mute)',
            }}
          >
            Announcements are authored by Rz staff. Member comments coming soon.
          </p>
        </div>
      </section>
    </>
  )
}
