'use client'

import { ReactNode, useId, useMemo, useRef, useState, KeyboardEvent, PointerEvent } from 'react'
import { cx } from '@/components/ui/primitives'

export interface Series {
  key: string
  label: string
  color: string
  values: number[]
  kind?: 'area' | 'line' | 'dashed'
  unit?: string
  /** Use the right-hand 0–100 axis (e.g. SOC %). */
  right?: boolean
}

interface Props {
  /** One label per point (e.g. "14:05"). */
  xLabels: string[]
  series: Series[]
  height?: number
  /** Tick every n points. */
  tickEvery?: number
  className?: string
  /** Accessible summary of what the chart shows. */
  label: string
  /** Extra context rows in the tooltip for point i. */
  extra?: (i: number) => ReactNode
  /** Index to mark as "now" (history | forecast boundary). */
  nowIndex?: number
  /** Background bands, e.g. tariff windows or days. */
  bands?: { from: number; to: number; className: string }[]
  /** Controlled cursor (for linking several views). */
  cursor?: number | null
  onCursor?: (i: number | null) => void
  unit?: string
  /** Axis tick text (defaults to the point label). */
  tickFormat?: (i: number) => string
}

const PAD = { l: 38, r: 34, t: 12, b: 22 }

/**
 * Time-series chart: areas and lines on a shared time axis, with a crosshair
 * that works with mouse, touch and arrow keys and a tooltip of every series.
 */
export function TimeChart({ xLabels, series, height = 240, tickEvery, className, label, extra, nowIndex, bands, cursor, onCursor, unit = 'kW', tickFormat }: Props) {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const [own, setOwn] = useState<number | null>(null)
  const hover = cursor !== undefined ? cursor : own
  const setHover = (i: number | null) => (onCursor ? onCursor(i) : setOwn(i))
  const W = 1000
  const H = height
  const n = xLabels.length
  const left = series.filter((s) => !s.right)
  const { lo, hi } = useMemo(() => {
    let lo = 0
    let hi = 0.5
    for (const s of left) for (const v of s.values) (lo = Math.min(lo, v)), (hi = Math.max(hi, v))
    const pad = (hi - lo) * 0.08
    return { lo: lo < 0 ? lo - pad : 0, hi: hi + pad }
  }, [left])
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b)
  const yr = (v: number) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b)
  const ticks = useMemo(() => {
    const step = niceStep((hi - lo) / 4)
    const out: number[] = []
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6))
    return out
  }, [lo, hi])
  const every = tickEvery ?? Math.max(1, Math.round(n / 8))

  const paths = useMemo(
    () =>
      series.map((s) => {
        const yy = s.right ? yr : y
        let d = ''
        s.values.forEach((v, i) => (d += `${i ? 'L' : 'M'}${x(i).toFixed(1)},${yy(v).toFixed(1)}`))
        const area = s.kind === 'area' ? `${d}L${x(s.values.length - 1).toFixed(1)},${y(Math.max(lo, 0)).toFixed(1)}L${x(0).toFixed(1)},${y(Math.max(lo, 0)).toFixed(1)}Z` : null
        return { s, d, area }
      }),
    [series, lo, hi, n], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const pick = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    const px = ((e.clientX - r.left) / r.width) * W
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1)))))
  }
  const key = (e: KeyboardEvent) => {
    const cur = hover ?? (nowIndex ?? n - 1)
    const step = e.shiftKey ? Math.max(1, Math.round(n / 24)) : 1
    if (e.key === 'ArrowRight') setHover(Math.min(n - 1, cur + step))
    else if (e.key === 'ArrowLeft') setHover(Math.max(0, cur - step))
    else if (e.key === 'Home') setHover(0)
    else if (e.key === 'End') setHover(n - 1)
    else if (e.key === 'Escape') setHover(null)
    else return
    e.preventDefault()
  }

  const tipLeft = hover != null ? (x(hover) / W) * 100 : 0
  const describe = hover != null ? `${xLabels[hover]}: ${series.map((s) => `${s.label} ${s.values[hover]?.toFixed(1)} ${s.unit ?? unit}`).join(', ')}` : ''

  return (
    <div className={cx('relative select-none', className)}>
      <div
        ref={box}
        tabIndex={0}
        role='group'
        aria-roledescription='interactive chart'
        aria-label={`${label}. Use the left and right arrow keys to move through time.`}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
        onKeyDown={key}
        onBlur={() => setHover(null)}
        className='relative touch-pan-y rounded-md outline-none focus-visible:ring-1 focus-visible:ring-brand/60'
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' className='block w-full text-fg' style={{ height: H }} aria-hidden>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${id}-${s.key}`} x1='0' x2='0' y1='0' y2='1'>
                <stop offset='0%' stopColor={s.color} stopOpacity='0.32' />
                <stop offset='100%' stopColor={s.color} stopOpacity='0.02' />
              </linearGradient>
            ))}
          </defs>
          {bands?.map((b, i) => (
            <rect key={i} x={x(b.from)} y={PAD.t} width={Math.max(0, x(b.to) - x(b.from))} height={H - PAD.t - PAD.b} className={b.className} />
          ))}
          {ticks.map((t) => (
            <line key={t} x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--tooltip-border)' : 'var(--chart-grid)'} strokeDasharray={t === 0 ? undefined : '2 3'} vectorEffect='non-scaling-stroke' />
          ))}
          {nowIndex != null && nowIndex < n - 1 && (
            <rect x={x(nowIndex)} y={PAD.t} width={W - PAD.r - x(nowIndex)} height={H - PAD.t - PAD.b} fill='currentColor' fillOpacity='0.025' />
          )}
          {paths.map(({ s, d, area }) => (
            <g key={s.key}>
              {area && <path d={area} fill={`url(#${id}-${s.key})`} />}
              <path
                d={d}
                fill='none'
                stroke={s.color}
                strokeWidth={s.kind === 'area' ? 1.6 : 1.4}
                strokeDasharray={s.kind === 'dashed' ? '4 4' : undefined}
                vectorEffect='non-scaling-stroke'
                strokeLinejoin='round'
              />
            </g>
          ))}
          {nowIndex != null && <line x1={x(nowIndex)} x2={x(nowIndex)} y1={PAD.t} y2={H - PAD.b} stroke='var(--color-brand)' strokeOpacity='0.7' strokeDasharray='2 3' vectorEffect='non-scaling-stroke' />}
          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke='currentColor' strokeOpacity='0.45' vectorEffect='non-scaling-stroke' />}
        </svg>
        {/* Axis labels as HTML so they don't stretch with the SVG */}
        <div aria-hidden className='pointer-events-none absolute inset-0'>
          {ticks.map((t) => (
            <span key={t} className='num absolute left-0 -translate-y-1/2 text-[10px] text-subtle' style={{ top: y(t) }}>
              {Math.abs(t) < 1e-9 ? '0' : t.toFixed(t % 1 ? 1 : 0)}
            </span>
          ))}
          {series.some((s) => s.right) &&
            [0, 50, 100].map((t) => (
              <span key={t} className='num absolute right-0 -translate-y-1/2 text-[10px] text-subtle' style={{ top: yr(t) }}>
                {t}%
              </span>
            ))}
          {xLabels.map((l, i) =>
            i % every === 0 ? (
              <span key={i} className='num absolute bottom-0 -translate-x-1/2 text-[10px] text-subtle' style={{ left: `${(x(i) / W) * 100}%` }}>
                {tickFormat ? tickFormat(i) : l}
              </span>
            ) : null,
          )}
          {hover != null &&
            series.map((s) => (
              <span
                key={s.key}
                className='absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink-950'
                style={{ left: `${tipLeft}%`, top: (s.right ? yr : y)(s.values[hover] ?? 0), background: s.color }}
              />
            ))}
        </div>
        {hover != null && (
          <div
            className='pointer-events-none absolute top-1 z-10 w-max min-w-[170px] rounded-lg border border-[var(--tooltip-border)] bg-[var(--tooltip-bg)] px-2.5 py-2 text-[11.5px] shadow-xl'
            style={{ left: `${tipLeft}%`, transform: `translateX(${tipLeft > 60 ? 'calc(-100% - 12px)' : '12px'})` }}
          >
            <div className='num mb-1.5 text-[11px] text-muted'>{xLabels[hover]}</div>
            {series.map((s) => (
              <div key={s.key} className='flex items-center justify-between gap-5 py-0.5'>
                <span className='flex items-center gap-1.5 text-fg-2'>
                  <i className='h-1.5 w-1.5 rounded-full' style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className='num text-fg'>
                  {s.values[hover]?.toFixed(s.right ? 0 : 1)} {s.unit ?? unit}
                </span>
              </div>
            ))}
            {extra?.(hover)}
          </div>
        )}
      </div>
      <p className='sr-only' aria-live='polite'>
        {describe}
      </p>
      <div className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted'>
        {series.map((s) => (
          <span key={s.key} className='flex items-center gap-1.5'>
            <i className={cx('w-3', s.kind === 'dashed' ? 'h-0 border-t border-dashed' : 'h-[2px]')} style={{ background: s.kind === 'dashed' ? undefined : s.color, borderColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-6))))
  const f = raw / p
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p
}
