import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import HeroPicker from '../components/HeroPicker'
import CharacterPortrait from '../components/CharacterPortrait'
import { findCharacter } from '../lib/characters'
import { useAuth } from '../lib/auth'
import { useProfile } from '../lib/hooks'
import { fetchTeams, updateTeamDetails, createPlayer, updatePlayer, deletePlayer } from '../lib/db'
import type { Accent, DbPlayer, DbTeam, PlayerRole } from '../lib/types'

const PLAYER_ROLES: PlayerRole[] = ['Vanguard', 'Duelist', 'Strategist']
const ACCENTS: Accent[] = ['orange', 'sky']

function newPlayerId(teamSlug: string, gamertag: string) {
  const base = gamertag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${teamSlug.slice(0, 2)}-${base || 'player'}-${Math.random().toString(36).slice(2, 6)}`
}

function emptyDraft(): Omit<DbPlayer, 'id' | 'team_id' | 'sort_order' | 'created_at'> {
  return { profile_id: null, gamertag: '', full_name: '', role: 'Vanguard', main_hero: '', accent: 'orange', bio: '' }
}

export default function ManageTeam() {
  useAuth()
  const { profile, loading: profileLoading } = useProfile()

  const [teams, setTeams] = useState<DbTeam[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const reload = useCallback(() => {
    setTeamsLoading(true)
    fetchTeams().then((data) => {
      setTeams(data)
      setTeamsLoading(false)
    })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const isAdmin = profile?.role === 'admin'
  const canManage = profile?.role === 'admin' || profile?.role === 'captain' || profile?.role === 'coach'

  useEffect(() => {
    if (isAdmin && teams.length && !selectedTeamId) {
      setSelectedTeamId(teams[0].id)
    }
    if (!isAdmin && profile?.team_id) {
      setSelectedTeamId(profile.team_id)
    }
  }, [isAdmin, teams, profile, selectedTeamId])

  if (profileLoading || teamsLoading) {
    return (
      <div className="shell section" style={{ minHeight: '50vh' }}>
        <p style={{ color: 'var(--color-mute)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading…</p>
      </div>
    )
  }

  if (!canManage) {
    return (
      <>
        <PageHeader eyebrow="Team management" title="No access here" />
        <section style={{ paddingBottom: '4rem' }}>
          <div className="shell" style={{ maxWidth: 640 }}>
            <p style={{ color: 'var(--color-mute)', lineHeight: 1.6 }}>
              This page is for team captains, coaches, and org admins. If you run a roster and
              should have access, ask an admin to set your role and team in the Discord.
            </p>
          </div>
        </section>
      </>
    )
  }

  if (!isAdmin && !profile?.team_id) {
    return (
      <>
        <PageHeader eyebrow="Team management" title="Not assigned to a team yet" />
        <section style={{ paddingBottom: '4rem' }}>
          <div className="shell" style={{ maxWidth: 640 }}>
            <p style={{ color: 'var(--color-mute)', lineHeight: 1.6 }}>
              Your account is marked as {profile?.role}, but isn't linked to a roster yet. Ask an
              admin to assign your team.
            </p>
          </div>
        </section>
      </>
    )
  }

  const team = teams.find((t) => t.id === selectedTeamId) ?? null

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Admin access' : 'Team management'}
        title="Manage your team"
        subtitle="Update the team description and roster. Changes go live immediately."
      />

      <section style={{ paddingBottom: '5rem' }}>
        <div className="shell" style={{ maxWidth: 860 }}>
          {isAdmin && teams.length > 1 && (
            <div style={{ marginBottom: '1.5rem', maxWidth: 320 }}>
              <label className="label" htmlFor="teamSelect">Team</label>
              <select
                id="teamSelect"
                className="field clip-sm"
                value={selectedTeamId ?? ''}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {team && <TeamDescriptionEditor team={team} onSaved={reload} />}
          {team && <RosterEditor team={team} onChanged={reload} />}

          {isAdmin && (
            <p style={{ color: 'var(--color-mute)', fontSize: '0.85rem', marginTop: '1.25rem', lineHeight: 1.55 }}>
              This edits the public roster cards. To give someone site access — player, captain, or
              coach — go to{' '}
              <Link to="/admin" style={{ color: 'var(--color-sky-bright)' }}>Members &amp; roles</Link>.
            </p>
          )}
        </div>
      </section>
    </>
  )
}

function TeamDescriptionEditor({ team, onSaved }: { team: DbTeam; onSaved: () => void }) {
  const [tagline, setTagline] = useState(team.tagline)
  const [blurb, setBlurb] = useState(team.blurb)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTagline(team.tagline)
    setBlurb(team.blurb)
    setStatus('idle')
  }, [team.id, team.tagline, team.blurb])

  const save = async () => {
    setStatus('saving')
    const { error } = await updateTeamDetails(team.id, { tagline: tagline.trim(), blurb: blurb.trim() })
    if (error) {
      setError(error)
      setStatus('error')
    } else {
      setStatus('saved')
      onSaved()
    }
  }

  return (
    <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1.5rem' }}>
      <span className="bracket" />
      <p className="eyebrow">{team.name}</p>
      <h3 style={{ fontSize: '1.3rem', margin: '0.7rem 0 1.1rem' }}>Description</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label className="label" htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          className="field clip-sm"
          value={tagline}
          onChange={(e) => { setTagline(e.target.value); setStatus('idle') }}
        />
      </div>

      <div>
        <label className="label" htmlFor="blurb">Blurb</label>
        <textarea
          id="blurb"
          className="field clip-sm"
          rows={4}
          value={blurb}
          onChange={(e) => { setBlurb(e.target.value); setStatus('idle') }}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="flex items-center gap-3 mt-4" style={{ marginTop: '1.1rem' }}>
        <button className="btn btn-primary" type="button" onClick={save} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {status === 'saved' && (
          <span style={{ color: 'var(--color-sky-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Saved.</span>
        )}
        {status === 'error' && (
          <span style={{ color: 'var(--color-orange-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            {error ?? "Couldn't save."}
          </span>
        )}
      </div>
    </div>
  )
}

function RosterEditor({ team, onChanged }: { team: DbTeam; onChanged: () => void }) {
  const [adding, setAdding] = useState(false)

  return (
    <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
      <span className="bracket" />
      <div className="flex items-center justify-between gap-3" style={{ flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow">Roster</p>
          <h3 style={{ fontSize: '1.3rem', margin: '0.7rem 0 0' }}>{team.players.length} players</h3>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Cancel' : '+ Add player'}
        </button>
      </div>

      {adding && (
        <div className="rule" style={{ margin: '1.25rem 0' }} />
      )}
      {adding && (
        <PlayerForm
          submitLabel="Add player"
          initial={emptyDraft()}
          onSubmit={async (draft) => {
            const result = await createPlayer({
              id: newPlayerId(team.slug, draft.gamertag),
              team_id: team.id,
              sort_order: team.players.length,
              ...draft,
            })
            if (!result.error) {
              setAdding(false)
              onChanged()
            }
            return result
          }}
        />
      )}

      <div className="rule" style={{ margin: '1.25rem 0' }} />

      <div className="flex flex-col gap-4">
        {team.players.map((player) => (
          <PlayerRow key={player.id} player={player} onChanged={onChanged} />
        ))}
        {team.players.length === 0 && (
          <p style={{ color: 'var(--color-mute)', fontSize: '0.9rem' }}>No players on this roster yet.</p>
        )}
      </div>
    </div>
  )
}

function PlayerRow({ player, onChanged }: { player: DbPlayer; onChanged: () => void }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (editing) {
    return (
      <div>
        <PlayerForm
          submitLabel="Save"
          initial={player}
          onSubmit={async (draft) => {
            const result = await updatePlayer(player.id, draft)
            if (!result.error) {
              setEditing(false)
              onChanged()
            }
            return result
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3" style={{ flexWrap: 'wrap', padding: '0.6rem 0', borderBottom: '1px solid var(--border-soft)' }}>
      <div className="flex items-center gap-3">
        <CharacterPortrait character={findCharacter(player.main_hero)} name={player.main_hero} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {player.gamertag} <span style={{ color: 'var(--color-mute)', fontWeight: 400, fontSize: '0.85rem' }}>· {player.full_name}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-sky)', marginTop: 2 }}>
            {player.role} · {player.main_hero}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {confirmDelete ? (
          <>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-mute)' }}>Remove {player.gamertag}?</span>
            <button
              className="btn btn-primary"
              type="button"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true)
                await deletePlayer(player.id)
                onChanged()
              }}
            >
              {deleting ? 'Removing…' : 'Confirm'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmDelete(true)}>Remove</button>
          </>
        )}
      </div>
    </div>
  )
}

type PlayerDraft = Omit<DbPlayer, 'id' | 'team_id' | 'sort_order' | 'created_at'>

function PlayerForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: PlayerDraft
  submitLabel: string
  onSubmit: (draft: PlayerDraft) => Promise<{ error: string | null }>
  onCancel?: () => void
}) {
  const [gamertag, setGamertag] = useState(initial.gamertag)
  const [fullName, setFullName] = useState(initial.full_name)
  const [role, setRole] = useState<PlayerRole>(initial.role)
  const [mainHero, setMainHero] = useState(initial.main_hero)
  const [accent, setAccent] = useState<Accent>(initial.accent)
  const [bio, setBio] = useState(initial.bio)
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!gamertag.trim() || !fullName.trim() || !mainHero.trim()) {
      setError('Gamertag, name, and character are required.')
      setStatus('error')
      return
    }
    setStatus('saving')
    const result = await onSubmit({
      profile_id: initial.profile_id,
      gamertag: gamertag.trim(),
      full_name: fullName.trim(),
      role,
      main_hero: mainHero.trim(),
      accent,
      bio: bio.trim(),
    })
    if (result.error) {
      setError(result.error)
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: '0.85rem 1rem', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="gamertag">Gamertag</label>
          <input id="gamertag" className="field clip-sm" value={gamertag} onChange={(e) => setGamertag(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" className="field clip-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="role">In-game role</label>
          <select id="role" className="field clip-sm" value={role} onChange={(e) => setRole(e.target.value as PlayerRole)}>
            {PLAYER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <span className="label" id="mainHeroLabel">Character</span>
          <HeroPicker id="mainHero" labelledBy="mainHeroLabel" value={mainHero} onChange={setMainHero} />
        </div>
        <div>
          <label className="label" htmlFor="accent">Accent</label>
          <select id="accent" className="field clip-sm" value={accent} onChange={(e) => setAccent(e.target.value as Accent)}>
            {ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea id="bio" className="field clip-sm" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} style={{ resize: 'vertical' }} />
      </div>

      <div className="flex items-center gap-3" style={{ marginTop: '0.85rem' }}>
        <button className="btn btn-primary" type="button" onClick={submit} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : submitLabel}
        </button>
        {onCancel && <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
        {status === 'error' && (
          <span style={{ color: 'var(--color-orange-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            {error}
          </span>
        )}
      </div>
    </div>
  )
}
