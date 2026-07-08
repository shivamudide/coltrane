interface ColtraneLogoProps {
  /** rendered height in px; width scales with the image aspect ratio */
  height?: number
  className?: string
}

export function ColtraneLogo({ height = 48, className }: ColtraneLogoProps) {
  const width = Math.round(height * (996 / 1024))
  return (
    <img
      src="/coltrane-logo.png"
      alt="Coltrane"
      height={height}
      width={width}
      className={className}
      draggable={false}
    />
  )
}
