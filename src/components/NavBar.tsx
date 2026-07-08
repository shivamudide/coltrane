import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { cx } from '../lib/format'
import { ColtraneLogo } from './Logo'
import { Avatar } from './Avatar'
import { SearchIcon, PlusIcon } from './Icons'
import { QuickLogModal } from './QuickLogModal'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/browse', label: 'Browse' },
  { to: '/lists', label: 'Lists' },
  { to: '/queue', label: 'Listen Later', desktopOnly: true },
]

export function NavBar() {
  const profile = useStore((s) => s.profile)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [logging, setLogging] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    navigate(`/search?q=${encodeURIComponent(term)}`)
    setQ('')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5 sm:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Coltrane home">
          <ColtraneLogo height={28} />
          <span className="hidden text-[1.05rem] font-extrabold tracking-tight sm:block">coltrane</span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cx(
                  'rounded-full px-2.5 py-1 text-[0.8rem] font-semibold transition-colors sm:px-3',
                  l.desktopOnly && 'hidden md:block',
                  isActive ? 'bg-soft text-ink' : 'text-muted hover:text-ink',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submit} className="relative ml-auto hidden min-w-0 flex-1 sm:block sm:max-w-56">
          <SearchIcon
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="w-full rounded-full border border-line bg-card py-1.5 pl-8 pr-3 text-[0.82rem] placeholder:text-muted/70"
            placeholder="Search music…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search music"
          />
        </form>

        <Link
          to="/search"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-card text-muted sm:hidden"
          aria-label="Search"
        >
          <SearchIcon size={14} />
        </Link>

        <button type="button" className="btn btn-green btn-sm shrink-0 !gap-1" onClick={() => setLogging(true)}>
          <PlusIcon size={13} />
          <span className="hidden sm:inline">Log</span>
        </button>

        <Link to="/profile" className="shrink-0" aria-label="Your profile" title={profile.displayName}>
          <Avatar avatar={profile.avatar} name={profile.displayName} size={30} />
        </Link>
      </div>

      {logging && <QuickLogModal onClose={() => setLogging(false)} />}
    </header>
  )
}
