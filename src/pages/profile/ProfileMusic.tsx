import { useMemo, useState } from 'react'
import { useStore, shelfIds } from '../../lib/store'
import { useDocumentTitle } from '../../lib/hooks'
import { cx, plural } from '../../lib/format'
import { EmptyState } from '../../components/Section'
import { ReleaseGrid } from '../../components/ReleaseGrid'

const KIND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'album', label: 'Albums' },
  { id: 'single', label: 'Singles & EPs' },
  { id: 'song', label: 'Songs' },
] as const

const SORTS = [
  { id: 'recent', label: 'Recently added' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'year', label: 'Release year' },
  { id: 'title', label: 'Title A–Z' },
] as const

export function ProfileMusic() {
  useDocumentTitle('Your music')
  const logs = useStore((s) => s.logs)
  const ratings = useStore((s) => s.ratings)
  const likes = useStore((s) => s.likes)
  const releases = useStore((s) => s.releases)
  const [kind, setKind] = useState<(typeof KIND_FILTERS)[number]['id']>('all')
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('recent')

  const shelf = useMemo(() => {
    let items = shelfIds({ logs, ratings, likes })
      .map((id) => releases[id])
      .filter(Boolean)
    if (kind === 'album') items = items.filter((r) => r.kind === 'album')
    if (kind === 'single') items = items.filter((r) => r.kind === 'single' || r.kind === 'ep')
    if (kind === 'song') items = items.filter((r) => r.kind === 'song')

    if (sort === 'rating') {
      items = [...items].sort((a, b) => (ratings[b.id] ?? -1) - (ratings[a.id] ?? -1))
    } else if (sort === 'year') {
      items = [...items].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    } else if (sort === 'title') {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title))
    }
    return items
  }, [logs, ratings, likes, releases, kind, sort])

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={cx(
                'cursor-pointer rounded-full border px-3 py-1 text-[0.78rem] font-semibold transition-colors',
                kind === f.id ? 'border-brown bg-brown text-white' : 'border-line bg-card text-muted hover:text-ink',
              )}
              onClick={() => setKind(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          Sort
          <select
            className="field !w-auto !py-1 text-xs"
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof SORTS)[number]['id'])}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {shelf.length === 0 ? (
        <EmptyState>Nothing here yet — everything you log, rate or like lands on this shelf.</EmptyState>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">{plural(shelf.length, 'release')}</p>
          <ReleaseGrid releases={shelf} />
        </>
      )}
    </>
  )
}
