import { Link } from 'react-router-dom'
import { useStore, shelfIds } from '../lib/store'
import { fetchTopAlbums } from '../lib/itunes'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { plural } from '../lib/format'
import { Section, EmptyState, PageLoading } from '../components/Section'
import { ReleaseGrid } from '../components/ReleaseGrid'
import { ActivityFeed } from '../components/ActivityFeed'
import { ColtraneLogo } from '../components/Logo'

export function HomePage() {
  useDocumentTitle('')
  const top = useAsync('top-albums', () => fetchTopAlbums(18))
  const logs = useStore((s) => s.logs)
  const ratings = useStore((s) => s.ratings)
  const likes = useStore((s) => s.likes)
  const queue = useStore((s) => s.queue)
  const releases = useStore((s) => s.releases)
  const profile = useStore((s) => s.profile)

  const shelf = shelfIds({ logs, ratings, likes })
  const isNew = shelf.length === 0 && Object.keys(queue).length === 0
  const queueReleases = Object.entries(queue)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => releases[id])
    .filter(Boolean)
    .slice(0, 6)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      {isNew ? (
        <div className="mb-4 rounded-[14px] border border-line bg-card px-6 py-12 text-center sm:py-16">
          <div className="mb-6 flex justify-center">
            <ColtraneLogo height={120} className="mx-auto" />
          </div>
          <h1 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Your taste is part of your story.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted">
            Coltrane is where you put your listening on display — log what moves you,
            write about what defines you, and build a profile that shows who you are
            before you ever say a word.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/browse" className="btn btn-green">
              Start curating
            </Link>
            <Link to="/search?q=" className="btn btn-ghost">
              Search anything
            </Link>
          </div>
        </div>
      ) : (
        <h1 className="text-xl font-extrabold tracking-tight">
          Welcome back, {profile.displayName}.{' '}
          <span className="font-medium text-muted">
            You’ve logged {plural(logs.length, 'listen')} across {plural(shelf.length, 'release')}.
          </span>
        </h1>
      )}

      {queueReleases.length > 0 && (
        <Section title="From your Listen Later" action={{ label: 'See all', to: '/queue' }}>
          <ReleaseGrid releases={queueReleases} />
        </Section>
      )}

      <Section title="Popular this week" action={{ label: 'Browse', to: '/browse' }}>
        {top.loading && <PageLoading />}
        {top.error && <EmptyState>Couldn’t load the charts — check your connection.</EmptyState>}
        {top.data && <ReleaseGrid releases={top.data.slice(0, 12)} />}
      </Section>

      {!isNew && (
        <Section title="Recent activity" action={{ label: 'Profile', to: '/profile' }}>
          <ActivityFeed limit={8} />
        </Section>
      )}
    </div>
  )
}
