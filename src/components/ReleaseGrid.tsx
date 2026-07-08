import type { Release } from '../lib/types'
import { ReleaseCard } from './ReleaseCard'

interface ReleaseGridProps {
  releases: Release[]
  caption?: boolean
  /** map of releaseId -> sub caption */
  subs?: Record<string, string>
  dense?: boolean
}

export function ReleaseGrid({ releases, caption = true, subs, dense }: ReleaseGridProps) {
  return (
    <div
      className={
        dense
          ? 'grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8'
          : 'grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
      }
    >
      {releases.map((r) => (
        <ReleaseCard key={r.id} release={r} caption={caption} sub={subs?.[r.id]} size={dense ? 140 : 220} />
      ))}
    </div>
  )
}
