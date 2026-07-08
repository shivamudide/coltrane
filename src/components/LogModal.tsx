import { useState } from 'react'
import type { LogEntry, Release } from '../lib/types'
import { useStore } from '../lib/store'
import { cx, kindLabel, todayISO } from '../lib/format'
import { Modal } from './Modal'
import { RatingPicker } from './Stars'
import { AlbumArt } from './AlbumArt'
import { HeartIcon, RepeatIcon } from './Icons'

interface LogModalProps {
  release: Release
  /** when set, edits an existing diary entry instead of creating one */
  existing?: LogEntry
  onClose: () => void
}

export function LogModal({ release, existing, onClose }: LogModalProps) {
  const logListen = useStore((s) => s.logListen)
  const updateLog = useStore((s) => s.updateLog)
  const deleteLog = useStore((s) => s.deleteLog)
  const priorLogs = useStore((s) => s.logs).filter((l) => l.releaseId === release.id)

  const [listenedOn, setListenedOn] = useState(existing?.listenedOn ?? todayISO())
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null)
  const [review, setReview] = useState(existing?.review ?? '')
  const [liked, setLiked] = useState(existing?.liked ?? false)
  const [relisten, setRelisten] = useState(existing?.relisten ?? (!existing && priorLogs.length > 0))

  const save = () => {
    if (existing) {
      updateLog(existing.id, { listenedOn, rating, review, liked, relisten })
    } else {
      logListen(release, { listenedOn, rating, review, liked, relisten })
    }
    onClose()
  }

  return (
    <Modal title={existing ? 'Edit diary entry' : 'I listened…'} onClose={onClose} wide>
      <div className="flex gap-5">
        <div className="hidden w-28 shrink-0 sm:block">
          <AlbumArt release={release} size={200} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3">
            <span className="text-lg font-bold leading-tight">{release.title}</span>{' '}
            <span className="text-sm text-muted">
              {release.year ?? ''} · {release.artist} · {kindLabel(release.kind)}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              Listened on
              <input
                type="date"
                className="field !w-auto !py-1"
                value={listenedOn}
                max={todayISO()}
                onChange={(e) => setListenedOn(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={cx(
                'flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors',
                relisten ? 'text-green' : 'text-muted hover:text-ink',
              )}
              onClick={() => setRelisten(!relisten)}
              title="I've listened to this before"
            >
              <RepeatIcon size={15} />
              Relisten
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <div className="micro mb-1">Rating</div>
              <RatingPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <div className="micro mb-1">Like</div>
              <button
                type="button"
                className={cx(
                  'cursor-pointer transition-colors',
                  liked ? 'text-orange' : 'text-[#ddd2c2] hover:text-orange',
                )}
                onClick={() => setLiked(!liked)}
                aria-pressed={liked}
                aria-label="Like"
              >
                <HeartIcon size={24} filled={liked} />
              </button>
            </div>
          </div>

          <textarea
            className="field min-h-28 resize-y"
            placeholder="Add a review…"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          <div className="mt-4 flex items-center justify-between">
            {existing ? (
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-fail hover:underline"
                onClick={() => {
                  deleteLog(existing.id)
                  onClose()
                }}
              >
                Delete entry
              </button>
            ) : (
              <span className="text-xs text-muted">
                {priorLogs.length > 0 ? `Logged ${priorLogs.length}× before` : ''}
              </span>
            )}
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-green" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
