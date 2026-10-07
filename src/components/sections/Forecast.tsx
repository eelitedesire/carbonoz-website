'use client'

import { useMemo, useState } from 'react'
import { Live } from '@/components/ui/Live'
import { cx, SectionHeader, Segmented, SimTag } from '@/components/ui/primitives'
import { TimeChart } from '@/components/viz/TimeChart'
import { useSim } from '@/sim/hooks'
import { sim } from '@/sim/store'
import { DAY, dayOf, tariffAt } from '@/sim/model'
import { daySummary, horizon, WEATHER_LABEL } from '@/sim/forecast'
import { dayName } from '@/sim/format'
import { clock } from '@/sim/telemetry'
import { WeatherIcon } from './Intelligence'

type View = 'today' | 'tomorrow' | 'week'

export function Forecast({ index = '10' }: { index?: string }) {
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState<number | null>(null)
  const core = useSim((x) => x.core, (a, b) => Math.floor(a.t / 60) === Math.floor(b.t / 60))
  const controls = useSim((x) => x.controls)
  const today = dayOf(core.t)
  // Forecast issued at midnight today (from the battery state at that moment), so "today" shows the whole day.
  const all = useMemo(() => {
    const start = sim.history.find((s) => s.t >= today * DAY) ?? core
    return horizon({ ...start, t: today * DAY }, controls, 8 * 24, 30)
  }, [controls, today]) // eslint-disable-line react-hooks/exhaustive-deps
  const pts = useMemo(() => {
    if (view === 'today') return all.filter((p) => dayOf(p.t - 1e-6) === today)
    if (view === 'tomorrow') return all.filter((p) => dayOf(p.t - 1e-6) === today + 1)
    return all.filter((p, i) => i % 2 === 1 && dayOf(p.t - 1e-6) < today + 7)
  }, [all, view, today])
  const days = Array.from({ length: 7 }, (_, k) => daySummary(today + k))
  const nowIdx = pts.findIndex((p) => p.t >= core.t)
  const hoverDay = cursor != null ? dayOf(pts[cursor].t - 1e-6) : null

  return (
    <section id='forecast' aria-labelledby='fc-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Energy forecasting'
          id='fc-title'
          title={<>Seven days ahead, hour by hour.</>}
          lede='Weather, expected solar, expected demand and the battery plan on one timeline. Move across it to see the full energy context of any hour.'
        />

        <Live className='homeos mt-14'>
          <div className='panel overflow-hidden'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3'>
              <Segmented label='Forecast range' value={view} onChange={(v) => (setView(v), setCursor(null))} options={[{ id: 'today', label: 'Today' }, { id: 'tomorrow', label: 'Tomorrow' }, { id: 'week', label: 'Next 7 days' }]} size='sm' />
              <SimTag>Simulated forecast</SimTag>
            </div>
            <div className='scroll-x border-b border-line'>
              <div className='grid min-w-[640px] grid-cols-7'>
                {days.map((d, i) => (
                  <button
                    key={d.day}
                    type='button'
                    onClick={() => setView(i === 0 ? 'today' : i === 1 ? 'tomorrow' : 'week')}
                    className={cx('border-r border-line px-4 py-3 text-left transition-colors last:border-0', hoverDay === d.day ? 'bg-fg/[0.04]' : 'hover:bg-fg/[0.02]')}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-[12px] text-fg-2'>{i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName(d.day)}</span>
                      <WeatherIcon w={d.weather} />
                    </div>
                    <div className='num mt-1.5 text-[17px] text-fg'>{d.pvKwh.toFixed(0)} <span className='text-[11px] text-muted'>kWh</span></div>
                    <div className='num text-[11px] text-muted'>
                      {d.tempHi.toFixed(0)}° / {d.tempLo.toFixed(0)}° · {Math.round(d.cloud * 100)}% cloud
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className='p-4 sm:p-6'>
              <TimeChart
                label={`Forecast for ${view === 'week' ? 'the next seven days' : view}: solar, expected demand, planned battery state of charge and grid power`}
                xLabels={pts.map((p) => (view === 'week' ? `${dayName(dayOf(p.t - 1e-6))} ${clock(p.t)}` : clock(p.t)))}
                tickEvery={view === 'week' ? 24 : 8}
                tickFormat={view === 'week' ? (i) => dayName(dayOf(pts[i].t)) : undefined}
                height={300}
                nowIndex={nowIdx > 0 ? nowIdx : undefined}
                cursor={cursor}
                onCursor={setCursor}
                bands={pts.reduce<{ from: number; to: number; className: string }[]>((acc, p, i) => {
                  if (tariffAt(p.t) === 'peak') {
                    const last = acc[acc.length - 1]
                    if (last && last.to === i - 1) last.to = i
                    else acc.push({ from: i, to: i, className: 'fill-grid/[0.06]' })
                  }
                  return acc
                }, [])}
                series={[
                  { key: 'pv', label: 'Solar forecast', color: '#3fcf5e', kind: 'area', values: pts.map((p) => p.pv) },
                  { key: 'load', label: 'Expected demand', color: '#8b5cf6', values: pts.map((p) => p.load) },
                  { key: 'grid', label: 'Grid (+ import)', color: '#f97316', kind: 'dashed', values: pts.map((p) => p.grid) },
                  { key: 'soc', label: 'Planned battery SOC', color: '#14b8a6', right: true, unit: '%', values: pts.map((p) => p.soc) },
                ]}
                extra={(i) => (
                  <div className='mt-1.5 space-y-0.5 border-t border-line pt-1.5 text-[11px] text-muted'>
                    <div>
                      {WEATHER_LABEL[pts[i].weather]} · {pts[i].tempC.toFixed(0)} °C · {Math.round(pts[i].cloud * 100)}% cloud
                    </div>
                    <div>Tariff window: {tariffAt(pts[i].t)}</div>
                    <div>Battery: {pts[i].battery > 0.05 ? `charging ${pts[i].battery.toFixed(1)} kW` : pts[i].battery < -0.05 ? `discharging ${Math.abs(pts[i].battery).toFixed(1)} kW` : 'idle'}</div>
                  </div>
                )}
              />
              <p className='mt-3 text-[11.5px] text-subtle'>Shaded: example peak-tariff window 18:00–22:00. The platform accepts forecast points sent by the system (for example from a solar forecast provider); this chart uses the demo model’s own forecast.</p>
            </div>
          </div>
        </Live>
      </div>
    </section>
  )
}
