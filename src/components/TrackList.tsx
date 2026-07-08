import { useEffect, useRef, useState } from 'react'
import type { Track } from '../lib/types'
import { cx, fmtDuration } from '../lib/format'
import { PlayIcon, PauseIcon } from './Icons'

export function TrackList({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    const onEnd = () => setPlayingId(null)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('ended', onEnd)
      audio.pause()
      audio.src = ''
    }
  }, [])

  const toggle = (track: Track) => {
    const audio = audioRef.current
    if (!audio || !track.previewUrl) return
    if (playingId === track.id) {
      audio.pause()
      setPlayingId(null)
      return
    }
    audio.src = track.previewUrl
    void audio.play()
    setPlayingId(track.id)
  }

  return (
    <ol className="overflow-hidden rounded-[12px] border border-line bg-card">
      {tracks.map((t, i) => (
        <li
          key={t.id}
          className={cx(
            'flex items-center gap-3 px-3 py-2 text-sm',
            i > 0 && 'border-t border-line',
            playingId === t.id && 'bg-soft',
          )}
        >
          {t.previewUrl ? (
            <button
              type="button"
              className={cx(
                'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors',
                playingId === t.id ? 'bg-green text-white' : 'text-muted hover:bg-soft hover:text-ink',
              )}
              onClick={() => toggle(t)}
              aria-label={playingId === t.id ? `Pause ${t.name}` : `Play preview of ${t.name}`}
            >
              {playingId === t.id ? <PauseIcon size={11} /> : <PlayIcon size={11} />}
            </button>
          ) : (
            <span className="w-6 shrink-0 text-center font-mono text-xs text-muted tnum">{t.number}</span>
          )}
          <span className="min-w-0 flex-1 truncate">
            {t.name}
            {t.explicit && <span className="chip ml-2 !px-1">E</span>}
          </span>
          {t.durationMs != null && (
            <span className="shrink-0 font-mono text-xs text-muted tnum">{fmtDuration(t.durationMs)}</span>
          )}
        </li>
      ))}
    </ol>
  )
}
