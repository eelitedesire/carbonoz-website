'use client'

import { Pause, Play, RotateCcw } from 'lucide-react'
import { shallow, useSim } from '@/sim/hooks'
import { dayOf, minuteOf } from '@/sim/model'
import { sim } from '@/sim/store'
import { dayName } from '@/sim/format'
import { clock } from '@/sim/telemetry'
import { cx, Segmented, Slider } from '@/components/ui/primitives'

const JUMPS = [
  { label: 'Sunrise', m: 6 * 60 + 15 },
  { label: 'Midday', m: 12 * 60 },
  { label: 'Evening peak', m: 19 * 60 },
  { label: 'Night', m: 23 * 60 },
]

const SPEEDS = [
  { id: '60', label: '60×' },
  { id: '600', label: '600×' },
  { id: '3600', label: '3600×' },
] as const

/** Visitor controls for the shared simulation: clock, speed, sunlight, demand. */
/** `minimal` (phone hero): clock, play and speed up front; sunlight and demand behind a disclosure. */
export function SimControls({ compact, minimal, className }: { compact?: boolean; minimal?: boolean; className?: string }) {
  const s = useSim((x) => ({ m: Math.floor(minuteOf(x.core.t)), day: dayOf(x.core.t), playing: x.playing, speed: x.speed, sun: x.overrides.sun, load: x.overrides.load }), shallow)
  const speed = String(s.speed) as (typeof SPEEDS)[number]['id']

  return (
    <div className={cx('grid gap-4', className)}>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => sim.setPlaying(!s.playing)}
            aria-label={s.playing ? 'Pause simulation' : 'Play simulation'}
            className={cx('flex items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:bg-fg/5', minimal ? 'h-11 w-11' : 'h-8 w-8')}
          >
            {s.playing ? <Pause size={13} /> : <Play size={13} className='translate-x-px' />}
          </button>
          <div className='leading-tight'>
            <div className='num text-[15px] text-fg' aria-live='off'>
              {clock(s.m)}
            </div>
            <div className='label text-[9.5px] text-subtle'>{dayName(s.day)} · sim time</div>
          </div>
        </div>
        <Segmented size='sm' label='Simulation speed' value={SPEEDS.some((x) => x.id === speed) ? speed : '60'} options={[...SPEEDS]} onChange={(v) => sim.setSpeed(Number(v))} />
        {!compact && (
          <div className='flex flex-wrap gap-1.5'>
            {JUMPS.map((j) => (
              <button
                key={j.label}
                type='button'
                onClick={() => sim.jumpTo(j.m)}
                className='h-7 rounded-[5px] border border-line px-2.5 text-[12px] text-fg-2 transition-colors hover:border-line-strong hover:text-fg'
              >
                {j.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {minimal ? (
        <details className='group rounded-[10px] border border-line px-3 py-2'>
          <summary className='flex min-h-11 cursor-pointer list-none items-center justify-between text-[13px] text-fg-2 [&::-webkit-details-marker]:hidden'>
            Adjust sunlight and demand
            <span aria-hidden className='text-muted transition-transform group-open:rotate-45'>+</span>
          </summary>
          <div className='pb-2 pt-1'>
      <div className='grid gap-x-6 gap-y-2 sm:grid-cols-2'>
              <label className='grid gap-0.5'>
                <span className='flex items-center justify-between text-[12px]'>
                  <span className='text-muted'>Sunlight</span>
                  <span className='num text-solar'>{Math.round(s.sun * 100)}%</span>
                </span>
                <Slider label='Sunlight' value={s.sun} min={0} max={1.3} step={0.01} tint='var(--color-solar)' valueText={`${Math.round(s.sun * 100)}% of forecast irradiance`} onChange={(v) => sim.setOverrides({ sun: v })} />
              </label>
              <label className='grid gap-0.5'>
                <span className='flex items-center justify-between text-[12px]'>
                  <span className='text-muted'>Demand</span>
                  <span className='num text-load'>{Math.round(s.load * 100)}%</span>
                </span>
                <Slider label='Demand' value={s.load} min={0.4} max={2.2} step={0.01} tint='var(--color-load)' valueText={`${Math.round(s.load * 100)}% of typical demand`} onChange={(v) => sim.setOverrides({ load: v })} />
              </label>
            </div>
          </div>
        </details>
      ) : (
      <div className='grid gap-x-6 gap-y-2 sm:grid-cols-2'>
        <label className='grid gap-0.5'>
          <span className='flex items-center justify-between text-[12px]'>
            <span className='text-muted'>Sunlight</span>
            <span className='num text-solar'>{Math.round(s.sun * 100)}%</span>
          </span>
          <Slider label='Sunlight' value={s.sun} min={0} max={1.3} step={0.01} tint='var(--color-solar)' valueText={`${Math.round(s.sun * 100)}% of forecast irradiance`} onChange={(v) => sim.setOverrides({ sun: v })} />
        </label>
        <label className='grid gap-0.5'>
          <span className='flex items-center justify-between text-[12px]'>
            <span className='text-muted'>Demand</span>
            <span className='num text-load'>{Math.round(s.load * 100)}%</span>
          </span>
          <Slider label='Demand' value={s.load} min={0.4} max={2.2} step={0.01} tint='var(--color-load)' valueText={`${Math.round(s.load * 100)}% of typical demand`} onChange={(v) => sim.setOverrides({ load: v })} />
        </label>
      </div>
      )}
      {(Math.abs(s.sun - 1) > 0.01 || Math.abs(s.load - 1) > 0.01) && (
        <button type='button' onClick={() => sim.setOverrides({ sun: 1, load: 1 })} className='label inline-flex w-fit items-center gap-1.5 text-[10px] text-muted hover:text-fg'>
          <RotateCcw size={11} /> Reset sunlight and demand
        </button>
      )}
    </div>
  )
}
