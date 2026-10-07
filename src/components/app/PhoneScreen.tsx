'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Activity, BatteryCharging, Cpu, Gauge, House, ListTree, Plus, Radio, ShieldAlert, ShieldCheck, Sun, Zap } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { q, shallow, useSim, useToday } from '@/sim/hooks'
import { minuteOf } from '@/sim/model'
import { sim } from '@/sim/store'
import { batteryState, gridState } from '@/sim/format'
import { clock } from '@/sim/telemetry'
import { FlowBreakdown, FlowDiagramCompact } from '@/components/homeos/EnergyFlow'
import { BatteryGlyph, PylonIcon } from '@/components/homeos/Glyphs'
import { BatteryGauge, powerParts } from '@/components/homeos/cards'
import { AnimatedNumber, BrandMark, cn, StatusBadge } from '@/components/homeos/ui'
import { useReducedMotion } from '@/components/ui/useReducedMotion'

type Screen = 'home' | 'flow' | 'battery' | 'events'
const TOUR: Screen[] = ['home', 'flow', 'battery', 'events']

function useLive() {
  return useSim(
    (x, d) => {
      const dv = d()
      return {
        pv: q(x.core.pv),
        load: q(x.core.load),
        battery: q(x.core.battery),
        grid: q(x.core.grid),
        soc: q(x.core.soc, 0.5),
        outage: x.faults.gridOutage,
        alarms: dv.alarms.filter((a) => a.severity !== 'info').length,
        m: Math.floor(minuteOf(x.core.t)),
        inv: dv.inverters.every((i) => i.status !== 'Island mode') ? 'Normal' : 'Island mode',
        spread: Math.round(Math.max(...dv.packs.map((p) => p.spreadMv))),
      }
    },
    shallow,
  )
}

type Live = ReturnType<typeof useLive>

function Tile({ icon, tint, label, value, unit, decimals, state, stateTone }: { icon: ReactNode; tint: string; label: string; value: number; unit: string; decimals: number; state: string; stateTone?: string }) {
  return (
    <div className='flex items-center gap-3 rounded-[16px] border border-line bg-panel px-3 py-3 shadow-[var(--shadow-card)]'>
      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full', tint)}>{icon}</span>
      <span className='min-w-0'>
        <span className='block truncate text-[14px] font-semibold text-fg'>{label}</span>
        <span className='tabular block text-[16px] font-semibold leading-tight text-fg'>
          <AnimatedNumber value={value} decimals={decimals} />
          <span className='ml-0.5 text-[12px] font-medium text-fg-2'>{unit}</span>
        </span>
        <span className={cn('block truncate text-[12px] font-medium', stateTone ?? 'text-muted')}>{state}</span>
      </span>
    </div>
  )
}

function Home({ s }: { s: Live }) {
  const today = useToday()
  const pv = powerParts(s.pv)
  const load = powerParts(s.load)
  const grid = powerParts(s.outage ? 0 : s.grid)
  const b = batteryState(s.battery)
  const g = gridState(s.grid, s.outage)
  const healthy = s.alarms === 0 && !s.outage
  return (
    <div className='grid gap-3'>
      <div className='flex flex-wrap justify-center gap-1.5'>
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium', healthy ? 'border-batt/30 bg-batt/10 text-batt' : 'border-gridp/30 bg-gridp/10 text-gridp')}>
          {healthy ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {healthy ? 'System healthy' : s.outage ? 'Grid outage' : `${s.alarms} active alarm${s.alarms > 1 ? 's' : ''}`}
        </span>
        <span className='tabular inline-flex items-center rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-fg-2'>{Math.round(today.selfSufficiency)}% self-sufficient</span>
      </div>
      <div className='grid grid-cols-2 gap-2.5'>
        <Tile icon={<Sun size={21} strokeWidth={1.7} className='text-solar' />} tint='bg-solar/15' label='Solar' value={pv.value} decimals={pv.decimals} unit={pv.unit} state={s.pv > 0.02 ? 'Producing' : 'Idle'} stateTone={s.pv > 0.02 ? 'text-batt' : undefined} />
        <Tile icon={<BatteryGlyph level={s.soc} width={17} height={28} charging={b === 'Charging'} />} tint='bg-batt/12' label='Battery' value={Math.round(s.soc)} decimals={0} unit='%' state={b} stateTone={b === 'Charging' ? 'text-batt' : b === 'Discharging' ? 'text-solar' : undefined} />
        <Tile icon={<House size={20} strokeWidth={1.7} className='text-home' />} tint='bg-home/12' label='Load' value={load.value} decimals={load.decimals} unit={load.unit} state='Consuming' stateTone='text-home' />
        <Tile icon={<PylonIcon size={21} strokeWidth={1.4} className={s.outage ? 'text-danger' : 'text-fg-2'} />} tint='bg-gridp/12' label='Grid' value={grid.value} decimals={grid.decimals} unit={grid.unit} state={g} stateTone={s.outage ? 'text-danger' : g === 'Importing' ? 'text-gridp' : g === 'Exporting' ? 'text-batt' : undefined} />
      </div>
      <div className='rounded-[16px] border border-line bg-panel px-2 pb-1 pt-3 shadow-[var(--shadow-card)]'>
        <div className='flex items-center justify-between px-2'>
          <span className='text-[14px] font-semibold text-fg'>Energy Flow</span>
          <StatusBadge tone='good' dot>
            Live
          </StatusBadge>
        </div>
        <FlowDiagramCompact s={s} animate />
      </div>
      <ul className='grid grid-cols-3 gap-2'>
        {[
          { icon: <Cpu size={15} />, k: 'Inverters', v: `2 · ${s.inv}`, ok: s.inv === 'Normal' },
          { icon: <Gauge size={15} />, k: 'BMS', v: `Δ ${s.spread} mV`, ok: s.spread <= 30 },
          { icon: <Radio size={15} />, k: 'Gateway', v: 'Online', ok: true },
        ].map((x) => (
          <li key={x.k} className='rounded-[14px] border border-line bg-panel px-2.5 py-2'>
            <span className={cn('flex items-center gap-1.5 text-[11.5px] font-medium', x.ok ? 'text-batt' : 'text-gridp')}>
              {x.icon}
              {x.k}
            </span>
            <span className='tabular mt-0.5 block truncate text-[13px] font-semibold text-fg'>{x.v}</span>
          </li>
        ))}
      </ul>
      <div className='flex items-center justify-between rounded-[14px] border border-line bg-panel px-3 py-2.5 text-[12.5px]'>
        <span className='flex items-center gap-1.5 font-medium text-fg-2'>
          <Zap size={14} className='text-solar' /> Today
        </span>
        <span className='tabular text-fg'>
          <span className='text-solar'>{today.pv.toFixed(1)}</span> kWh solar · <span className='text-home'>{today.load.toFixed(1)}</span> kWh used
        </span>
      </div>
    </div>
  )
}

function Flow({ s }: { s: Live }) {
  return (
    <div className='grid gap-3'>
      <div className='rounded-[16px] border border-line bg-panel px-2 pb-2 pt-3 shadow-[var(--shadow-card)]'>
        <p className='px-2 text-[15px] font-semibold text-fg'>Energy Flow</p>
        <FlowDiagramCompact s={s} animate />
      </div>
      <div className='rounded-[16px] border border-line bg-panel p-3 shadow-[var(--shadow-card)]'>
        <FlowBreakdown s={s} />
      </div>
    </div>
  )
}

function Battery() {
  const p = useSim((_, d) => d().packs[0], (a, b) => Math.abs(a.voltage - b.voltage) < 0.003 && a.state === b.state)
  return (
    <div className='grid gap-3'>
      <div className='rounded-[16px] border border-line bg-panel p-4 shadow-[var(--shadow-card)]'>
        <div className='flex items-center justify-between'>
          <span className='text-[15px] font-semibold text-fg'>{p.name}</span>
          <StatusBadge tone={p.state === 'Charging' ? 'good' : p.state === 'Discharging' ? 'solar' : 'neutral'} dot>
            {p.state}
          </StatusBadge>
        </div>
        <div className='mt-3 grid grid-cols-[150px_1fr] items-center gap-4'>
          <BatteryGauge soc={p.soc} charging={p.state === 'Charging'} />
          <div>
            <p className='tabular text-[34px] font-semibold leading-none text-fg'>
              <AnimatedNumber value={p.soc} decimals={0} />
              <span className='text-[16px] text-fg-2'>%</span>
            </p>
            <p className='tabular mt-1 text-[12px] text-muted'>
              {p.voltage.toFixed(2)} V · {p.current.toFixed(1)} A
            </p>
          </div>
        </div>
      </div>
      <div className='rounded-[16px] border border-line bg-panel p-3 shadow-[var(--shadow-card)]'>
        <div className='mb-2 flex items-center justify-between px-1 text-[12px]'>
          <span className='font-semibold text-fg'>Cells · {p.bmsId}</span>
          <span className='tabular text-muted'>Δ {p.spreadMv.toFixed(0)} mV</span>
        </div>
        <ul className='grid grid-cols-4 gap-1.5'>
          {p.cells.map((c) => {
            const lo = c.id === p.minCell.id
            const hi = c.id === p.maxCell.id
            return (
              <li key={c.id} className={cn('rounded-[9px] border bg-panel-2 px-1.5 py-1.5', lo ? 'border-accent/50' : hi ? 'border-gridp/50' : 'border-line')}>
                <span className='block text-[10px] text-muted'>Cell {c.id}</span>
                <span className='tabular block text-[12.5px] font-semibold text-fg'>{c.voltage.toFixed(3)}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function Events() {
  const events = useSim(() => sim.events.slice(0, 9), (a, b) => a[0]?.id === b[0]?.id)
  return (
    <div className='rounded-[16px] border border-line bg-panel shadow-[var(--shadow-card)]'>
      <p className='border-b border-line px-4 py-3 text-[15px] font-semibold text-fg'>Events</p>
      <ul className='divide-y divide-line'>
        {events.map((e) => (
          <li key={e.id} className='flex items-start gap-2.5 px-4 py-2.5'>
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', e.level === 'critical' ? 'bg-danger' : e.level === 'warning' ? 'bg-gridp' : e.source === 'autopilot' ? 'bg-accent' : 'bg-batt')} />
            <span className='min-w-0 flex-1'>
              <span className='block text-[12.5px] leading-snug text-fg'>{e.message}</span>
              <span className='tabular text-[10.5px] text-muted'>{clock(e.t)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The CARBONOZ app as it runs on a phone — status bar, header, live screens
 * and tab bar — at native size (390 × 844), to be placed inside a device frame.
 * Tours its screens until the visitor taps; values come from the simulation.
 */
export function PhoneScreen() {
  const reduced = useReducedMotion()
  const s = useLive()
  const [screen, setScreen] = useState<Screen>('home')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (touched || reduced) return
    const id = setInterval(() => setScreen((x) => TOUR[(TOUR.indexOf(x) + 1) % TOUR.length]), screen === 'home' ? 9000 : 5500)
    return () => clearInterval(id)
  }, [touched, reduced, screen])

  const go = (x: Screen) => {
    setTouched(true)
    setScreen(x)
  }
  const tabs: { id: Screen; label: string; icon: ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <House size={21} strokeWidth={1.8} /> },
    { id: 'flow', label: 'Flow', icon: <Activity size={21} strokeWidth={1.8} /> },
    { id: 'battery', label: 'Battery', icon: <BatteryCharging size={21} strokeWidth={1.8} /> },
    { id: 'events', label: 'Events', icon: <ListTree size={21} strokeWidth={1.8} /> },
  ]

  return (
    <div className='homeos flex h-[844px] w-[390px] flex-col bg-app text-fg'>
      {/* status bar */}
      <div className='flex h-[50px] shrink-0 items-end justify-between px-8 pb-1.5 text-[15px] font-semibold text-fg'>
        <span className='tabular w-14'>{clock(s.m)}</span>
        <span className='flex w-14 items-center justify-end gap-1.5' aria-hidden>
          <svg width='17' height='11' viewBox='0 0 17 11' fill='currentColor'>
            <rect x='0' y='7' width='3' height='4' rx='1' />
            <rect x='4.5' y='5' width='3' height='6' rx='1' />
            <rect x='9' y='2.5' width='3' height='8.5' rx='1' />
            <rect x='13.5' y='0' width='3' height='11' rx='1' />
          </svg>
          <svg width='24' height='12' viewBox='0 0 24 12' fill='none'>
            <rect x='0.5' y='0.5' width='20' height='11' rx='3' stroke='currentColor' opacity='0.4' />
            <rect x='2' y='2' width={Math.max(2, (s.soc / 100) * 17)} height='8' rx='1.6' fill='currentColor' />
            <path d='M22 4v4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' opacity='0.4' />
          </svg>
        </span>
      </div>

      {/* app header */}
      <div className='flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-line px-4'>
        <span className='flex min-w-0 items-center gap-2.5'>
          <BrandMark size={30} showName={false} />
          <span className='min-w-0 leading-tight'>
            <span className='block text-[16px] font-semibold tracking-[-0.01em] text-fg'>CARBONOZ</span>
            <span className='block truncate text-[11.5px] text-muted'>Demo site · SolarBMS</span>
          </span>
        </span>
        <StatusBadge tone='good' dot pulse={!reduced}>
          Live
        </StatusBadge>
      </div>

      {/* screens */}
      <div className='relative min-h-0 flex-1 overflow-hidden px-3.5 pt-3.5'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.div key={screen} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {screen === 'home' && <Home s={s} />}
            {screen === 'flow' && <Flow s={s} />}
            {screen === 'battery' && <Battery />}
            {screen === 'events' && <Events />}
          </motion.div>
        </AnimatePresence>
        <div aria-hidden className='pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-app to-transparent' />
      </div>

      {/* tab bar */}
      <nav aria-label='App screens' className='relative flex h-[86px] shrink-0 items-start justify-around border-t border-line bg-panel/95 px-2 pt-2'>
        {tabs.slice(0, 2).map((t) => (
          <TabButton key={t.id} t={t} on={screen === t.id} go={go} />
        ))}
        <button type='button' onClick={() => go('flow')} aria-label='Quick actions' className='-mt-7 grid h-[58px] w-[58px] place-items-center rounded-full bg-accent text-on-accent shadow-[0_10px_28px_-8px_rgb(222_175_11/0.9)] ring-4 ring-app'>
          <Plus size={26} />
        </button>
        {tabs.slice(2).map((t) => (
          <TabButton key={t.id} t={t} on={screen === t.id} go={go} />
        ))}
        <span aria-hidden className='absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-fg/80' />
      </nav>
    </div>
  )
}

function TabButton({ t, on, go }: { t: { id: Screen; label: string; icon: ReactNode }; on: boolean; go: (s: Screen) => void }) {
  return (
    <button type='button' onClick={() => go(t.id)} aria-current={on ? 'page' : undefined} className={cn('flex min-w-14 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors', on ? 'text-accent-ink' : 'text-muted')}>
      {t.icon}
      {t.label}
    </button>
  )
}
