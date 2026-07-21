import { useEffect, useState } from 'react'
import { fetchTeams, fetchTeam, fetchAnnouncements, fetchProfile } from './db'
import { useAuth } from './auth'
import type { DbTeam, DbAnnouncement, DbProfile } from './types'

export function useTeams() {
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams().then((data) => {
      setTeams(data)
      setLoading(false)
    })
  }, [])

  return { teams, loading }
}

export function useTeam(slug: string | undefined) {
  const [team, setTeam] = useState<DbTeam | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchTeam(slug).then((data) => {
      setTeam(data)
      setLoading(false)
    })
  }, [slug])

  return { team, loading }
}

/** The signed-in user's row from `profiles` — their site role and team. */
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    fetchProfile(user.id).then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [user])

  return { profile, loading }
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<DbAnnouncement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements().then((data) => {
      setAnnouncements(data)
      setLoading(false)
    })
  }, [])

  return { announcements, loading }
}
