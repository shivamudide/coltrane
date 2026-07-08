import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useDocumentTitle } from '../lib/hooks'
import { artworkUrl, fmtTimestamp, plural } from '../lib/format'
import { EmptyState } from '../components/Section'
import { Modal } from '../components/Modal'
import { StarsDisplay } from '../components/Stars'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from '../components/Icons'

export function ListDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const list = useStore((s) => s.lists.find((l) => l.id === id))
  const releases = useStore((s) => s.releases)
  const ratings = useStore((s) => s.ratings)
  const moveInList = useStore((s) => s.moveInList)
  const toggleInList = useStore((s) => s.toggleInList)
  const updateListMeta = useStore((s) => s.updateListMeta)
  const deleteList = useStore((s) => s.deleteList)

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list?.title ?? '')
  const [description, setDescription] = useState(list?.description ?? '')
  useDocumentTitle(list?.title ?? 'List')

  if (!list) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <EmptyState>This list doesn’t exist (anymore).</EmptyState>
      </div>
    )
  }

  const items = list.releaseIds.map((rid) => releases[rid]).filter(Boolean)

  const saveMeta = () => {
    if (title.trim()) updateListMeta(list.id, { title: title.trim(), description: description.trim() })
    setEditing(false)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8">
      <p className="micro">
        <Link to="/lists" className="hover:text-green">
          Lists
        </Link>{' '}
        / {plural(items.length, 'release')}
      </p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{list.title}</h1>
          {list.description && <p className="mt-1.5 max-w-xl text-sm text-muted">{list.description}</p>}
          <p className="mt-1 text-xs text-muted">Updated {fmtTimestamp(list.updatedAt)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
            <PencilIcon size={12} /> Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm !text-fail"
            onClick={() => {
              if (window.confirm(`Delete the list “${list.title}”? This can’t be undone.`)) {
                deleteList(list.id)
                navigate('/lists')
              }
            }}
          >
            <TrashIcon size={12} /> Delete
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {items.length === 0 && (
          <EmptyState>
            Empty list. Find a release and use “Add to list” from its cover or page.
          </EmptyState>
        )}
        {items.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-[12px] border border-line bg-card px-3 py-2"
          >
            <span className="w-6 shrink-0 text-center font-mono text-sm font-semibold text-muted tnum">
              {i + 1}
            </span>
            <Link to={`/release/${r.id}`} className="shrink-0">
              <img
                src={artworkUrl(r.artworkUrl, 120)}
                alt=""
                className="h-14 w-14 rounded-md border border-line object-cover"
                loading="lazy"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/release/${r.id}`} className="block truncate font-semibold hover:text-green">
                {r.title}
              </Link>
              <span className="block truncate text-xs text-muted">
                {r.artist}
                {r.year ? ` · ${r.year}` : ''}
              </span>
              {ratings[r.id] != null && <StarsDisplay value={ratings[r.id]} size={11} />}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-soft hover:text-ink disabled:opacity-30"
                disabled={i === 0}
                onClick={() => moveInList(list.id, r.id, -1)}
                aria-label="Move up"
              >
                <ChevronUpIcon size={15} />
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-soft hover:text-ink disabled:opacity-30"
                disabled={i === items.length - 1}
                onClick={() => moveInList(list.id, r.id, 1)}
                aria-label="Move down"
              >
                <ChevronDownIcon size={15} />
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-soft hover:text-fail"
                onClick={() => toggleInList(list.id, r)}
                aria-label={`Remove ${r.title} from list`}
              >
                <XIcon size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title="Edit list" onClose={() => setEditing(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="micro mb-1 block">Name</label>
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="micro mb-1 block">Description</label>
              <textarea
                className="field min-h-20 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-green" onClick={saveMeta}>
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
