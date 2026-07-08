import { useEffect, useRef, useState } from 'react'
import type { Release } from '../lib/types'
import { searchReleases } from '../lib/itunes'
import { artworkUrl, kindLabel } from '../lib/format'
import { Modal } from './Modal'
import { SearchIcon } from './Icons'

interface ReleasePickerModalProps {
  title: string
  onPick: (release: Release) => void
  onClose: () => void
}

/** Generic search-and-pick modal (used for favorites and anywhere we need to select a release). */
export function ReleasePickerModal({ title, onPick, onClose }: ReleasePickerModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Release[]>([])
  const [loading, setLoading] = useState(false)
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
        setResults(await searchReleases(q, 'all', 10))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => window.clearTimeout(timer.current)
  }, [query])

  return (
    <Modal title={title} onClose={onClose}>
      <div className="relative">
        <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          className="field !pl-9"
          placeholder="Search albums, singles, songs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mt-3 flex max-h-80 flex-col gap-1 overflow-y-auto">
        {loading && <p className="px-1 py-2 text-sm text-muted">Searching…</p>}
        {results.map((r) => (
          <button
            key={r.id}
            type="button"
            className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-soft"
            onClick={() => {
              onPick(r)
              onClose()
            }}
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
