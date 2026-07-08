import { useEffect, type ReactNode } from 'react'
import { cx } from '../lib/format'
import { XIcon } from './Icons'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 pt-[8vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'w-full rounded-[14px] border border-line bg-card shadow-[0_12px_40px_rgba(26,20,16,0.18)]',
          wide ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="micro">{title}</h2>
          <button
            type="button"
            className="cursor-pointer rounded-full p-1 text-muted transition-colors hover:bg-soft hover:text-ink"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
