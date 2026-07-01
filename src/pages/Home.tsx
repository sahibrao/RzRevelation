import { Link } from 'react-router-dom'
import { ORG, socials, products } from '../data/placeholders'
import { useTeams } from '../lib/hooks'
import { useAnnouncements } from '../lib/hooks'
import TeamCard from '../components/TeamCard'
import ProductCard from '../components/ProductCard'
import AnnouncementCard from '../components/AnnouncementCard'

function SectionHead({ eyebrow, title, to, cta }: { eyebrow: string; title: string; to: string; cta: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8" style={{ flexWrap: 'wrap' }}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginTop: '0.7rem' }}>{title}</h2>
      </div>
      <Link to={to} style={{ color: 'var(--color-sky-bright)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
        {cta} →
      </Link>
    </div>
  )
}

export default function Home() {
  const { teams } = useTeams()
  const { announcements } = useAnnouncements()

  return (
    <>
      {/* ── hero ───────────────────────────── */}
      <section className="section" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="shell">
          <p className="eyebrow rise">Marvel Rivals · Competitive</p>
          <h1
            className="rise rise-1"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', marginTop: '1.2rem', maxWidth: '14ch' }}
          >
            Three rosters, <span className="text-gradient">one banner.</span>
          </h1>
          <p
            className="rise rise-2"
            style={{ color: 'var(--color-mute)', maxWidth: '54ch', marginTop: '1.4rem', fontSize: '1.15rem', lineHeight: 1.6 }}
          >
            {ORG.tagline}
          </p>

          <div className="rise rise-3 flex gap-3 mt-8" style={{ flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={socials.discord} target="_blank" rel="noreferrer">
              Join the Discord
            </a>
            <Link className="btn btn-ghost" to="/team">
              Meet the teams
            </Link>
          </div>

          {/* HUD status line */}
          <div
            className="rise rise-4 clip-sm"
            style={{
              marginTop: '2.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.6rem 1rem',
              background: 'rgba(5,8,15,0.5)',
              border: '1px solid rgba(132,153,181,0.16)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--color-mute)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-orange)', boxShadow: '0 0 10px var(--color-orange)' }} />
            NOW · Summer Invitational live —{' '}
            <a href={socials.twitch} target="_blank" rel="noreferrer" style={{ color: 'var(--color-sky-bright)' }}>
              watch on Twitch
            </a>
          </div>
        </div>
      </section>

      {/* ── latest ─────────────────────────── */}
      {announcements.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow="From the org" title="Latest" to="/blog" cta="All announcements" />
            <div className="grid gap-6 md:grid-cols-3">
              {announcements.slice(0, 3).map((post) => (
                <AnnouncementCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── teams ──────────────────────────── */}
      {teams.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow="The house" title="The teams" to="/team" cta="All teams" />
            <div className="grid gap-6 md:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.slug} team={team} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── store ──────────────────────────── */}
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Rep the brand" title="The drop" to="/store" cta="Visit the store" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── discord band ───────────────────── */}
      <section className="section">
        <div className="shell">
          <div
            className="clip"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: 'clamp(2.5rem, 5vw, 4rem)',
              background: 'linear-gradient(120deg, var(--color-navy-700), var(--color-navy-900) 70%)',
              border: '1px solid rgba(255,106,26,0.3)',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: 999,
                background: 'radial-gradient(circle, rgba(255,106,26,0.22), transparent 70%)',
              }}
            />
            <p className="eyebrow">The community</p>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', margin: '0.8rem 0 0.8rem', maxWidth: '20ch' }}>
              Think you've got next?
            </h2>
            <p style={{ color: 'var(--color-mute)', maxWidth: '52ch', lineHeight: 1.6, marginBottom: '1.6rem' }}>
              Scrims, customs, watch parties, and a server full of Marvel Rivals players chasing the same climb. Tryouts run through the Discord.
            </p>
            <a className="btn btn-primary" href={socials.discord} target="_blank" rel="noreferrer">
              Join the Discord
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
