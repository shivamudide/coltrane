export type ReleaseKind = 'album' | 'ep' | 'single' | 'song'

/** A loggable unit of music: an album, EP, single (collection) or individual song. */
export interface Release {
  /** `c<collectionId>` for collections, `t<trackId>` for songs */
  id: string
  kind: ReleaseKind
  title: string
  artist: string
  artistId: number | null
  /** 100x100 artwork URL template, upscalable via artworkUrl() */
  artworkUrl: string
  year: number | null
  genre: string | null
  trackCount: number | null
  explicit: boolean
  /** 30s audio preview — songs only */
  previewUrl: string | null
  appleUrl: string | null
  /** parent album, for songs */
  collectionId: number | null
  collectionName: string | null
}

/** One diary entry — a logged listen, optionally with rating/review. */
export interface LogEntry {
  id: string
  releaseId: string
  /** YYYY-MM-DD */
  listenedOn: string
  rating: number | null
  review: string
  liked: boolean
  relisten: boolean
  createdAt: number
}

export interface MusicList {
  id: string
  title: string
  description: string
  releaseIds: string[]
  createdAt: number
  updatedAt: number
}

export interface Profile {
  displayName: string
  username: string
  bio: string
  /** index into AVATARS */
  avatar: number
  joinedAt: number
  favoriteIds: string[]
}

export interface Track {
  id: number
  name: string
  number: number
  durationMs: number | null
  previewUrl: string | null
  explicit: boolean
}

export interface ReleaseDetail {
  release: Release
  tracks: Track[]
  copyright: string | null
}
