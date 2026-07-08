import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchReleases, searchArtists } from '../lib/itunes'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { cx } from '../lib/format'
import { EmptyState, PageLoading } from '../components/Section'
import { ReleaseGrid } from '../components/ReleaseGrid'
import { SearchIcon } from '../components/Icons'

const SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'album', label: 'Albums & singles' },
  { id: 'song', label: 'Songs' },
] as const

type Scope = (typeof SCOPES)[number]['id']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [input, setInput] = useState(q)
  const [scope, setScope] = useState<Scope>('all')
  useDocumentTitle(q ? `Search “${q}”` : 'Search')

  const results = useAsync(
    `search:${scope}:${q}`,
    () => searchReleases(q, scope, scope === 'all' ? 24 : 36),
    q.trim().length > 0,
  )
  const artists = useAsync(`artists:${q}`, () => searchArtists(q, 4), q.trim().length > 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) setParams({ q: input.trim() })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <form onSubmit={submit} className="relative mx-auto max-w-xl">
        <SearchIcon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus={!q}
          className="w-full rounded-full border border-line bg-card py-2.5 pl-11 pr-4 text-[0.95rem] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          placeholder="Search albums, singles, songs, artists…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      {q && (
        <>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={cx(
                  'cursor-pointer rounded-full border px-3 py-1 text-[0.78rem] font-semibold transition-colors',
                  scope === s.id
                    ? 'border-brown bg-brown text-white'
                    : 'border-line bg-card text-muted hover:text-ink',
                )}
                onClick={() => setScope(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {artists.data && artists.data.length > 0 && scope === 'all' && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="micro">Artists:</span>
              {artists.data.map((a) => (
                <Link
                  key={a.id}
                  to={`/artist/${a.id}`}
                  className="rounded-full border border-line bg-card px-3 py-1 text-[0.82rem] font-semibold transition-colors hover:border-[#c9b8a4]"
                >
                  {a.name}
                  {a.genre && <span className="ml-1.5 font-normal text-muted">{a.genre}</span>}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            {results.loading && <PageLoading />}
            {results.error && <EmptyState>Search failed — check your connection and try again.</EmptyState>}
            {results.data && results.data.length === 0 && (
              <EmptyState>Nothing found for “{q}”. Try another spelling or fewer words.</EmptyState>
            )}
            {results.data && results.data.length > 0 && <ReleaseGrid releases={results.data} />}
          </div>
        </>
      )}

      {!q && (
        <p className="mt-10 text-center text-sm text-muted">
          Find any album, single or song — then log it, rate it, and shelf it.
        </p>
      )}
    </div>
  )
}
