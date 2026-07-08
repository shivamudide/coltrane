import { useStore } from '../lib/store'
import { useDocumentTitle } from '../lib/hooks'
import { plural } from '../lib/format'
import { EmptyState } from '../components/Section'
import { ReleaseGrid } from '../components/ReleaseGrid'

export function QueuePage() {
  useDocumentTitle('Listen Later')
  const queue = useStore((s) => s.queue)
  const releases = useStore((s) => s.releases)

  const queued = Object.entries(queue)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => releases[id])
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Listen Later</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        {queued.length > 0
          ? `${plural(queued.length, 'release')} waiting for a spin. Logging a listen clears it from the queue.`
          : 'Your queue of releases to get to — like a watchlist, for music.'}
      </p>

      {queued.length === 0 ? (
        <EmptyState>
          Nothing queued. Hover any cover and hit the clock icon to save it for later.
        </EmptyState>
      ) : (
        <ReleaseGrid releases={queued} />
      )}
    </div>
  )
}
