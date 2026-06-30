import { Link } from 'react-router-dom'
import { ORG, socials } from '../data/placeholders'

const social = [
  { label: 'DISCORD', href: socials.discord },
  { label: 'X', href: socials.x },
  { label: 'TWITCH', href: socials.twitch },
  { label: 'YOUTUBE', href: socials.youtube },
  { label: 'INSTAGRAM', href: socials.instagram },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell section" style={{ paddingBlock: '3rem' }}>
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="logo-badge clip-sm">Rz</span>
              <span className="wordmark">RzRevelation<span style={{ color: 'var(--color-orange)' }}>.</span></span>
            </div>
            <p style={{ color: 'var(--color-mute)', maxWidth: '32ch', lineHeight: 1.6 }}>
              {ORG.tagline}
            </p>
          </div>

          <div>
            <div className="label">Explore</div>
            <Link className="footer-link" to="/store">Store</Link>
            <Link className="footer-link" to="/blog">Blog</Link>
            <Link className="footer-link" to="/team">Teams</Link>
            <Link className="footer-link" to="/contact">Contact</Link>
          </div>

          <div>
            <div className="label">Find us</div>
            <div className="flex flex-col gap-2 mt-1">
              {social.map((s) => (
                <a key={s.label} className="social-link" href={s.href} target="_blank" rel="noreferrer">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="rule" style={{ margin: '2.5rem 0 1.25rem' }} />
        <div className="flex flex-col sm:flex-row gap-2 justify-between" style={{ color: 'var(--color-mute)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} {ORG.name}. All rights reserved.
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
            GG · WP · REPEAT
          </span>
        </div>
      </div>
    </footer>
  )
}
