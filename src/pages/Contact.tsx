import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { socials } from '../data/placeholders'

const reachOut = [
  { label: 'DISCORD', value: 'discord.gg/rzrevelation', href: socials.discord },
  { label: 'X', value: '@rzrevelation', href: socials.x },
  { label: 'TWITCH', value: 'twitch.tv/rzrevelation', href: socials.twitch },
  { label: 'YOUTUBE', value: '@rzrevelation', href: socials.youtube },
  { label: 'INSTAGRAM', value: '@rzrevelation', href: socials.instagram },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder — real delivery (Supabase Edge Function / email) lands in a later phase.
    setSent(true)
  }

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Say hello."
        subtitle="Tryout inquiries, partnership pitches, press, or just want to talk shop — reach out and we'll get back to you."
      />

      <section style={{ paddingBottom: '5rem' }}>
        <div className="shell grid gap-10 lg:grid-cols-5">
          {/* form */}
          <div className="lg:col-span-3">
            <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              <span className="bracket" />
              {sent ? (
                <div>
                  <p className="eyebrow">Message queued</p>
                  <h2 style={{ fontSize: '1.8rem', margin: '0.8rem 0 0.6rem' }}>Thanks, {form.name || 'friend'}.</h2>
                  <p style={{ color: 'var(--color-mute)', lineHeight: 1.6, marginBottom: '1.4rem' }}>
                    We'll be in touch soon. In the meantime, the fastest way to reach the team is the Discord.
                  </p>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setSent(false)
                      setForm({ name: '', email: '', message: '' })
                    }}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="name">Name</label>
                      <input id="name" className="field clip-sm" required value={form.name} onChange={update('name')} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="label" htmlFor="email">Email</label>
                      <input id="email" type="email" className="field clip-sm" required value={form.email} onChange={update('email')} placeholder="you@email.com" />
                    </div>
                  </div>
                  <div style={{ marginTop: '1.25rem' }}>
                    <label className="label" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      className="field clip-sm"
                      required
                      rows={6}
                      value={form.message}
                      onChange={update('message')}
                      placeholder="What's on your mind?"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ marginTop: '1.5rem' }}>
                    Send message
                  </button>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-mute)', marginTop: '0.9rem' }}>
                    Form delivery is connected in a later build phase.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* reach out */}
          <div className="lg:col-span-2">
            <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', height: '100%' }}>
              <span className="bracket" />
              <p className="eyebrow">Find us</p>
              <h3 style={{ fontSize: '1.4rem', margin: '0.8rem 0 1.4rem' }}>Around the web</h3>
              <div className="flex flex-col gap-4">
                {reachOut.map((r) => (
                  <a key={r.label} href={r.href} target="_blank" rel="noreferrer" className="flex items-center justify-between"
                     style={{ borderBottom: '1px solid rgba(132,153,181,0.12)', paddingBottom: '0.7rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', letterSpacing: '0.12em', color: 'var(--color-mute)' }}>
                      {r.label}
                    </span>
                    <span style={{ color: 'var(--color-sky-bright)', fontSize: '0.9rem' }}>{r.value} ↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
