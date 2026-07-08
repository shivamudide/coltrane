import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LogEntry, MusicList, Profile, Release } from './types'
import { todayISO } from './format'

export interface LogInput {
  listenedOn: string
  rating: number | null
  review: string
  liked: boolean
  relisten: boolean
}

interface WaxdState {
  profile: Profile
  /** every release the user has interacted with, so the app works offline */
  releases: Record<string, Release>
  logs: LogEntry[]
  /** current rating per release (star value 0.5–5) */
  ratings: Record<string, number>
  /** releaseId -> liked-at timestamp */
  likes: Record<string, number>
  /** releaseId -> added-at timestamp (the "Listen Later" queue) */
  queue: Record<string, number>
  lists: MusicList[]

  updateProfile: (patch: Partial<Profile>) => void
  setFavorite: (slot: number, releaseId: string | null) => void

  cacheRelease: (release: Release) => void
  logListen: (release: Release, input: LogInput) => void
  updateLog: (logId: string, patch: Partial<LogInput>) => void
  deleteLog: (logId: string) => void

  setRating: (release: Release, rating: number | null) => void
  toggleLike: (release: Release) => void
  toggleQueue: (release: Release) => void

  createList: (title: string, description: string) => string
  updateListMeta: (listId: string, patch: Partial<Pick<MusicList, 'title' | 'description'>>) => void
  deleteList: (listId: string) => void
  toggleInList: (listId: string, release: Release) => void
  moveInList: (listId: string, releaseId: string, dir: -1 | 1) => void

  resetAll: () => void
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const defaultProfile: Profile = {
  displayName: 'Listener',
  username: 'listener',
  bio: '',
  avatar: 0,
  joinedAt: Date.now(),
  favoriteIds: [],
}

export const useStore = create<WaxdState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      releases: {},
      logs: [],
      ratings: {},
      likes: {},
      queue: {},
      lists: [],

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      setFavorite: (slot, releaseId) =>
        set((s) => {
          const favs = [...s.profile.favoriteIds]
          while (favs.length < 4) favs.push('')
          favs[slot] = releaseId ?? ''
          return { profile: { ...s.profile, favoriteIds: favs } }
        }),

      cacheRelease: (release) =>
        set((s) => ({ releases: { ...s.releases, [release.id]: release } })),

      logListen: (release, input) =>
        set((s) => {
          const entry: LogEntry = {
            id: uid(),
            releaseId: release.id,
            listenedOn: input.listenedOn || todayISO(),
            rating: input.rating,
            review: input.review.trim(),
            liked: input.liked,
            relisten: input.relisten,
            createdAt: Date.now(),
          }
          const ratings = { ...s.ratings }
          if (input.rating != null) ratings[release.id] = input.rating
          const likes = { ...s.likes }
          if (input.liked && !likes[release.id]) likes[release.id] = Date.now()
          // a fresh listen clears it from the queue, like Letterboxd's watchlist
          const queue = { ...s.queue }
          delete queue[release.id]
          return {
            releases: { ...s.releases, [release.id]: release },
            logs: [entry, ...s.logs],
            ratings,
            likes,
            queue,
          }
        }),

      updateLog: (logId, patch) =>
        set((s) => {
          const logs = s.logs.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  ...patch,
                  review: patch.review !== undefined ? patch.review.trim() : l.review,
                }
              : l,
          )
          const target = logs.find((l) => l.id === logId)
          const ratings = { ...s.ratings }
          if (target && patch.rating !== undefined) {
            if (patch.rating == null) {
              const others = logs.filter((l) => l.releaseId === target.releaseId && l.rating != null)
              if (others.length === 0) delete ratings[target.releaseId]
              else ratings[target.releaseId] = others[0].rating as number
            } else {
              ratings[target.releaseId] = patch.rating
            }
          }
          return { logs, ratings }
        }),

      deleteLog: (logId) =>
        set((s) => {
          const target = s.logs.find((l) => l.id === logId)
          const logs = s.logs.filter((l) => l.id !== logId)
          const ratings = { ...s.ratings }
          if (target && target.rating != null) {
            const others = logs.filter((l) => l.releaseId === target.releaseId && l.rating != null)
            if (others.length === 0 && ratings[target.releaseId] === target.rating) {
              delete ratings[target.releaseId]
            }
          }
          return { logs, ratings }
        }),

      setRating: (release, rating) =>
        set((s) => {
          const ratings = { ...s.ratings }
          if (rating == null) delete ratings[release.id]
          else ratings[release.id] = rating
          return { ratings, releases: { ...s.releases, [release.id]: release } }
        }),

      toggleLike: (release) =>
        set((s) => {
          const likes = { ...s.likes }
          if (likes[release.id]) delete likes[release.id]
          else likes[release.id] = Date.now()
          return { likes, releases: { ...s.releases, [release.id]: release } }
        }),

      toggleQueue: (release) =>
        set((s) => {
          const queue = { ...s.queue }
          if (queue[release.id]) delete queue[release.id]
          else queue[release.id] = Date.now()
          return { queue, releases: { ...s.releases, [release.id]: release } }
        }),

      createList: (title, description) => {
        const id = uid()
        const now = Date.now()
        set((s) => ({
          lists: [{ id, title, description, releaseIds: [], createdAt: now, updatedAt: now }, ...s.lists],
        }))
        return id
      },

      updateListMeta: (listId, patch) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === listId ? { ...l, ...patch, updatedAt: Date.now() } : l)),
        })),

      deleteList: (listId) => set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) })),

      toggleInList: (listId, release) =>
        set((s) => ({
          releases: { ...s.releases, [release.id]: release },
          lists: s.lists.map((l) => {
            if (l.id !== listId) return l
            const has = l.releaseIds.includes(release.id)
            return {
              ...l,
              releaseIds: has
                ? l.releaseIds.filter((id) => id !== release.id)
                : [...l.releaseIds, release.id],
              updatedAt: Date.now(),
            }
          }),
        })),

      moveInList: (listId, releaseId, dir) =>
        set((s) => ({
          lists: s.lists.map((l) => {
            if (l.id !== listId) return l
            const ids = [...l.releaseIds]
            const i = ids.indexOf(releaseId)
            const j = i + dir
            if (i < 0 || j < 0 || j >= ids.length) return l
            ;[ids[i], ids[j]] = [ids[j], ids[i]]
            return { ...l, releaseIds: ids, updatedAt: Date.now() }
          }),
        })),

      resetAll: () =>
        set({
          profile: { ...defaultProfile, joinedAt: get().profile.joinedAt },
          releases: {},
          logs: [],
          ratings: {},
          likes: {},
          queue: {},
          lists: [],
        }),
    }),
    { name: 'coltrane-v1' },
  ),
)

/* ---------- derived helpers ---------- */

export interface ActivityEvent {
  key: string
  ts: number
  type: 'log' | 'like' | 'queue' | 'list'
  releaseId?: string
  log?: LogEntry
  list?: MusicList
}

export function deriveActivity(s: Pick<WaxdState, 'logs' | 'likes' | 'queue' | 'lists'>): ActivityEvent[] {
  const events: ActivityEvent[] = []
  for (const log of s.logs) {
    events.push({ key: `log-${log.id}`, ts: log.createdAt, type: 'log', releaseId: log.releaseId, log })
  }
  for (const [releaseId, ts] of Object.entries(s.likes)) {
    events.push({ key: `like-${releaseId}`, ts, type: 'like', releaseId })
  }
  for (const [releaseId, ts] of Object.entries(s.queue)) {
    events.push({ key: `queue-${releaseId}`, ts, type: 'queue', releaseId })
  }
  for (const list of s.lists) {
    events.push({ key: `list-${list.id}`, ts: list.createdAt, type: 'list', list })
  }
  return events.sort((a, b) => b.ts - a.ts)
}

/** Every release the user has logged, rated or liked — their "Music" shelf. */
export function shelfIds(s: Pick<WaxdState, 'logs' | 'ratings' | 'likes'>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const log of s.logs) {
    if (!seen.has(log.releaseId)) {
      seen.add(log.releaseId)
      out.push(log.releaseId)
    }
  }
  for (const id of Object.keys(s.ratings)) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  for (const id of Object.keys(s.likes)) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}
