import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useStore, shelfIds } from '../../lib/store'
import { cx, fmtTimestamp } from '../../lib/format'
import { Avatar } from '../../components/Avatar'
import { EditProfileModal } from '../../components/EditProfileModal'
import { PencilIcon } from '../../components/Icons'

const TABS = [
  { to: '/profile', label: 'Overview', end: true },
  { to: '/profile/music', label: 'Music' },
  { to: '/profile/diary', label: 'Diary' },
  { to: '/profile/reviews', label: 'Reviews' },
  { to: '/profile/likes', label: 'Likes' },
]

export function ProfileLayout() {
  const profile = useStore((s) => s.profile)
  const logs = useStore((s) => s.logs)
  const ratings = useStore((s) => s.ratings)
  const likes = useStore((s) => s.likes)
  const lists = useStore((s) => s.lists)
  const [editing, setEditing] = useState(false)

  const shelf = shelfIds({ logs, ratings, likes })
  const year = new Date().getFullYear()
  const thisYear = new Set(
    logs.filter((l) => l.listenedOn.startsWith(String(year))).map((l) => l.releaseId),
  ).size

  const stats: Array<[number, string]> = [
    [shelf.length, 'releases'],
    [thisYear, 'this year'],
    [lists.length, 'lists'],
    [Object.keys(likes).length, 'likes'],
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar avatar={profile.avatar} name={profile.displayName} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{profile.displayName}</h1>
            <span className="chip">@{profile.username}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
              <PencilIcon size={11} /> Edit profile
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted">Listening since {fmtTimestamp(profile.joinedAt)}</p>
          {profile.bio && <p className="mt-1 max-w-lg text-sm text-muted">{profile.bio}</p>}
        </div>
        <div className="flex gap-5">
          {stats.map(([n, label]) => (
            <div key={label} className="text-center">
              <div className="text-xl font-extrabold leading-none tnum">{n}</div>
              <div className="micro mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cx(
                '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[0.82rem] font-semibold transition-colors',
                isActive
                  ? 'border-green text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
        <NavLink
          to="/lists"
          className="-mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-[0.82rem] font-semibold text-muted transition-colors hover:text-ink"
        >
          Lists
        </NavLink>
        <NavLink
          to="/queue"
          className="-mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-[0.82rem] font-semibold text-muted transition-colors hover:text-ink"
        >
          Listen Later
        </NavLink>
      </nav>

      <div className="pt-6">
        <Outlet />
      </div>

      {editing && <EditProfileModal onClose={() => setEditing(false)} />}
    </div>
  )
}
