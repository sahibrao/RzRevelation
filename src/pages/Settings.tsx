import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { avatarUrl, displayName, initials } from '../lib/user'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [name, setName] = useState(user ? displayName(user) : '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  if (!user) return null

  const avatar = avatarUrl(user)
  const provider = (user.app_metadata?.provider as string) || 'discord'
  const role = ((user.user_metadata?.role as string) || 'Member')
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  const save = async () => {
    if (!supabase) return
    setStatus('saving')
    const { error } = await supabase.auth.updateUser({ data: { display_name: name.trim() } })
    setStatus(error ? 'error' : 'saved')
  }

  return (
    <>
      <PageHeader eyebrow="Your account" title="Settings" />

      <section style={{ paddingBottom: '5rem' }}>
        <div className="shell" style={{ maxWidth: 720 }}>
          {/* identity */}
          <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1.5rem' }}>
            <span className="bracket" />
            <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="avatar-btn" style={{ width: 64, height: 64, fontSize: '1.3rem', cursor: 'default' }}>
                {avatar ? <img src={avatar} alt="" /> : <span>{initials(displayName(user))}</span>}
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem' }}>{displayName(user)}</h2>
                <div className="flex items-center gap-2 mt-1" style={{ flexWrap: 'wrap' }}>
                  <span className="tag" style={{ textTransform: 'capitalize' }}>{provider}</span>
                  <span className="tag tag-orange">{role}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: '1.75rem' }}>
              <div>
                <div className="label">Email</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{user.email || '—'}</div>
              </div>
              <div>
                <div className="label">Member since</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>{joined}</div>
              </div>
            </div>
          </div>

          {/* editable display name */}
          <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1.5rem' }}>
            <span className="bracket" />
            <p className="eyebrow">Profile</p>
            <h3 style={{ fontSize: '1.3rem', margin: '0.7rem 0 1.1rem' }}>Display name</h3>
            <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 240px' }}>
                <label className="label" htmlFor="displayName">Shown across the site</label>
                <input
                  id="displayName"
                  className="field clip-sm"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setStatus('idle')
                  }}
                  placeholder="Your display name"
                />
              </div>
              <button className="btn btn-primary" type="button" onClick={save} disabled={status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save'}
              </button>
            </div>
            {status === 'saved' && (
              <p style={{ color: 'var(--color-sky-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: '0.8rem' }}>
                Saved.
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: 'var(--color-orange-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: '0.8rem' }}>
                Couldn't save — check the console.
              </p>
            )}
            <p style={{ color: 'var(--color-mute)', fontSize: '0.85rem', marginTop: '1rem', lineHeight: 1.55 }}>
              Admin roles (for posting announcements and managing the store) are assigned in the data-model phase.
            </p>
          </div>

          {/* sign out */}
          <div className="flex items-center justify-between gap-4" style={{ flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-mute)', fontSize: '0.9rem' }}>Signed in with Discord.</span>
            <button className="btn btn-ghost" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
