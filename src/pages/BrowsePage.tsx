import { fetchTopAlbums } from '../lib/itunes'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { Section, EmptyState, PageLoading } from '../components/Section'
import { ReleaseGrid } from '../components/ReleaseGrid'

export function BrowsePage() {
  useDocumentTitle('Browse')
  const top = useAsync('top-albums-48', () => fetchTopAlbums(48))

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Browse</h1>
      <p className="mt-1 text-sm text-muted">
        The most-played albums on Apple Music right now. Hover any cover to log, like, or queue it.
      </p>

      <Section title="Top albums · United States">
        {top.loading && <PageLoading />}
        {top.error && <EmptyState>Couldn’t load the charts — check your connection.</EmptyState>}
        {top.data && (
          <ReleaseGrid
            releases={top.data}
            subs={Object.fromEntries(top.data.map((r, i) => [r.id, `#${i + 1}`]))}
          />
        )}
      </Section>
    </div>
  )
}
