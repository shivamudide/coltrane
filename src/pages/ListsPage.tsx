import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useDocumentTitle } from '../lib/hooks'
import { artworkUrl, fmtTimestamp, plural } from '../lib/format'
import { EmptyState } from '../components/Section'
import { Modal } from '../components/Modal'
import { PlusIcon } from '../components/Icons'

export function ListsPage() {
  useDocumentTitle('Lists')
  const lists = useStore((s) => s.lists)
  const releases = useStore((s) => s.releases)
  const createList = useStore((s) => s.createList)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const submit = () => {
    const t = title.trim()
    if (!t) return
    createList(t, description.trim())
    setTitle('')
    setDescription('')
    setCreating(false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Lists</h1>
          <p className="mt-1 text-sm text-muted">
            Collect, curate and rank — mixtapes without the tape.
          </p>
        </div>
        <button type="button" className="btn btn-green" onClick={() => setCreating(true)}>
          <PlusIcon size={14} /> New list
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {lists.length === 0 && (
          <EmptyState>
            No lists yet. Start one — “Albums that raised me”, “2026 in singles”, you know the drill.
          </EmptyState>
        )}
        {lists.map((list) => {
          const covers = list.releaseIds
            .map((id) => releases[id])
            .filter(Boolean)
            .slice(0, 5)
          return (
            <Link
              key={list.id}
              to={`/list/${list.id}`}
              className="flex items-center gap-4 rounded-[14px] border border-line bg-card p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(26,20,16,0.08)]"
            >
              <div className="flex shrink-0">
                {covers.length === 0 ? (
                  <span className="h-14 w-14 rounded-md border border-line bg-soft" />
                ) : (
                  covers.map((r, i) => (
                    <img
                      key={r.id}
                      src={artworkUrl(r.artworkUrl, 120)}
                      alt=""
                      className="h-14 w-14 rounded-md border border-card object-cover shadow-sm"
                      style={{ marginLeft: i === 0 ? 0 : -20, zIndex: 5 - i }}
                      loading="lazy"
                    />
                  ))
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[1.02rem] font-bold">{list.title}</h2>
                <p className="text-xs text-muted">
                  {plural(list.releaseIds.length, 'release')} · updated {fmtTimestamp(list.updatedAt)}
                </p>
                {list.description && (
                  <p className="mt-1 truncate text-sm text-muted">{list.description}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {creating && (
        <Modal title="New list" onClose={() => setCreating(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="micro mb-1 block">Name</label>
              <input
                autoFocus
                className="field"
                placeholder="e.g. Albums that raised me"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                }}
              />
            </div>
            <div>
              <label className="micro mb-1 block">Description (optional)</label>
              <textarea
                className="field min-h-20 resize-y"
                placeholder="What ties these together?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-green" onClick={submit}>
                Create list
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
