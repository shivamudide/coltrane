import { useState } from 'react'
import type { Release } from '../lib/types'
import { useStore } from '../lib/store'
import { cx, plural } from '../lib/format'
import { Modal } from './Modal'
import { CheckIcon, PlusIcon } from './Icons'

interface AddToListModalProps {
  release: Release
  onClose: () => void
}

export function AddToListModal({ release, onClose }: AddToListModalProps) {
  const lists = useStore((s) => s.lists)
  const toggleInList = useStore((s) => s.toggleInList)
  const createList = useStore((s) => s.createList)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')

  const submitNew = () => {
    const t = title.trim()
    if (!t) return
    const id = createList(t, '')
    toggleInList(id, release)
    setTitle('')
    setCreating(false)
  }

  return (
    <Modal title={`Add “${release.title}” to lists`} onClose={onClose}>
      {lists.length === 0 && !creating && (
        <p className="mb-4 text-sm text-muted">You haven’t made any lists yet.</p>
      )}

      <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
        {lists.map((list) => {
          const included = list.releaseIds.includes(release.id)
          return (
            <button
              key={list.id}
              type="button"
              className={cx(
                'flex cursor-pointer items-center justify-between rounded-[10px] border px-3 py-2 text-left text-sm transition-colors',
                included ? 'border-green/40 bg-green/5' : 'border-line bg-card hover:bg-soft',
              )}
              onClick={() => toggleInList(list.id, release)}
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{list.title}</span>
                <span className="text-xs text-muted">{plural(list.releaseIds.length, 'release')}</span>
              </span>
              {included && <CheckIcon size={16} className="shrink-0 text-green" />}
            </button>
          )
        })}
      </div>

      {creating ? (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            className="field"
            placeholder="List name…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitNew()
            }}
          />
          <button type="button" className="btn btn-green" onClick={submitNew}>
            Create
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mt-3 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-green hover:underline"
          onClick={() => setCreating(true)}
        >
          <PlusIcon size={14} /> New list
        </button>
      )}

      <div className="mt-4 flex justify-end">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  )
}
