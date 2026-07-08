import { useState } from 'react'
import type { Release } from '../lib/types'
import { artworkUrl, cx } from '../lib/format'

interface AlbumArtProps {
  release: Release
  /** rendered pixel size used to pick the artwork resolution */
  size?: number
  className?: string
}

export function AlbumArt({ release, size = 300, className }: AlbumArtProps) {
  const [failed, setFailed] = useState(false)
  const src = artworkUrl(release.artworkUrl, size)

  if (failed || !release.artworkUrl) {
    return (
      <span
        className={cx('flex aspect-square w-full items-center justify-center rounded-[10px] border border-line bg-soft', className)}
        aria-label={`${release.title} artwork unavailable`}
      >
        <svg width="32%" height="32%" viewBox="0 0 24 24" className="text-[#d8cdbd]" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </span>
    )
  }

  return (
    <img
      src={src}
      srcSet={`${src} 1x, ${artworkUrl(release.artworkUrl, size * 2)} 2x`}
      alt={`${release.title} — ${release.artist}`}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cx('aspect-square w-full rounded-[10px] border border-line bg-soft object-cover', className)}
    />
  )
}
