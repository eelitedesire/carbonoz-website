'use client'

import { ChevronDown, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useHistory } from '@/sim/hooks'
import { dayOf, NO_FAULTS } from '@/sim/model'
import { inverters, packs, clock } from '@/sim/telemetry'
import { dayName } from '@/sim/format'
import { ChartPanel, SERIES, statsFor } from '@/components/homeos/ChartPanel'
import { Card, cn, ctrl, Tabs } from '@/components/homeos/ui'

type Group = 'overview' | 'inverter' | 'battery' | 'grid' | 'load'
const GROUPS: { id: Group; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'inverter', label: 'Inverter' },
  { id: 'battery', label: 'Battery' },
  { id: 'grid', label: 'Grid' },
  { id: 'load', label: 'Load' },
]
const RANGES = [
  { id: 6, label: 'Last 6 hours' },
  { id: 24, label: 'Last 24 hours' },
  { id: 168, label: 'Last 7 days' },
]

/** The dashboard's chart grid (HomeOS "Charts Dashboard"), drawn from the simulation history. */
export function ChartsDashboard({ height = 120, initial = 'overview' as Group, className }: { height?: number; initial?: Group; className?: string }) {
  const [group, setGroup] = useState<Group>(initial)
  const [hours, setHours] = useState(24)
  const [open, setOpen] = useState(false)
  const [spin, setSpin] = useState(false)
  const hist = useHistory(hours, hours > 24 ? 30 : 10)
  const step = hours > 24 ? 6 : hours > 6 ? 2 : 1
  const stepMin = 5 * step
  const pts = useMemo(() => hist.filter((_, i) => i % step === 0), [hist, step])
  const derived = useMemo(() => pts.map((p) => ({ packs: packs(p, NO_FAULTS), inv: inverters(p, NO_FAULTS) })), [pts])
  const labels = pts.map((p) => (hours > 24 ? `${dayName(dayOf(p.t))} ${clock(p.t)}` : clock(p.t)))
  const ticks = useMemo<[number, string][]>(() => {
    const out: [number, string][] = []
    const every = hours > 24 ? 24 * 60 : hours > 6 ? 4 * 60 : 60
    pts.forEach((p, i) => {
      const m = Math.round(p.t) % every
      if (m < stepMin) out.push([i, hours > 24 ? dayName(dayOf(p.t)) : clock(p.t)])
    })
    return out
  }, [pts, hours, stepMin])

  const v = {
    pv: pts.map((p) => p.pv),
    load: pts.map((p) => p.load),
    grid: pts.map((p) => p.grid),
    soc: pts.map((p) => p.soc),
    batt: pts.map((p) => p.battery),
    inv1: derived.map((d) => d.inv[0].acPower),
    inv2: derived.map((d) => d.inv[1].acPower),
    invT: derived.map((d) => d.inv[0].temperature),
    freq: derived.map((d) => d.inv[0].frequency),
    packV: derived.map((d) => d.packs[0].voltage),
    temp: derived.map((d) => Math.max(...d.packs.map((p) => Math.max(...p.temperatures)))),
    spread: derived.map((d) => Math.max(...d.packs.map((p) => p.spreadMv))),
    imp: pts.map((p) => Math.max(0, p.grid)),
    exp: pts.map((p) => Math.max(0, -p.grid)),
  }
  const common = { labels, ticks, height }
  const panels = {
    pv: <ChartPanel key='pv' title='PV Production' unit='kW' series={[{ key: 'pv', name: 'Power (kW)', color: SERIES.pv, values: v.pv }]} stats={statsFor(v.pv, 'kW', stepMin, { total: true })} {...common} />,
    soc: <ChartPanel key='soc' title='Battery' unit='%' domain={[0, 100]} decimals={0} series={[{ key: 'soc', name: 'SOC (%)', color: SERIES.soc, values: v.soc }]} stats={statsFor(v.soc, '%', stepMin, { min: true, decimals: 0 })} {...common} />,
    load: <ChartPanel key='load' title='House Load' unit='kW' series={[{ key: 'load', name: 'Power (kW)', color: SERIES.load, values: v.load }]} stats={statsFor(v.load, 'kW', stepMin, { total: true })} {...common} />,
    grid: <ChartPanel key='grid' title='Grid Power' unit='kW' series={[{ key: 'grid', name: 'Power (kW)', color: SERIES.grid, values: v.grid }]} stats={statsFor(v.imp, 'kW', stepMin, { total: true })} {...common} />,
    inv: <ChartPanel key='inv' title='Inverter Output' unit='kW' kind='line' series={[{ key: 'i1', name: 'Inverter 1', color: SERIES.voltage, values: v.inv1 }, { key: 'i2', name: 'Inverter 2', color: SERIES.export, values: v.inv2 }]} stats={statsFor(v.inv1.map((x, i) => x + v.inv2[i]), 'kW', stepMin)} {...common} />,
    batt: <ChartPanel key='batt' title='Battery Power' unit='kW' kind='bar' series={[{ key: 'b', name: 'Power (kW)', color: SERIES.battPower, values: v.batt }]} stats={statsFor(v.batt, 'kW', stepMin, { min: true })} {...common} />,
    invT: <ChartPanel key='invT' title='Inverter Temperature' unit='°C' kind='line' series={[{ key: 't', name: 'Inverter 1 (°C)', color: SERIES.temp, values: v.invT }]} stats={statsFor(v.invT, '°C', stepMin, { min: true })} {...common} />,
    freq: <ChartPanel key='freq' title='Grid Frequency' unit='Hz' kind='line' decimals={2} domain={[49.9, 50.1]} series={[{ key: 'f', name: 'Frequency (Hz)', color: SERIES.voltage, values: v.freq }]} stats={statsFor(v.freq, 'Hz', stepMin, { min: true, decimals: 2 })} {...common} />,
    packV: <ChartPanel key='pv2' title='Pack Voltage' unit='V' kind='line' decimals={2} series={[{ key: 'v', name: 'Battery A (V)', color: SERIES.voltage, values: v.packV }]} stats={statsFor(v.packV, 'V', stepMin, { min: true, decimals: 2 })} {...common} />,
    temp: <ChartPanel key='temp' title='Battery Temperature' unit='°C' kind='line' series={[{ key: 't', name: 'Max sensor (°C)', color: SERIES.temp, values: v.temp }]} stats={statsFor(v.temp, '°C', stepMin, { min: true })} {...common} />,
    spread: <ChartPanel key='spread' title='Cell Spread' unit='mV' kind='line' decimals={0} series={[{ key: 's', name: 'Max spread (mV)', color: SERIES.battPower, values: v.spread }]} stats={statsFor(v.spread, 'mV', stepMin, { decimals: 0 })} {...common} />,
    impexp: <ChartPanel key='ie' title='Import / Export' unit='kW' kind='line' series={[{ key: 'i', name: 'Import', color: SERIES.grid, values: v.imp }, { key: 'e', name: 'Export', color: SERIES.export, values: v.exp }]} stats={statsFor(v.exp, 'kW', stepMin, { total: true })} {...common} />,
    pvload: <ChartPanel key='pl' title='Solar vs Load' unit='kW' kind='line' series={[{ key: 'p', name: 'Solar', color: SERIES.pv, values: v.pv }, { key: 'l', name: 'Load', color: SERIES.load, values: v.load }]} {...common} />,
  }
  const layout: Record<Group, (keyof typeof panels)[]> = {
    overview: ['pv', 'soc', 'load', 'grid', 'inv', 'batt'],
    inverter: ['inv', 'pv', 'invT', 'freq'],
    battery: ['soc', 'batt', 'packV', 'temp', 'spread'],
    grid: ['grid', 'impexp', 'freq'],
    load: ['load', 'pvload', 'grid'],
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>Charts Dashboard</h3>
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <button type='button' onClick={() => setOpen(!open)} aria-expanded={open} className='flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-panel/40 px-3 text-[12.5px] text-fg-2 hover:text-fg'>
              {RANGES.find((r) => r.id === hours)?.label}
              <ChevronDown size={14} />
            </button>
            {open && (
              <ul className='absolute right-0 z-20 mt-1 w-44 rounded-lg border border-line-strong bg-panel p-1 shadow-[var(--shadow-pop)]'>
                {RANGES.map((r) => (
                  <li key={r.id}>
                    <button type='button' onClick={() => (setHours(r.id), setOpen(false))} className={cn('w-full rounded-md px-2.5 py-1.5 text-left text-[12.5px]', r.id === hours ? 'bg-accent/15 text-fg' : 'text-fg-2 hover:bg-panel-3')}>
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type='button' aria-label='Refresh charts' className={cn(ctrl, 'border border-line-strong')} onClick={() => (setSpin(true), setTimeout(() => setSpin(false), 700))}>
            <RefreshCw size={15} className={cn(spin && 'animate-spin')} />
          </button>
        </div>
      </div>
      <div className='scroll-x -mx-1 mt-3 px-1'>
        <Tabs items={GROUPS} value={group} onChange={setGroup} label='Chart group' />
      </div>
      <div className='mt-3 grid gap-3 @2xl:grid-cols-2 @7xl:grid-cols-3'>{layout[group].map((k) => panels[k])}</div>
    </Card>
  )
}
