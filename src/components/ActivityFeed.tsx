import { Link } from 'react-router-dom'
import { useStore, deriveActivity } from '../lib/store'
import { artworkUrl, fmtTimestamp, plural } from '../lib/format'
import { StarsDisplay } from './Stars'
import { HeartIcon, ClockIcon, ListIcon, MusicIcon } from './Icons'

export function ActivityFeed({ limit }: { limit?: number }) {
  const logs = useStore((s) => s.logs)
  const likes = useStore((s) => s.likes)
  const queue = useStore((s) => s.queue)
  const lists = useStore((s) => s.lists)
  const releases = useStore((s) => s.releases)
  const profile = useStore((s) => s.profile)

  const events = deriveActivity({ logs, likes, queue, lists }).slice(0, limit ?? 50)

  if (events.length === 0) {
    return (
      <p className="rounded-[12px] border border-line bg-soft px-4 py-6 text-center text-sm text-muted">
        No activity yet. Search for an album and log your first listen.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {events.map((ev) => {
        const release = ev.releaseId ? releases[ev.releaseId] : undefined
        return (
          <div key={ev.key} className="flex items-center gap-3 border-b border-line py-2.5 text-sm last:border-b-0">
            {release ? (
              <Link to={`/release/${release.id}`} className="shrink-0">
                <img
                  src={artworkUrl(release.artworkUrl, 80)}
                  alt=""
                  className="h-9 w-9 rounded-md border border-line object-cover"
                  loading="lazy"
                />
              </Link>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-soft text-muted">
                <ListIcon size={14} />
              </span>
            )}

            <span className="min-w-0 flex-1 leading-snug">
              {ev.type === 'log' && release && (
                <>
                  <b>{profile.displayName}</b> listened to{' '}
                  <Link to={`/release/${release.id}`} className="font-semibold hover:text-green">
                    {release.title}
                  </Link>{' '}
                  {ev.log?.rating != null && (
                    <StarsDisplay value={ev.log.rating} size={11} />
                  )}
                  {ev.log?.review && <span className="text-muted"> and left a review</span>}
                </>
              )}
              {ev.type === 'like' && release && (
                <>
                  <b>{profile.displayName}</b> liked{' '}
                  <Link to={`/release/${release.id}`} className="font-semibold hover:text-green">
                    {release.title}
                  </Link>
                </>
              )}
              {ev.type === 'queue' && release && (
                <>
                  <b>{profile.displayName}</b> wants to listen to{' '}
                  <Link to={`/release/${release.id}`} className="font-semibold hover:text-green">
                    {release.title}
                  </Link>
                </>
              )}
              {ev.type === 'list' && ev.list && (
                <>
                  <b>{profile.displayName}</b> created the list{' '}
                  <Link to={`/list/${ev.list.id}`} className="font-semibold hover:text-green">
                    {ev.list.title}
                  </Link>{' '}
                  <span className="text-muted">({plural(ev.list.releaseIds.length, 'release')})</span>
                </>
              )}
              <span className="block text-xs text-muted">{fmtTimestamp(ev.ts)}</span>
            </span>

            <span className="shrink-0 text-muted">
              {ev.type === 'log' && <MusicIcon size={14} />}
              {ev.type === 'like' && <HeartIcon size={14} filled className="text-orange" />}
              {ev.type === 'queue' && <ClockIcon size={14} className="text-blue" />}
              {ev.type === 'list' && <ListIcon size={14} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}
