import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth()

  if (loading) {
    return (
      <div className="shell section" style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-mute)', letterSpacing: '0.1em' }}>
          LOADING…
        </span>
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="shell section" style={{ minHeight: '50vh' }}>
        <div className="panel clip" style={{ padding: '2rem', maxWidth: 560 }}>
          <span className="bracket" />
          <p className="eyebrow">Auth not configured</p>
          <h2 style={{ fontSize: '1.6rem', margin: '0.8rem 0 0.6rem' }}>Sign-in isn't switched on yet</h2>
          <p style={{ color: 'var(--color-mute)', lineHeight: 1.6 }}>
            Add your Supabase URL and anon key to <code>.env.local</code> and configure the Discord
            provider, then restart the dev server. Steps are in the README.
          </p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}
