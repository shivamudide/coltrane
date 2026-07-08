import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LogEntry } from '../../lib/types'
import { useStore } from '../../lib/store'
import { useDocumentTitle } from '../../lib/hooks'
import { artworkUrl, dayOfMonth, fmtMonthKey } from '../../lib/format'
import { EmptyState } from '../../components/Section'
import { StarsDisplay } from '../../components/Stars'
import { HeartIcon, RepeatIcon, PencilIcon } from '../../components/Icons'
import { LogModal } from '../../components/LogModal'

export function ProfileDiary() {
  useDocumentTitle('Diary')
  const logs = useStore((s) => s.logs)
  const releases = useStore((s) => s.releases)
  const [editing, setEditing] = useState<LogEntry | null>(null)

  const months = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => b.listenedOn.localeCompare(a.listenedOn) || b.createdAt - a.createdAt,
    )
    const grouped = new Map<string, LogEntry[]>()
    for (const log of sorted) {
      const key = log.listenedOn.slice(0, 7)
      const bucket = grouped.get(key)
      if (bucket) bucket.push(log)
      else grouped.set(key, [log])
    }
    return [...grouped.entries()]
  }, [logs])

  if (logs.length === 0) {
    return <EmptyState>Your diary is empty. Log a listen and it’ll appear here, newest first.</EmptyState>
  }

  return (
    <>
      {months.map(([monthKey, entries]) => (
        <section key={monthKey} className="mb-7">
          <h2 className="micro mb-2 border-b border-line pb-1.5">{fmtMonthKey(monthKey)}</h2>
          <div className="flex flex-col">
            {entries.map((log) => {
              const release = releases[log.releaseId]
              if (!release) return null
              return (
                <div key={log.id} className="flex items-center gap-3 border-b border-line py-2 last:border-b-0">
                  <span className="w-8 shrink-0 text-center font-mono text-lg font-bold text-muted tnum">
                    {dayOfMonth(log.listenedOn)}
                  </span>
                  <Link to={`/release/${release.id}`} className="shrink-0">
                    <img
                      src={artworkUrl(release.artworkUrl, 80)}
                      alt=""
                      className="h-10 w-10 rounded-md border border-line object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/release/${release.id}`}
                      className="block truncate text-sm font-semibold hover:text-green"
                    >
                      {release.title}
                    </Link>
                    <span className="block truncate text-xs text-muted">{release.artist}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-muted">
                    {log.rating != null && <StarsDisplay value={log.rating} size={12} />}
                    {log.liked && <HeartIcon size={13} filled className="text-orange" />}
                    {log.relisten && <RepeatIcon size={13} className="text-blue" />}
                    {log.review && (
                      <span className="chip hidden sm:inline-flex" title="Has review">
                        Review
                      </span>
                    )}
                    <button
                      type="button"
                      className="cursor-pointer rounded-full p-1 transition-colors hover:bg-soft hover:text-ink"
                      onClick={() => setEditing(log)}
                      aria-label="Edit entry"
                    >
                      <PencilIcon size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {editing && releases[editing.releaseId] && (
        <LogModal release={releases[editing.releaseId]} existing={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
