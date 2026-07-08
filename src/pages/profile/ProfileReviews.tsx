import { useStore } from '../../lib/store'
import { useDocumentTitle } from '../../lib/hooks'
import { EmptyState } from '../../components/Section'
import { ReviewCard } from '../../components/ReviewCard'

export function ProfileReviews() {
  useDocumentTitle('Reviews')
  const logs = useStore((s) => s.logs)
  const releases = useStore((s) => s.releases)

  const reviews = logs
    .filter((l) => l.review.length > 0)
    .sort((a, b) => b.listenedOn.localeCompare(a.listenedOn) || b.createdAt - a.createdAt)

  if (reviews.length === 0) {
    return (
      <EmptyState>
        No reviews yet. When you log a listen, add a few words — future you will thank you.
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col">
      {reviews.map((log) => {
        const release = releases[log.releaseId]
        if (!release) return null
        return <ReviewCard key={log.id} log={log} release={release} />
      })}
    </div>
  )
}
