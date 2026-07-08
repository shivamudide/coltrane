import { useEffect, useRef, useState } from 'react'
import type { Release } from '../lib/types'
import { searchReleases } from '../lib/itunes'
import { artworkUrl, kindLabel } from '../lib/format'
import { Modal } from './Modal'
import { LogModal } from './LogModal'
import { SearchIcon } from './Icons'

/** The "+ Log" flow: search anything, pick it, land in the log form. */
export function QuickLogModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Release[]>([])
  const [loading, setLoading] = useState(false)
  const [picked, setPicked] = useState<Release | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    window.clearTimeout(timer.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    timer.current = window.setTimeout(async () => {
      try {
        const r = await searchReleases(q, 'all', 10)
        setResults(r.slice(0, 12))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => window.clearTimeout(timer.current)
  }, [query])

  if (picked) {
    return <LogModal release={picked} onClose={onClose} />
  }

  return (
    <Modal title="Log an album, single or song" onClose={onClose}>
      <div className="relative">
        <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          className="field !pl-9"
          placeholder="Search music to log…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-3 flex max-h-80 flex-col gap-1 overflow-y-auto">
        {loading && <p className="px-1 py-2 text-sm text-muted">Searching…</p>}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted">No matches. Try a different spelling.</p>
        )}
        {results.map((r) => (
          <button
            key={r.id}
            type="button"
            className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-soft"
            onClick={() => setPicked(r)}
          >
            <img
              src={artworkUrl(r.artworkUrl, 60)}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md border border-line object-cover"
              loading="lazy"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{r.title}</span>
              <span className="block truncate text-xs text-muted">
                {r.artist}
                {r.year ? ` · ${r.year}` : ''}
              </span>
            </span>
            <span className="chip shrink-0">{kindLabel(r.kind)}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
