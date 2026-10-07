'use client'

import { PointerEvent, useId, useMemo, useRef, useState } from 'react'
import { Card, cn } from './ui'

/** HomeOS series palette (src/design/theme.ts → SERIES). */
export const SERIES = {
  pv: '#3fcf5e',
  load: '#8b5cf6',
  grid: '#f97316',
  soc: '#14b8a6',
  battPower: '#eab308',
  temp: '#f43f5e',
  voltage: '#06b6d4',
  export: '#10b981',
} as const

/** useChartTheme() values, switched with the theme through CSS variables (see globals.css). */
const T = { grid: 'var(--chart-grid)', axis: 'var(--chart-axis)', cursor: 'var(--chart-cursor)', tooltipBg: 'var(--tooltip-bg)', tooltipBorder: 'var(--tooltip-border)' }

export interface PanelSeries {
  key: string
  name: string
  color: string
  values: number[]
}

export interface Stat {
  label: string
  value: string
}

/**
 * Dashboard chart panel: title, legend, headline statistics and an area,
 * line or bar chart with the app's grid, axes and tooltip.
 */
export function ChartPanel({
  title,
  series,
  labels,
  ticks,
  stats,
  unit,
  kind = 'area',
  domain,
  decimals = 1,
  height = 140,
  className,
  bare,
}: {
  title: string
  series: PanelSeries[]
  /** Tooltip time per point. */
  labels: string[]
  /** Axis labels: [index, text]. */
  ticks: [number, string][]
  stats?: Stat[]
  unit: string
  kind?: 'area' | 'line' | 'bar'
  domain?: [number, number]
  decimals?: number
  height?: number
  className?: string
  bare?: boolean
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const box = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const n = labels.length
  const W = 400
  const H = height
  const L = 26
  const B = 16
  const { lo, hi, yt } = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const s of series) for (const v of s.values) (lo = Math.min(lo, v)), (hi = Math.max(hi, v))
    if (domain) [lo, hi] = domain
    if (!Number.isFinite(lo)) [lo, hi] = [0, 1]
    if (!domain) lo = Math.min(0, lo)
    const raw = (hi - lo) / 4 || 1
    const mag = Math.pow(10, Math.floor(Math.log10(raw)))
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
    const start = domain ? lo : Math.floor(lo / step) * step
    const end = domain ? hi : Math.ceil(hi / step) * step
    const yt: number[] = []
    for (let v = start; v <= end + step / 2; v += step) yt.push(Math.round(v * 1000) / 1000)
    return { lo: start, hi: end, yt }
  }, [series, domain])
  // Rounded so server and browser render identical geometry (float noise breaks hydration).
  const r2 = (v: number) => Math.round(v * 100) / 100
  const x = (i: number) => r2(L + (i / Math.max(1, n - 1)) * (W - L - 4))
  const y = (v: number) => r2(6 + (1 - (v - lo) / (hi - lo || 1)) * (H - 6 - B))
  const paths = useMemo(
    () =>
      series.map((s) => {
        let d = ''
        s.values.forEach((v, i) => (d += `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`))
        return { s, d, area: `${d}L${x(n - 1).toFixed(1)},${y(Math.max(lo, 0)).toFixed(1)}L${x(0).toFixed(1)},${y(Math.max(lo, 0)).toFixed(1)}Z` }
      }),
    [series, lo, hi, n], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const pick = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    const px = ((e.clientX - r.left) / r.width) * W
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - 4)) * (n - 1)))))
  }
  const bw = r2(Math.max(1, (W - L - 4) / n - 0.6))
  const fmt = (v: number) => (unit === '%' ? `${Math.round(v)}%` : String(Math.round(v * 100) / 100))

  const body = (
    <>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-[13px] font-semibold text-fg'>{title}</p>
          <div className='mt-1.5 flex flex-wrap gap-x-3 gap-y-1'>
            {series.map((s) => (
              <span key={s.key} className='flex items-center gap-1.5 text-[11px] text-fg-2'>
                <span className='h-2 w-2 rounded-sm' style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
        {stats && (
          <dl className='flex shrink-0 gap-4 text-right'>
            {stats.map((st) => (
              <div key={st.label}>
                <dt className='text-[10.5px] text-muted'>{st.label}</dt>
                <dd className='tabular text-[13px] font-semibold text-fg'>{st.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div ref={box} className='relative mt-2 touch-pan-y' onPointerMove={pick} onPointerDown={pick} onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)} role='img' aria-label={`${title}: ${stats?.map((s) => `${s.label} ${s.value}`).join(', ') ?? ''}`}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' className='block w-full' style={{ height: H }} aria-hidden>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${gid}-${s.key}`} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={s.color} stopOpacity={0.42} />
                <stop offset='100%' stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          {yt.map((t) => (
            <line key={t} x1={L} x2={W - 4} y1={y(t)} y2={y(t)} stroke={T.grid} strokeDasharray='2 3' vectorEffect='non-scaling-stroke' />
          ))}
          {kind === 'bar'
            ? series[0].values.map((v, i) => <rect key={i} x={r2(x(i) - bw / 2)} width={bw} y={Math.min(y(v), y(0))} height={r2(Math.max(0.5, Math.abs(y(v) - y(0))))} rx={0.6} fill={series[0].color} />)
            : paths.map(({ s, d, area }) => (
                <g key={s.key}>
                  {kind === 'area' && <path d={area} fill={`url(#${gid}-${s.key})`} />}
                  <path d={d} fill='none' stroke={s.color} strokeWidth={1.5} vectorEffect='non-scaling-stroke' strokeLinejoin='round' />
                </g>
              ))}
          {kind === 'bar' && <line x1={L} x2={W - 4} y1={y(0)} y2={y(0)} stroke={T.axis} strokeOpacity={0.5} vectorEffect='non-scaling-stroke' />}
          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={6} y2={H - B} stroke={T.cursor} vectorEffect='non-scaling-stroke' />}
        </svg>
        <div aria-hidden className='pointer-events-none absolute inset-0'>
          {yt.map((t) => (
            <span key={t} className='tabular absolute left-0 -translate-y-1/2 text-[9px]' style={{ top: y(t), color: T.axis }}>
              {fmt(t)}
            </span>
          ))}
          {ticks.map(([i, l]) => (
            <span key={i} className='tabular absolute bottom-0 -translate-x-1/2 text-[9px]' style={{ left: `${(x(i) / W) * 100}%`, color: T.axis }}>
              {l}
            </span>
          ))}
        </div>
        {hover != null && (
          <div
            className='pointer-events-none absolute top-0 z-10 rounded-lg border px-2.5 py-2 text-[11px] shadow-xl'
            style={{ background: T.tooltipBg, borderColor: T.tooltipBorder, left: `${(x(hover) / W) * 100}%`, transform: `translateX(${x(hover) / W > 0.6 ? 'calc(-100% - 8px)' : '8px'})` }}
          >
            <p className='mb-1 text-muted'>{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.key} className='flex items-center gap-2 whitespace-nowrap'>
                <span className='h-2 w-2 rounded-sm' style={{ background: s.color }} />
                <span className='text-fg-2'>{s.name}</span>
                <span className='tabular ml-auto pl-3 font-semibold text-fg'>
                  {s.values[hover]?.toFixed(decimals)} {unit}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  )
  if (bare) return <div className={className}>{body}</div>
  return <Card className={cn('p-3.5', className)}>{body}</Card>
}

/** Max / Avg / Total helpers for kW series sampled every `stepMin`. */
export function statsFor(values: number[], unit: string, stepMin: number, opts: { total?: boolean; min?: boolean; decimals?: number } = {}): Stat[] {
  const d = opts.decimals ?? 1
  if (!values.length) return []
  const max = Math.max(...values)
  const min = Math.min(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const out: Stat[] = [{ label: 'Max', value: `${max.toFixed(d)} ${unit}`.trim() }]
  if (opts.min) out.push({ label: 'Min', value: `${min.toFixed(d)} ${unit}`.trim() })
  out.push({ label: 'Avg', value: `${avg.toFixed(d)} ${unit}`.trim() })
  if (opts.total) out.push({ label: 'Total', value: `${(values.reduce((a, b) => a + Math.max(0, b), 0) * (stepMin / 60)).toFixed(1)} kWh` })
  return out
}
