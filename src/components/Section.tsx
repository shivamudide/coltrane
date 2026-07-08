import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface SectionProps {
  title: string
  action?: { label: string; to: string }
  children: ReactNode
}

/** Letterboxd-style section: micro uppercase label with hairline rule. */
export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="mt-9 first:mt-0">
      <div className="mb-3 flex items-baseline justify-between border-b border-line pb-1.5">
        <h2 className="micro">{title}</h2>
        {action && (
          <Link to={action.to} className="text-[0.72rem] font-semibold uppercase tracking-wide text-muted hover:text-green">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-line bg-soft px-4 py-8 text-center text-sm text-muted">
      {children}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
      Loading…
    </div>
  )
}
