import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useProfile } from '../lib/hooks'
import {
  fetchTeams,
  fetchMembers,
  fetchMemberInvites,
  addTeamMember,
  updateMember,
  removeMemberFromTeam,
  linkPlayerToProfile,
  updateMemberInvite,
  deleteMemberInvite,
} from '../lib/db'
import { initials } from '../lib/user'
import type { DbMemberInvite, DbTeam, Member, TeamRole } from '../lib/types'

const TEAM_ROLES: { value: TeamRole; label: string }[] = [
  { value: 'player', label: 'Player' },
  { value: 'captain', label: 'Captain' },
  { value: 'coach', label: 'Coach' },
]

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  captain: 'Captain',
  coach: 'Coach',
  player: 'Player',
  member: 'Member',
}

/** Discord snowflakes are 17–20 digits — catches someone pasting a username. */
const DISCORD_ID = /^\d{17,20}$/

const mono = { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-mute)' }
const rowBorder = '1px solid var(--border-soft)'

type Note = { kind: 'ok' | 'err'; text: string } | null

function NoteText({ note }: { note: Note }) {
  if (!note) return null
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: note.kind === 'ok' ? 'var(--color-sky-bright)' : 'var(--color-orange-bright)',
      }}
    >
      {note.text}
    </span>
  )
}

function Identity({
  name,
  username,
  discordId,
  avatar,
}: {
  name: string
  username?: string | null
  discordId?: string | null
  avatar?: string | null
}) {
  return (
    <div className="flex items-center gap-3" style={{ flex: '1 1 220px', minWidth: 0 }}>
      <div className="avatar-btn" style={{ cursor: 'default', flexShrink: 0 }}>
        {avatar ? <img src={avatar} alt="" /> : <span>{initials(name)}</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1.25 }}>{name}</div>
        <div style={{ ...mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {username ? `@${username} · ` : ''}
          {discordId ?? 'no Discord ID on file'}
        </div>
      </div>
    </div>
  )
}

/** Which roster card on the team this account holds, if any. */
function RosterSpotSelect({
  team,
  value,
  holderId,
  onChange,
  disabled,
}: {
  team: DbTeam | null
  value: string | null
  holderId: string | null
  onChange: (playerId: string | null) => void
  disabled?: boolean
}) {
  if (!team) return null
  return (
    <select
      className="field clip-sm"
      aria-label="Roster spot"
      style={{ width: 'auto', minWidth: 150 }}
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">No roster card</option>
      {team.players.map((p) => {
        const taken = Boolean(p.profile_id) && p.profile_id !== holderId && p.id !== value
        return (
          <option key={p.id} value={p.id} disabled={taken}>
            {p.gamertag}
            {taken ? ' · taken' : ''}
          </option>
        )
      })}
    </select>
  )
}

export default function Admin() {
  const { profile, loading: profileLoading } = useProfile()

  const [teams, setTeams] = useState<DbTeam[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<DbMemberInvite[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.role === 'admin'

  const reload = useCallback(async () => {
    const [t, m, i] = await Promise.all([fetchTeams(), fetchMembers(), fetchMemberInvites()])
    setTeams(t)
    setMembers(m)
    setInvites(i)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (profileLoading) return
    if (isAdmin) reload()
    else setLoading(false)
  }, [isAdmin, profileLoading, reload])

  if (profileLoading || loading) {
    return (
      <div className="shell section" style={{ minHeight: '50vh' }}>
        <p style={{ color: 'var(--color-mute)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading…</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="No access here" />
        <section style={{ paddingBottom: '4rem' }}>
          <div className="shell" style={{ maxWidth: 640 }}>
            <p style={{ color: 'var(--color-mute)', lineHeight: 1.6 }}>
              Only org admins can manage members and roles. If you run a roster, your team's page is
              at <Link to="/manage" style={{ color: 'var(--color-sky-bright)' }}>Manage team</Link>.
            </p>
          </div>
        </section>
      </>
    )
  }

  const admins = members.filter((m) => m.role === 'admin')
  const unassigned = members.filter((m) => m.role !== 'admin' && !m.team_id)

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Members & roles"
        subtitle="Add someone to a roster by Discord ID and set whether they're a player, captain, or coach. Captains and coaches can then edit their own team."
      />

      <section style={{ paddingBottom: '5rem' }}>
        <div className="shell" style={{ maxWidth: 900 }}>
          <AddMemberPanel teams={teams} invitedBy={profile.id} onAdded={reload} />

          {invites.length > 0 && (
            <InvitesPanel invites={invites} teams={teams} onChanged={reload} />
          )}

          {teams.map((team) => (
            <TeamMembersPanel
              key={team.id}
              team={team}
              members={members.filter((m) => m.team_id === team.id && m.role !== 'admin')}
              teams={teams}
              onChanged={reload}
            />
          ))}

          <UnassignedPanel members={unassigned} teams={teams} onChanged={reload} />

          <div className="panel clip" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
            <span className="bracket" />
            <p className="eyebrow">Org admins</p>
            <h3 style={{ fontSize: '1.15rem', margin: '0.7rem 0 0.4rem' }}>{admins.length} with full access</h3>
            <p style={{ color: 'var(--color-mute)', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1rem' }}>
              Admin is deliberately not grantable from here — add the Discord ID to the allowlist in{' '}
              <code>003_member_management.sql</code> and re-run it.
            </p>
            <div className="flex flex-col gap-3">
              {admins.map((m) => (
                <div key={m.id} className="flex items-center gap-3" style={{ paddingTop: '0.6rem', borderTop: rowBorder }}>
                  <Identity
                    name={m.display_name ?? 'Unnamed'}
                    username={m.discord_username}
                    discordId={m.discord_id}
                    avatar={m.avatar_url}
                  />
                  <span className="tag tag-orange">Admin</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ── Add a member ────────────────────────────────────────────────

function AddMemberPanel({
  teams,
  invitedBy,
  onAdded,
}: {
  teams: DbTeam[]
  invitedBy: string
  onAdded: () => void
}) {
  const [discordId, setDiscordId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '')
  const [role, setRole] = useState<TeamRole>('player')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<Note>(null)

  const team = teams.find((t) => t.id === teamId) ?? null

  const submit = async () => {
    const id = discordId.trim()
    if (!DISCORD_ID.test(id)) {
      setNote({ kind: 'err', text: "That isn't a Discord user ID — it's 17–20 digits, not a username." })
      return
    }
    if (!teamId) {
      setNote({ kind: 'err', text: 'Pick a team.' })
      return
    }

    setBusy(true)
    setNote(null)
    const result = await addTeamMember({
      discordId: id,
      teamId,
      role,
      playerId,
      displayName,
      invitedBy,
    })
    setBusy(false)

    if (result.error) {
      setNote({ kind: 'err', text: result.error })
      return
    }

    const roleLabel = ROLE_LABEL[role]
    setNote({
      kind: 'ok',
      text:
        result.outcome === 'linked'
          ? `Done — ${result.member?.display_name ?? 'that account'} is now ${roleLabel} on ${team?.name}.`
          : `No account for that ID yet. Saved — they become ${roleLabel} on ${team?.name} the first time they sign in with Discord.`,
    })
    setDiscordId('')
    setDisplayName('')
    setPlayerId(null)
    onAdded()
  }

  return (
    <div className="panel clip" style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1.5rem' }}>
      <span className="bracket" />
      <p className="eyebrow">Add someone</p>
      <h3 style={{ fontSize: '1.3rem', margin: '0.7rem 0 0.5rem' }}>Put a player on a team</h3>
      <p style={{ color: 'var(--color-mute)', fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1.2rem' }}>
        They don't need an account yet. If they've never signed in, the role waits for them and
        lands automatically the first time they log in with Discord.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="discordId">Discord user ID</label>
          <input
            id="discordId"
            className="field clip-sm"
            value={discordId}
            inputMode="numeric"
            placeholder="687913571426107394"
            onChange={(e) => {
              setDiscordId(e.target.value)
              setNote(null)
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="memberName">Name <span style={{ color: 'var(--color-mute)' }}>(optional)</span></label>
          <input
            id="memberName"
            className="field clip-sm"
            value={displayName}
            placeholder="Shown here until they sign in"
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="memberTeam">Team</label>
          <select
            id="memberTeam"
            className="field clip-sm"
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value)
              setPlayerId(null)
            }}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="memberRole">Role</label>
          <select
            id="memberRole"
            className="field clip-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
          >
            {TEAM_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="memberSpot">Roster card <span style={{ color: 'var(--color-mute)' }}>(optional)</span></label>
          <select
            id="memberSpot"
            className="field clip-sm"
            value={playerId ?? ''}
            onChange={(e) => setPlayerId(e.target.value || null)}
          >
            <option value="">Not linked to a card</option>
            {(team?.players ?? []).map((p) => (
              <option key={p.id} value={p.id} disabled={Boolean(p.profile_id)}>
                {p.gamertag}
                {p.profile_id ? ' · taken' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p style={{ color: 'var(--color-mute)', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.9rem' }}>
        To copy a Discord ID: Discord → User Settings → Advanced → turn on Developer Mode, then
        right-click their name → Copy User ID. Linking a roster card ties the account to a player on
        the <Link to="/team" style={{ color: 'var(--color-sky-bright)' }}>Teams</Link> page — that's
        what a player will manage their own schedule through later.
      </p>

      <div className="flex items-center gap-3" style={{ marginTop: '1.1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" type="button" onClick={submit} disabled={busy}>
          {busy ? 'Adding…' : 'Add member'}
        </button>
        <NoteText note={note} />
      </div>
    </div>
  )
}

// ── One team's members ──────────────────────────────────────────

function TeamMembersPanel({
  team,
  members,
  teams,
  onChanged,
}: {
  team: DbTeam
  members: Member[]
  teams: DbTeam[]
  onChanged: () => void
}) {
  return (
    <div className="panel clip" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>
      <span className="bracket" />
      <p className="eyebrow">{team.name}</p>
      <h3 style={{ fontSize: '1.15rem', margin: '0.7rem 0 1rem' }}>
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </h3>

      {members.length === 0 ? (
        <p style={{ color: 'var(--color-mute)', fontSize: '0.88rem' }}>
          Nobody on this team has site access yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} teams={teams} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberRow({
  member,
  teams,
  onChanged,
}: {
  member: Member
  teams: DbTeam[]
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [note, setNote] = useState<Note>(null)

  const team = teams.find((t) => t.id === member.team_id) ?? null
  const spot = team?.players.find((p) => p.profile_id === member.id) ?? null

  const run = async (fn: () => Promise<{ error: string | null }>, okText: string) => {
    setBusy(true)
    setNote(null)
    const { error } = await fn()
    setBusy(false)
    setNote(error ? { kind: 'err', text: error } : { kind: 'ok', text: okText })
    if (!error) onChanged()
  }

  return (
    <div style={{ paddingTop: '0.7rem', borderTop: rowBorder }}>
      <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <Identity
          name={member.display_name ?? 'Unnamed'}
          username={member.discord_username}
          discordId={member.discord_id}
          avatar={member.avatar_url}
        />

        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <select
            className="field clip-sm"
            aria-label={`Role for ${member.display_name ?? 'member'}`}
            style={{ width: 'auto', minWidth: 118 }}
            value={member.role}
            disabled={busy}
            onChange={(e) =>
              run(() => updateMember(member.id, { role: e.target.value as TeamRole }), 'Role updated.')
            }
          >
            {TEAM_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <select
            className="field clip-sm"
            aria-label={`Team for ${member.display_name ?? 'member'}`}
            style={{ width: 'auto', minWidth: 150 }}
            value={member.team_id ?? ''}
            disabled={busy}
            onChange={(e) =>
              run(() => updateMember(member.id, { team_id: e.target.value }), 'Team updated.')
            }
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <RosterSpotSelect
            team={team}
            value={spot?.id ?? null}
            holderId={member.id}
            disabled={busy}
            onChange={(playerId) =>
              run(
                () =>
                  playerId
                    ? linkPlayerToProfile(playerId, member.id)
                    : spot
                      ? linkPlayerToProfile(spot.id, null)
                      : Promise.resolve({ error: null }),
                'Roster card updated.',
              )
            }
          />

          {confirmRemove ? (
            <>
              <button
                className="btn btn-primary"
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirmRemove(false)
                  run(() => removeMemberFromTeam(member.id), 'Removed from the team.')
                }}
              >
                Confirm
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setConfirmRemove(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setConfirmRemove(true)}>
              Remove
            </button>
          )}
        </div>
      </div>

      {(note || confirmRemove) && (
        <div style={{ marginTop: '0.45rem' }}>
          {confirmRemove ? (
            <span style={{ ...mono, color: 'var(--color-mute)' }}>
              Drops {member.display_name ?? 'them'} back to a plain member and frees their roster card.
              Their account and profile stay.
            </span>
          ) : (
            <NoteText note={note} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Pending invites ─────────────────────────────────────────────

function InvitesPanel({
  invites,
  teams,
  onChanged,
}: {
  invites: DbMemberInvite[]
  teams: DbTeam[]
  onChanged: () => void
}) {
  return (
    <div className="panel clip" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>
      <span className="bracket" />
      <p className="eyebrow">Waiting on first sign-in</p>
      <h3 style={{ fontSize: '1.15rem', margin: '0.7rem 0 0.4rem' }}>
        {invites.length} pending {invites.length === 1 ? 'member' : 'members'}
      </h3>
      <p style={{ color: 'var(--color-mute)', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1rem' }}>
        These Discord accounts haven't signed in yet. Send them to the site — the role applies itself
        the moment they log in.
      </p>

      <div className="flex flex-col gap-3">
        {invites.map((invite) => (
          <InviteRow key={invite.discord_id} invite={invite} teams={teams} onChanged={onChanged} />
        ))}
      </div>
    </div>
  )
}

function InviteRow({
  invite,
  teams,
  onChanged,
}: {
  invite: DbMemberInvite
  teams: DbTeam[]
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<Note>(null)

  const team = teams.find((t) => t.id === invite.team_id) ?? null

  const run = async (fn: () => Promise<{ error: string | null }>, okText: string) => {
    setBusy(true)
    setNote(null)
    const { error } = await fn()
    setBusy(false)
    setNote(error ? { kind: 'err', text: error } : { kind: 'ok', text: okText })
    if (!error) onChanged()
  }

  return (
    <div style={{ paddingTop: '0.7rem', borderTop: rowBorder }}>
      <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <Identity name={invite.display_name ?? 'Invited player'} discordId={invite.discord_id} />

        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <select
            className="field clip-sm"
            aria-label="Pending role"
            style={{ width: 'auto', minWidth: 118 }}
            value={invite.role}
            disabled={busy}
            onChange={(e) =>
              run(
                () => updateMemberInvite(invite.discord_id, { role: e.target.value as TeamRole }),
                'Role updated.',
              )
            }
          >
            {TEAM_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <select
            className="field clip-sm"
            aria-label="Pending team"
            style={{ width: 'auto', minWidth: 150 }}
            value={invite.team_id}
            disabled={busy}
            onChange={(e) =>
              run(
                () => updateMemberInvite(invite.discord_id, { team_id: e.target.value, player_id: null }),
                'Team updated.',
              )
            }
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <RosterSpotSelect
            team={team}
            value={invite.player_id}
            holderId={null}
            disabled={busy}
            onChange={(playerId) =>
              run(
                () => updateMemberInvite(invite.discord_id, { player_id: playerId }),
                'Roster card updated.',
              )
            }
          />

          <button
            className="btn btn-ghost"
            type="button"
            disabled={busy}
            onClick={() => run(() => deleteMemberInvite(invite.discord_id), 'Invite cancelled.')}
          >
            Cancel invite
          </button>
        </div>
      </div>
      {note && <div style={{ marginTop: '0.45rem' }}><NoteText note={note} /></div>}
    </div>
  )
}

// ── Signed in, no team ──────────────────────────────────────────

function UnassignedPanel({
  members,
  teams,
  onChanged,
}: {
  members: Member[]
  teams: DbTeam[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="panel clip" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>
      <span className="bracket" />
      <div className="flex items-center justify-between gap-3" style={{ flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow">No team</p>
          <h3 style={{ fontSize: '1.15rem', margin: '0.7rem 0 0' }}>
            {members.length} signed-in {members.length === 1 ? 'user' : 'users'}
          </h3>
        </div>
        {members.length > 0 && (
          <button className="btn btn-ghost" type="button" onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      <p style={{ color: 'var(--color-mute)', fontSize: '0.85rem', lineHeight: 1.55, marginTop: '0.8rem' }}>
        Anyone who has signed in but isn't on a roster. Adding them from here skips needing their
        Discord ID.
      </p>

      {open && (
        <div className="flex flex-col gap-3" style={{ marginTop: '1rem' }}>
          {members.map((m) => (
            <UnassignedRow key={m.id} member={m} teams={teams} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  )
}

function UnassignedRow({
  member,
  teams,
  onChanged,
}: {
  member: Member
  teams: DbTeam[]
  onChanged: () => void
}) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '')
  // a captain/coach who lost their team keeps the role they already have
  const [role, setRole] = useState<TeamRole>(
    TEAM_ROLES.some((r) => r.value === member.role) ? (member.role as TeamRole) : 'player',
  )
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<Note>(null)

  const add = async () => {
    if (!teamId) return
    setBusy(true)
    setNote(null)
    const { error } = await updateMember(member.id, { role, team_id: teamId })
    setBusy(false)
    if (error) {
      setNote({ kind: 'err', text: error })
      return
    }
    onChanged()
  }

  return (
    <div style={{ paddingTop: '0.7rem', borderTop: rowBorder }}>
      <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <Identity
          name={member.display_name ?? 'Unnamed'}
          username={member.discord_username}
          discordId={member.discord_id}
          avatar={member.avatar_url}
        />
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <select
            className="field clip-sm"
            aria-label={`Role for ${member.display_name ?? 'user'}`}
            style={{ width: 'auto', minWidth: 118 }}
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
          >
            {TEAM_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            className="field clip-sm"
            aria-label={`Team for ${member.display_name ?? 'user'}`}
            style={{ width: 'auto', minWidth: 150 }}
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button className="btn btn-ghost" type="button" onClick={add} disabled={busy}>
            {busy ? 'Adding…' : 'Add to team'}
          </button>
        </div>
      </div>
      {note && <div style={{ marginTop: '0.45rem' }}><NoteText note={note} /></div>}
    </div>
  )
}
