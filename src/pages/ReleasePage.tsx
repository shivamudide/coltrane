import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lookupRelease } from '../lib/itunes'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { useStore } from '../lib/store'
import { cx, kindLabel, plural } from '../lib/format'
import { AlbumArt } from '../components/AlbumArt'
import { RatingPicker } from '../components/Stars'
import { Section, EmptyState, PageLoading } from '../components/Section'
import { TrackList } from '../components/TrackList'
import { ReviewCard } from '../components/ReviewCard'
import { LogModal } from '../components/LogModal'
import { AddToListModal } from '../components/AddToListModal'
import {
  HeartIcon,
  ClockIcon,
  ListIcon,
  PlusIcon,
  ExternalIcon,
  MusicIcon,
} from '../components/Icons'

export function ReleasePage() {
  const { id = '' } = useParams()
  const detail = useAsync(`release:${id}`, () => lookupRelease(id))
  const cached = useStore((s) => s.releases[id])

  const release = detail.data?.release ?? cached ?? null
  useDocumentTitle(release ? `${release.title} — ${release.artist}` : 'Release')

  const rating = useStore((s) => (release ? (s.ratings[release.id] ?? null) : null))
  const liked = useStore((s) => Boolean(release && s.likes[release.id]))
  const queued = useStore((s) => Boolean(release && s.queue[release.id]))
  const logs = useStore((s) => s.logs).filter((l) => release && l.releaseId === release.id)
  const setRating = useStore((s) => s.setRating)
  const toggleLike = useStore((s) => s.toggleLike)
  const toggleQueue = useStore((s) => s.toggleQueue)

  const [modal, setModal] = useState<'log' | 'list' | null>(null)

  if (!release) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-8">
        {detail.loading ? (
          <PageLoading />
        ) : (
          <EmptyState>Couldn’t find this release. It may have been removed from the catalog.</EmptyState>
        )}
      </div>
    )
  }

  const tracks = detail.data?.tracks ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* left column: art + actions */}
        <div className="w-full shrink-0 md:w-64">
          <AlbumArt release={release} size={560} className="shadow-[0_10px_30px_rgba(26,20,16,0.14)]" />

          <div className="mt-4 rounded-[14px] border border-line bg-card p-4">
            <button type="button" className="btn btn-green w-full" onClick={() => setModal('log')}>
              <PlusIcon size={14} /> Log, rate or review
            </button>

            <div className="mt-4 flex items-center justify-center">
              <RatingPicker value={rating} onChange={(v) => setRating(release, v)} size={28} />
            </div>
            <p className="mt-1 text-center text-[0.7rem] text-muted">
              {rating != null ? `You rated this ${rating}★` : 'Rate this release'}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1 border-t border-line pt-3">
              <SideAction
                label={liked ? 'Liked' : 'Like'}
                active={liked}
                activeClass="text-orange"
                onClick={() => toggleLike(release)}
              >
                <HeartIcon size={18} filled={liked} />
              </SideAction>
              <SideAction
                label={queued ? 'Queued' : 'Listen later'}
                active={queued}
                activeClass="text-blue"
                onClick={() => toggleQueue(release)}
              >
                <ClockIcon size={18} filled={queued} />
              </SideAction>
              <SideAction label="Add to list" onClick={() => setModal('list')}>
                <ListIcon size={18} />
              </SideAction>
            </div>
          </div>

          {release.appleUrl && (
            <a
              href={release.appleUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-[12px] border border-line bg-card px-3 py-2 text-[0.8rem] font-semibold text-muted transition-colors hover:text-ink"
            >
              <ExternalIcon size={13} /> Open in Apple Music
            </a>
          )}
        </div>

        {/* right column: meta + tracks + reviews */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{release.title}</h1>
            {release.year && <span className="text-lg text-muted tnum">{release.year}</span>}
          </div>

          <p className="mt-1 text-[0.95rem] text-muted">
            {kindLabel(release.kind)} by{' '}
            {release.artistId ? (
              <Link to={`/artist/${release.artistId}`} className="font-semibold text-ink underline decoration-line underline-offset-2 hover:text-green">
                {release.artist}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{release.artist}</span>
            )}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {release.genre && <span className="chip">{release.genre}</span>}
            {release.trackCount != null && <span className="chip">{plural(release.trackCount, 'track')}</span>}
            {release.explicit && <span className="chip">Explicit</span>}
            {logs.length > 0 && (
              <span className="chip !border-green/30 !bg-green/8 !text-green">
                Logged {logs.length}×
              </span>
            )}
          </div>

          {release.kind === 'song' && release.collectionId && (
            <p className="mt-3 text-sm text-muted">
              From the album{' '}
              <Link to={`/release/c${release.collectionId}`} className="font-semibold text-ink hover:text-green">
                {release.collectionName}
              </Link>
            </p>
          )}

          {tracks.length > 0 && (
            <Section title={`Tracklist · ${plural(tracks.length, 'track')}`}>
              <TrackList tracks={tracks} />
              {detail.data?.copyright && (
                <p className="mt-2 text-[0.7rem] text-muted">{detail.data.copyright}</p>
              )}
            </Section>
          )}

          <Section title={logs.length > 0 ? `Your diary · ${plural(logs.length, 'entry')}` : 'Your diary'}>
            {logs.length === 0 ? (
              <EmptyState>
                <span className="mb-1 flex justify-center text-muted">
                  <MusicIcon size={20} />
                </span>
                You haven’t logged this yet. Hit “Log, rate or review” to add it to your diary.
              </EmptyState>
            ) : (
              <div className="flex flex-col">
                {logs.map((log) => (
                  <ReviewCard key={log.id} log={log} release={release} compact />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {modal === 'log' && <LogModal release={release} onClose={() => setModal(null)} />}
      {modal === 'list' && <AddToListModal release={release} onClose={() => setModal(null)} />}
    </div>
  )
}

function SideAction({
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
      className={cx(
        'flex cursor-pointer flex-col items-center gap-1 rounded-[10px] px-1 py-2 text-[0.68rem] font-semibold text-muted transition-colors hover:bg-soft hover:text-ink',
        active && activeClass,
      )}
      onClick={onClick}
    >
      {children}
      {label}
    </button>
  )
}
