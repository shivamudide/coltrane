import { useState } from 'react'
import { cx } from '../lib/format'
import { XIcon } from './Icons'

const STAR_PATH =
  'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'

function Star({ size, fillPct }: { size: number; fillPct: number }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 text-[#ddd2c2]" aria-hidden>
        <path d={STAR_PATH} fill="currentColor" />
      </svg>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
        <svg width={size} height={size} viewBox="0 0 24 24" className="text-green" aria-hidden>
          <path d={STAR_PATH} fill="currentColor" />
        </svg>
      </span>
    </span>
  )
}

/** Read-only star row, e.g. "★★★½" — value in 0.5 steps. */
export function StarsDisplay({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center" title={`${value} star${value === 1 ? '' : 's'}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fillPct={Math.max(0, Math.min(1, value - i)) * 100} />
      ))}
    </span>
  )
}

interface RatingPickerProps {
  value: number | null
  onChange: (value: number | null) => void
  size?: number
}

/** Interactive Letterboxd-style rating: hover for half-star precision, click same value to clear. */
export function RatingPicker({ value, onChange, size = 26 }: RatingPickerProps) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value ?? 0

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex" onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} fillPct={Math.max(0, Math.min(1, shown - i)) * 100} />
        ))}
        <span className="absolute inset-0 flex">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((half) => {
            const v = half * 0.5
            return (
              <button
                key={half}
                type="button"
                className="h-full flex-1 cursor-pointer"
                aria-label={`Rate ${v} star${v === 1 ? '' : 's'}`}
                onMouseEnter={() => setHover(v)}
                onFocus={() => setHover(v)}
                onBlur={() => setHover(null)}
                onClick={() => onChange(v === value ? null : v)}
              />
            )
          })}
        </span>
      </span>
      {value != null && (
        <button
          type="button"
          className="cursor-pointer text-muted transition-colors hover:text-fail"
          aria-label="Clear rating"
          title="Clear rating"
          onClick={() => onChange(null)}
        >
          <XIcon size={Math.max(12, size * 0.5)} />
        </button>
      )}
    </span>
  )
}

/** Compact rating text like "4.5" with a single star glyph. */
export function RatingBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-0.5 font-semibold text-green tnum', className)}>
      <svg width={11} height={11} viewBox="0 0 24 24" aria-hidden>
        <path d={STAR_PATH} fill="currentColor" />
      </svg>
      {value.toFixed(1).replace(/\.0$/, '')}
    </span>
  )
}
