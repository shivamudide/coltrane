import { useState } from 'react'
import { useStore } from '../lib/store'
import { cx } from '../lib/format'
import { Modal } from './Modal'
import { Avatar } from './Avatar'
import { AVATARS } from '../lib/avatars'

export function EditProfileModal({ onClose }: { onClose: () => void }) {
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)
  const resetAll = useStore((s) => s.resetAll)

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio)
  const [avatar, setAvatar] = useState(profile.avatar)

  const save = () => {
    updateProfile({
      displayName: displayName.trim() || 'Listener',
      username: (username.trim() || 'listener').toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: bio.trim(),
      avatar,
    })
    onClose()
  }

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          {AVATARS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cx(
                'cursor-pointer rounded-full transition-transform',
                avatar === i ? 'ring-2 ring-green ring-offset-2 ring-offset-card' : 'opacity-60 hover:opacity-100',
              )}
              onClick={() => setAvatar(i)}
              aria-label={`Avatar ${i + 1}`}
            >
              <Avatar avatar={i} name={displayName || 'L'} size={34} />
            </button>
          ))}
        </div>
        <div>
          <label className="micro mb-1 block">Display name</label>
          <input className="field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="micro mb-1 block">Username</label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted">@</span>
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="micro mb-1 block">Bio</label>
          <textarea
            className="field min-h-20 resize-y"
            placeholder="A line about your taste…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-fail hover:underline"
            onClick={() => {
              if (window.confirm('Erase all Coltrane data (logs, ratings, lists, likes)? This can’t be undone.')) {
                resetAll()
                onClose()
              }
            }}
          >
            Reset all data
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-green" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
