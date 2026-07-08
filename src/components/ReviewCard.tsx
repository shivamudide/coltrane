import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LogEntry, Release } from '../lib/types'
import { useStore } from '../lib/store'
import { fmtDate } from '../lib/format'
import { AlbumArt } from './AlbumArt'
import { StarsDisplay } from './Stars'
import { HeartIcon, RepeatIcon, PencilIcon } from './Icons'
import { LogModal } from './LogModal'

interface ReviewCardProps {
  log: LogEntry
  release: Release
  /** hide artwork column (used on release pages where art is already shown) */
  compact?: boolean
}

export function ReviewCard({ log, release, compact }: ReviewCardProps) {
  const profile = useStore((s) => s.profile)
  const [editing, setEditing] = useState(false)

  return (
    <article className="flex gap-4 border-b border-line py-4 last:border-b-0">
      {!compact && (
        <Link to={`/release/${release.id}`} className="w-16 shrink-0 sm:w-20">
          <AlbumArt release={release} size={160} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {!compact && (
            <Link to={`/release/${release.id}`} className="text-[1.02rem] font-bold leading-tight hover:text-green">
              {release.title}
            </Link>
          )}
          {!compact && release.year && <span className="text-sm text-muted">{release.year}</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {log.rating != null && <StarsDisplay value={log.rating} size={12} />}
          {log.liked && <HeartIcon size={12} filled className="text-orange" />}
          {log.relisten && <RepeatIcon size={12} className="text-blue" />}
          <span>
            Listened by <span className="font-semibold text-ink">{profile.displayName}</span> on {fmtDate(log.listenedOn)}
          </span>
          <button
            type="button"
            className="ml-auto flex cursor-pointer items-center gap-1 text-muted transition-colors hover:text-ink"
            onClick={() => setEditing(true)}
            title="Edit entry"
          >
            <PencilIcon size={12} /> Edit
          </button>
        </div>
        {log.review && <p className="mt-2 whitespace-pre-wrap text-[0.92rem] leading-relaxed">{log.review}</p>}
      </div>

      {editing && <LogModal release={release} existing={log} onClose={() => setEditing(false)} />}
    </article>
  )
}
