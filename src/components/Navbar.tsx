import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ORG, socials } from '../data/placeholders'
import { useAuth } from '../lib/auth'
import { avatarUrl, displayName, initials } from '../lib/user'
import AccountMenu from './AccountMenu'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/store', label: 'Store' },
  { to: '/blog', label: 'Blog' },
  { to: '/team', label: 'Teams' },
  { to: '/contact', label: 'Contact' },
]

function Wordmark() {
  return (
    <NavLink to="/" className="flex items-center gap-3" aria-label={`${ORG.name} home`}>
      <span className="logo-badge clip-sm">Rz</span>
      <span className="wordmark">
        RZREVELATION<span style={{ color: 'var(--color-orange)' }}>.</span>
      </span>
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, loading, signInWithDiscord, signOut } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navlink navlink-active' : 'navlink'

  return (
    <header className="nav">
      <nav className="shell flex items-center justify-between" style={{ height: 68 }}>
        <Wordmark />

        {/* desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* desktop right cluster: Join the Discord + account */}
        <div className="hidden md:flex items-center gap-4">
          <a className="btn btn-primary" href={socials.discord} target="_blank" rel="noreferrer">
            Join the Discord
          </a>
          <AccountMenu />
        </div>

        {/* mobile toggle */}
        <button
          className="md:hidden grid place-items-center"
          style={{ width: 40, height: 40, color: 'var(--color-fog)' }}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden shell" style={{ paddingBottom: '1.25rem' }}>
          <div className="flex flex-col gap-1 pt-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
                style={{ padding: '0.6rem 0' }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}

            <div className="rule" style={{ margin: '0.85rem 0' }} />

            {!loading && user ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3" style={{ padding: '0.2rem 0 0.6rem' }}>
                  <div className="avatar-btn" style={{ cursor: 'default' }}>
                    {avatarUrl(user) ? <img src={avatarUrl(user)} alt="" /> : <span>{initials(displayName(user))}</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{displayName(user)}</span>
                </div>
                <button
                  className="navlink"
                  type="button"
                  style={{ padding: '0.6rem 0', textAlign: 'left' }}
                  onClick={() => {
                    setOpen(false)
                    navigate('/settings')
                  }}
                >
                  Settings
                </button>
                <button
                  className="navlink"
                  type="button"
                  style={{ padding: '0.6rem 0', textAlign: 'left', color: 'var(--color-orange-bright)' }}
                  onClick={() => {
                    setOpen(false)
                    signOut()
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              !loading && (
                <button
                  className="btn btn-ghost btn-block"
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    signInWithDiscord()
                  }}
                >
                  Sign in
                </button>
              )
            )}

            <a
              className="btn btn-primary btn-block"
              href={socials.discord}
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setOpen(false)}
            >
              Join the Discord
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
