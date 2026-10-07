import { useId } from 'react'

/** Minimal area sparkline. Symmetric around zero when values are signed. */
export function Sparkline({ values, color, height = 40, className, label, zero = true }: { values: number[]; color: string; height?: number; className?: string; label?: string; zero?: boolean }) {
  const id = useId()
  const w = 200
  if (values.length < 2) return <div style={{ height }} className={className} />
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = zero ? 0 : Math.max((hi - lo) * 0.15, 0.05)
  const min = zero ? Math.min(0, lo) : lo - pad
  const max = zero ? Math.max(0.001, hi) : hi + pad
  const y = (v: number) => height - 2 - ((v - min) / (max - min)) * (height - 4)
  const x = (i: number) => (i / (values.length - 1)) * w
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const base = zero ? y(0) : height
  const area = `${line}L${w},${base}L0,${base}Z`
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio='none' className={className} style={{ height, width: '100%' }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={id} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor={color} stopOpacity='0.28' />
          <stop offset='100%' stopColor={color} stopOpacity='0' />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      {zero && min < 0 && <line x1='0' x2={w} y1={y(0)} y2={y(0)} stroke='currentColor' strokeOpacity='0.15' vectorEffect='non-scaling-stroke' />}
      <path d={line} fill='none' stroke={color} strokeWidth='1.4' vectorEffect='non-scaling-stroke' strokeLinejoin='round' />
    </svg>
  )
}
