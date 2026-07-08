import type { Release, ReleaseDetail, ReleaseKind, Track } from './types'

/**
 * Client for the public iTunes Search API (no key required, CORS-enabled).
 * Collections (albums / EPs / singles) get ids like `c123`, songs `t456`.
 */

interface ItunesCollection {
  wrapperType: 'collection'
  collectionId: number
  collectionName: string
  artistId?: number
  artistName: string
  artworkUrl100?: string
  releaseDate?: string
  primaryGenreName?: string
  trackCount?: number
  collectionExplicitness?: string
  collectionViewUrl?: string
  copyright?: string
}

interface ItunesTrack {
  wrapperType: 'track'
  kind?: string
  trackId: number
  trackName: string
  trackNumber?: number
  trackTimeMillis?: number
  artistId?: number
  artistName: string
  collectionId?: number
  collectionName?: string
  artworkUrl100?: string
  releaseDate?: string
  primaryGenreName?: string
  previewUrl?: string
  trackExplicitness?: string
  trackViewUrl?: string
}

interface ItunesArtist {
  wrapperType: 'artist'
  artistId: number
  artistName: string
  primaryGenreName?: string
  artistLinkUrl?: string
}

type ItunesResult = ItunesCollection | ItunesTrack | ItunesArtist

export interface ArtistInfo {
  id: number
  name: string
  genre: string | null
  url: string | null
}

const BASE = 'https://itunes.apple.com'
const PLACEHOLDER_ART =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3ede4"/><circle cx="50" cy="50" r="26" fill="#e9e1d6"/><circle cx="50" cy="50" r="5" fill="#faf7f2"/></svg>',
  )

const cache = new Map<string, unknown>()

async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T
  const res = await fetch(url)
  if (!res.ok) throw new Error(`iTunes request failed (${res.status})`)
  const data = (await res.json()) as T
  cache.set(url, data)
  return data
}

/** Singles/EPs arrive as collections named "Foo - Single" / "Foo - EP". */
function classifyCollection(name: string): { kind: ReleaseKind; title: string } {
  if (/ - Single$/.test(name)) return { kind: 'single', title: name.replace(/ - Single$/, '') }
  if (/ - EP$/.test(name)) return { kind: 'ep', title: name.replace(/ - EP$/, '') }
  return { kind: 'album', title: name }
}

function yearOf(releaseDate?: string): number | null {
  if (!releaseDate) return null
  const y = Number(releaseDate.slice(0, 4))
  return Number.isFinite(y) ? y : null
}

function fromCollection(c: ItunesCollection): Release {
  const { kind, title } = classifyCollection(c.collectionName)
  return {
    id: `c${c.collectionId}`,
    kind,
    title,
    artist: c.artistName,
    artistId: c.artistId ?? null,
    artworkUrl: c.artworkUrl100 ?? PLACEHOLDER_ART,
    year: yearOf(c.releaseDate),
    genre: c.primaryGenreName ?? null,
    trackCount: c.trackCount ?? null,
    explicit: c.collectionExplicitness === 'explicit',
    previewUrl: null,
    appleUrl: c.collectionViewUrl ?? null,
    collectionId: null,
    collectionName: null,
  }
}

function fromTrack(t: ItunesTrack): Release {
  return {
    id: `t${t.trackId}`,
    kind: 'song',
    title: t.trackName,
    artist: t.artistName,
    artistId: t.artistId ?? null,
    artworkUrl: t.artworkUrl100 ?? PLACEHOLDER_ART,
    year: yearOf(t.releaseDate),
    genre: t.primaryGenreName ?? null,
    trackCount: null,
    explicit: t.trackExplicitness === 'explicit',
    previewUrl: t.previewUrl ?? null,
    appleUrl: t.trackViewUrl ?? null,
    collectionId: t.collectionId ?? null,
    collectionName: t.collectionName ?? null,
  }
}

export async function searchReleases(
  term: string,
  scope: 'all' | 'album' | 'song' = 'all',
  limit = 24,
): Promise<Release[]> {
  const q = encodeURIComponent(term.trim())
  if (!q) return []

  const urls: string[] = []
  if (scope === 'all' || scope === 'album') {
    urls.push(`${BASE}/search?term=${q}&media=music&entity=album&limit=${limit}`)
  }
  if (scope === 'all' || scope === 'song') {
    urls.push(`${BASE}/search?term=${q}&media=music&entity=song&limit=${scope === 'all' ? 12 : limit}`)
  }

  const payloads = await Promise.all(urls.map((u) => fetchJson<{ results: ItunesResult[] }>(u)))
  const releases: Release[] = []
  for (const p of payloads) {
    for (const r of p.results) {
      if (r.wrapperType === 'collection') releases.push(fromCollection(r))
      else if (r.wrapperType === 'track' && (r as ItunesTrack).kind === 'song') releases.push(fromTrack(r as ItunesTrack))
    }
  }
  const seen = new Set<string>()
  const unique = releases.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))

  // Stable re-rank: when the query names an artist, surface that artist's own
  // work (albums first) above title-matches by other artists.
  const needle = term.trim().toLowerCase()
  const rank = (r: Release) => {
    const artistMatch = r.artist.toLowerCase().includes(needle)
    const titleMatch = r.title.toLowerCase().includes(needle)
    if (artistMatch && r.kind === 'album') return 0
    if (artistMatch) return 1
    if (titleMatch) return 2
    return 3
  }
  return unique
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i)
    .map(({ r }) => r)
}

export async function searchArtists(term: string, limit = 5): Promise<ArtistInfo[]> {
  const q = encodeURIComponent(term.trim())
  if (!q) return []
  const data = await fetchJson<{ results: ItunesResult[] }>(
    `${BASE}/search?term=${q}&media=music&entity=musicArtist&limit=${limit}`,
  )
  return data.results
    .filter((r): r is ItunesArtist => r.wrapperType === 'artist')
    .map((a) => ({
      id: a.artistId,
      name: a.artistName,
      genre: a.primaryGenreName ?? null,
      url: a.artistLinkUrl ?? null,
    }))
}

/** Fetch a single release (with track list for collections) by our id. */
export async function lookupRelease(id: string): Promise<ReleaseDetail | null> {
  const numeric = id.slice(1)
  if (id.startsWith('c')) {
    const data = await fetchJson<{ results: ItunesResult[] }>(`${BASE}/lookup?id=${numeric}&entity=song&limit=200`)
    const coll = data.results.find((r): r is ItunesCollection => r.wrapperType === 'collection')
    if (!coll) return null
    const tracks: Track[] = data.results
      .filter((r): r is ItunesTrack => r.wrapperType === 'track' && (r as ItunesTrack).kind === 'song')
      .map((t) => ({
        id: t.trackId,
        name: t.trackName,
        number: t.trackNumber ?? 0,
        durationMs: t.trackTimeMillis ?? null,
        previewUrl: t.previewUrl ?? null,
        explicit: t.trackExplicitness === 'explicit',
      }))
      .sort((a, b) => a.number - b.number)
    return { release: fromCollection(coll), tracks, copyright: coll.copyright ?? null }
  }
  if (id.startsWith('t')) {
    const data = await fetchJson<{ results: ItunesResult[] }>(`${BASE}/lookup?id=${numeric}`)
    const track = data.results.find((r): r is ItunesTrack => r.wrapperType === 'track')
    if (!track) return null
    return { release: fromTrack(track), tracks: [], copyright: null }
  }
  return null
}

export async function lookupArtist(
  artistId: number,
): Promise<{ artist: ArtistInfo; releases: Release[] } | null> {
  const data = await fetchJson<{ results: ItunesResult[] }>(
    `${BASE}/lookup?id=${artistId}&entity=album&limit=100`,
  )
  const artist = data.results.find((r): r is ItunesArtist => r.wrapperType === 'artist')
  if (!artist) return null
  const releases = data.results
    .filter((r): r is ItunesCollection => r.wrapperType === 'collection')
    .map(fromCollection)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  return {
    artist: {
      id: artist.artistId,
      name: artist.artistName,
      genre: artist.primaryGenreName ?? null,
      url: artist.artistLinkUrl ?? null,
    },
    releases,
  }
}

interface RssEntry {
  'im:name': { label: string }
  'im:artist': { label: string; attributes?: { href?: string } }
  'im:image': Array<{ label: string }>
  'im:releaseDate'?: { label: string }
  id: { attributes: { 'im:id': string } }
  category?: { attributes?: { label?: string } }
  link?: { attributes?: { href?: string } }
}

/** Current most-played albums in the US, via the legacy iTunes RSS (CORS: *). */
export async function fetchTopAlbums(limit = 24): Promise<Release[]> {
  const data = await fetchJson<{ feed: { entry?: RssEntry[] } }>(
    `${BASE}/us/rss/topalbums/limit=${limit}/json`,
  )
  const entries = data.feed.entry ?? []
  return entries.map((e) => {
    const { kind, title } = classifyCollection(e['im:name'].label)
    const artistHref = e['im:artist'].attributes?.href
    const artistIdMatch = artistHref?.match(/\/id(\d+)/)
    const raw = e['im:image'][e['im:image'].length - 1]?.label ?? ''
    return {
      id: `c${e.id.attributes['im:id']}`,
      kind,
      title,
      artist: e['im:artist'].label,
      artistId: artistIdMatch ? Number(artistIdMatch[1]) : null,
      // normalize the RSS 170x170 asset to the standard 100x100bb template
      artworkUrl: raw.replace(/\/\d+x\d+bb?\.(png|jpg)$/, '/100x100bb.$1') || PLACEHOLDER_ART,
      year: yearOf(e['im:releaseDate']?.label),
      genre: e.category?.attributes?.label ?? null,
      trackCount: null,
      explicit: false,
      previewUrl: null,
      appleUrl: e.link?.attributes?.href ?? null,
      collectionId: null,
      collectionName: null,
    }
  })
}
