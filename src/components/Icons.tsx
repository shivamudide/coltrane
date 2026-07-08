interface IconProps {
  size?: number
  className?: string
}

function base(props: IconProps) {
  return {
    width: props.size ?? 16,
    height: props.size ?? 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className,
    'aria-hidden': true,
  } as const
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export function PlusIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M12 5v14" />
    </svg>
  )
}

export function HeartIcon(p: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={p.filled ? 'currentColor' : 'none'} strokeWidth={p.filled ? 0 : 2}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  )
}

export function ClockIcon(p: IconProps & { filled?: boolean }) {
  if (p.filled) {
    return (
      <svg {...base(p)} fill="currentColor" strokeWidth={0}>
        <path
          fillRule="evenodd"
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5a1 1 0 1 0-2 0v5c0 .38.21.72.55.9l3.5 1.9a1 1 0 1 0 .9-1.8L13 11.4V7Z"
        />
      </svg>
    )
  }
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function ListIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

export function PlayIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor" strokeWidth={0}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

export function PauseIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor" strokeWidth={0}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

export function XIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function PencilIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

export function TrashIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function ChevronUpIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ExternalIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

export function RepeatIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function MusicIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

export function CalendarIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
