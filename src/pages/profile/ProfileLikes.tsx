import { useStore } from '../../lib/store'
import { useDocumentTitle } from '../../lib/hooks'
import { plural } from '../../lib/format'
import { EmptyState } from '../../components/Section'
import { ReleaseGrid } from '../../components/ReleaseGrid'

export function ProfileLikes() {
  useDocumentTitle('Likes')
  const likes = useStore((s) => s.likes)
  const releases = useStore((s) => s.releases)

  const liked = Object.entries(likes)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => releases[id])
    .filter(Boolean)

  if (liked.length === 0) {
    return <EmptyState>Nothing liked yet. Tap the heart on anything that moves you.</EmptyState>
  }

  return (
    <>
      <p className="mb-3 text-xs text-muted">{plural(liked.length, 'like')}</p>
      <ReleaseGrid releases={liked} />
    </>
  )
}
