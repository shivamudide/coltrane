const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Upscale an iTunes 100x100 artwork URL to the given square size. */
export function artworkUrl(url: string, size: number): string {
  return url.replace(/100x100bb/, `${size}x${size}bb`)
}

/** Local date as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

/** 'YYYY-MM-DD' -> 'Jul 6, 2026' */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`
}

export function fmtTimestamp(ts: number): string {
  const d = new Date(ts)
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** 'YYYY-MM' -> 'July 2026' */
export function fmtMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return `${MONTHS_LONG[m - 1]} ${y}`
}

export function dayOfMonth(iso: string): string {
  return String(Number(iso.slice(8, 10)))
}

export function fmtDuration(ms: number): string {
  const total = Math.round(ms / 1000)
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function kindLabel(kind: 'album' | 'ep' | 'single' | 'song'): string {
  if (kind === 'ep') return 'EP'
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
