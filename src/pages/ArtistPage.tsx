import { useParams } from 'react-router-dom'
import { lookupArtist } from '../lib/itunes'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { plural } from '../lib/format'
import { Section, EmptyState, PageLoading } from '../components/Section'
import { ReleaseGrid } from '../components/ReleaseGrid'

export function ArtistPage() {
  const { id = '' } = useParams()
  const result = useAsync(`artist:${id}`, () => lookupArtist(Number(id)))
  useDocumentTitle(result.data?.artist.name ?? 'Artist')

  if (result.loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <PageLoading />
      </div>
    )
  }
  if (result.error || !result.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <EmptyState>Couldn’t load this artist.</EmptyState>
      </div>
    )
  }

  const { artist, releases } = result.data
  const albums = releases.filter((r) => r.kind === 'album')
  const singles = releases.filter((r) => r.kind !== 'album')

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <p className="micro">Artist</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{artist.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {artist.genre ? `${artist.genre} · ` : ''}
        {plural(releases.length, 'release')} in the catalog
      </p>

      {albums.length > 0 && (
        <Section title={`Albums · ${albums.length}`}>
          <ReleaseGrid releases={albums} />
        </Section>
      )}
      {singles.length > 0 && (
        <Section title={`Singles & EPs · ${singles.length}`}>
          <ReleaseGrid releases={singles} />
        </Section>
      )}
      {releases.length === 0 && <EmptyState>No releases found for this artist.</EmptyState>}
    </div>
  )
}
