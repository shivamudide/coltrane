import { useEffect, useState } from 'react'

export interface Async<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Tiny fetch-on-mount hook keyed by `key`; ignores stale responses. */
export function useAsync<T>(key: string, fn: () => Promise<T>, enabled = true): Async<T> {
  const [state, setState] = useState<Async<T>>({ data: null, loading: enabled, error: null })

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null })
      return
    }
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fn()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (alive) setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Request failed' })
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return state
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · coltrane` : 'coltrane · your taste, on display'
  }, [title])
}
