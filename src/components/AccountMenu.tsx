import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { avatarUrl, displayName, initials } from '../lib/user'

export default function AccountMenu() {
  const { user, loading, signInWithDiscord, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (loading) {
    return <div style={{ width: 38, height: 38 }} aria-hidden="true" />
  }

  if (!user) {
    return (
      <button className="btn btn-ghost" type="button" onClick={signInWithDiscord}>
        Sign in
      </button>
    )
  }

  const name = displayName(user)
  const avatar = avatarUrl(user)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="avatar-btn"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        {avatar ? <img src={avatar} alt="" /> : <span>{initials(name)}</span>}
      </button>

      {open && (
        <div className="menu clip-sm" role="menu">
          <div style={{ padding: '0.9rem 0.85rem', borderBottom: '1px solid rgba(132,153,181,0.14)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1.2 }}>{name}</div>
            {user.email && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-mute)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            )}
          </div>

          <button
            className="menu-item"
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>

          <button
            className="menu-item menu-item-danger"
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
