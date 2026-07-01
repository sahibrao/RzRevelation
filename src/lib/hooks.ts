import { useEffect, useState } from 'react'
import { fetchTeams, fetchTeam, fetchAnnouncements } from './db'
import type { DbTeam, DbAnnouncement } from './types'

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
