import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Release } from '../lib/types'
import { useStore } from '../lib/store'
import { cx, kindLabel } from '../lib/format'
import { AlbumArt } from './AlbumArt'
import { StarsDisplay } from './Stars'
import { HeartIcon, ClockIcon, PlusIcon, ListIcon } from './Icons'
import { LogModal } from './LogModal'
import { AddToListModal } from './AddToListModal'

interface ReleaseCardProps {
  release: Release
  /** show title/artist under the artwork (grids on search etc.) */
  caption?: boolean
  /** extra line under caption, e.g. "#4" or a date */
  sub?: string
  size?: number
}

/**
 * The poster-equivalent: square artwork with Letterboxd-style hover
 * quick actions (log, like, listen later, add to list).
 */
export function ReleaseCard({ release, caption, sub, size = 220 }: ReleaseCardProps) {
  const rating = useStore((s) => s.ratings[release.id])
  const liked = useStore((s) => Boolean(s.likes[release.id]))
  const queued = useStore((s) => Boolean(s.queue[release.id]))
  const logged = useStore((s) => s.logs.some((l) => l.releaseId === release.id))
  const toggleLike = useStore((s) => s.toggleLike)
  const toggleQueue = useStore((s) => s.toggleQueue)
  const [modal, setModal] = useState<'log' | 'list' | null>(null)

  return (
    <div className="group/card min-w-0">
      <div className="relative">
        <Link to={`/release/${release.id}`} title={`${release.title} (${release.artist})`}>
          <AlbumArt
            release={release}
            size={size}
            className={cx(
              'transition-shadow group-hover/card:shadow-[0_4px_18px_rgba(26,20,16,0.16)]',
              logged && 'ring-1 ring-line',
            )}
          />
        </Link>

        {release.kind !== 'album' && (
          <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-1.5 py-px font-mono text-[0.58rem] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {kindLabel(release.kind)}
          </span>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 rounded-b-[10px] bg-gradient-to-t from-ink/85 to-ink/0 px-1 pb-1.5 pt-6 opacity-0 transition-opacity group-hover/card:pointer-events-auto group-hover/card:opacity-100"
        >
          <QuickAction label="Log this" onClick={() => setModal('log')}>
            <PlusIcon size={14} />
          </QuickAction>
          <QuickAction
            label={liked ? 'Unlike' : 'Like'}
            active={liked}
            activeClass="text-orange"
            onClick={() => toggleLike(release)}
          >
            <HeartIcon size={14} filled={liked} />
          </QuickAction>
          <QuickAction
            label={queued ? 'Remove from Listen Later' : 'Listen later'}
            active={queued}
            activeClass="text-blue"
            onClick={() => toggleQueue(release)}
          >
            <ClockIcon size={14} filled={queued} />
          </QuickAction>
          <QuickAction label="Add to list" onClick={() => setModal('list')}>
            <ListIcon size={14} />
          </QuickAction>
        </div>
      </div>

      {caption && (
        <div className="mt-1.5 min-w-0 leading-snug">
          <Link
            to={`/release/${release.id}`}
            className="block truncate text-[0.83rem] font-semibold hover:text-green"
          >
            {release.title}
          </Link>
          <span className="block truncate text-[0.74rem] text-muted">
            {release.artist}
            {release.year ? ` · ${release.year}` : ''}
          </span>
        </div>
      )}
      {(rating != null || sub) && (
        <div className="mt-0.5 flex items-center gap-1.5">
          {rating != null && <StarsDisplay value={rating} size={11} />}
          {sub && <span className="text-[0.7rem] text-muted">{sub}</span>}
        </div>
      )}

      {modal === 'log' && <LogModal release={release} onClose={() => setModal(null)} />}
      {modal === 'list' && <AddToListModal release={release} onClose={() => setModal(null)} />}
    </div>
  )
}

function QuickAction({
  label,
  active,
  activeClass,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  activeClass?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cx(
        'cursor-pointer rounded-full p-1.5 text-white/85 transition-colors hover:bg-white/15 hover:text-white',
        active && activeClass,
      )}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      {children}
    </button>
  )
}
