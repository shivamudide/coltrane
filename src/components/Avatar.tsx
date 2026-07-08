import { AVATARS } from '../lib/avatars'

interface AvatarProps {
  avatar: number
  name: string
  size?: number
}

export function Avatar({ avatar, name, size = 40 }: AvatarProps) {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: AVATARS[avatar % AVATARS.length],
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {initial}
    </span>
  )
}
