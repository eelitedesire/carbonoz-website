'use client'

import { AnimatePresence, motion } from 'motion/react'
import { BatteryCharging, BrainCircuit, Cpu, Home, Sun, Zap, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Live } from '@/components/ui/Live'
import { Num } from '@/components/ui/Num'
import { Badge, cx, SectionHeader, SimTag } from '@/components/ui/primitives'
import { FlowPath } from '@/components/viz/FlowPath'
import { Sparkline } from '@/components/viz/Sparkline'
import { q, shallow, useHistory, useSim, useToday } from '@/sim/hooks'
import { CAPACITY_KWH, dayOf, forecastPvKwh, SITE, tariffAt } from '@/sim/model'
import { batteryState, gridState } from '@/sim/format'
import { decision } from '@/sim/decision'

type NodeId = 'solar' | 'inverter' | 'battery' | 'load' | 'grid' | 'ai'

const W = 800
const H = 540
const NODES: Record<NodeId, { x: number; y: number; label: string; icon: LucideIcon; color: string; tone: string }> = {
  solar: { x: 140, y: 110, label: 'Solar', icon: Sun, color: 'var(--color-solar)', tone: 'text-solar' },
  grid: { x: 660, y: 110, label: 'Grid', icon: Zap, color: 'var(--color-grid)', tone: 'text-grid' },
  inverter: { x: 400, y: 270, label: 'Inverter', icon: Cpu, color: 'var(--color-fg)', tone: 'text-fg' },
  battery: { x: 140, y: 430, label: 'Battery', icon: BatteryCharging, color: 'var(--color-batt)', tone: 'text-batt' },
  load: { x: 660, y: 430, label: 'Load', icon: Home, color: 'var(--color-load)', tone: 'text-load' },
  ai: { x: 400, y: 470, label: 'Intelligence', icon: BrainCircuit, color: 'var(--color-ai)', tone: 'text-ai' },
}

const POWER = {
  solar: 'M186,138 C270,190 320,230 356,252',
  grid: 'M614,138 C530,190 480,230 444,252',
  battery: 'M356,290 C320,312 270,350 186,402',
  load: 'M444,290 C480,312 530,350 614,402',
}
// Telemetry links into the intelligence layer (data, not power).
const DATA = [
  'M140,160 C140,330 250,470 350,470',
  'M660,160 C660,330 550,470 450,470',
  'M400,318 L400,428',
  'M190,440 C260,452 300,466 350,468',
  'M610,440 C540,452 500,466 450,468',
]

const pos = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })

export function SystemAlive({ index = '01' }: { index?: string }) {
  const [sel, setSel] = useState<NodeId>('battery')
  const s = useSim((x) => ({ pv: q(x.core.pv), load: q(x.core.load), battery: q(x.core.battery), grid: q(x.core.grid), soc: q(x.core.soc, 0.1), outage: x.faults.gridOutage }), shallow)
  const value: Record<NodeId, string> = {
    solar: `${s.pv.toFixed(1)} kW`,
    grid: s.outage ? 'Offline' : `${Math.abs(s.grid).toFixed(1)} kW`,
    inverter: `${(s.pv - s.battery).toFixed(1)} kW AC`,
    battery: `${s.soc.toFixed(0)}%`,
    load: `${s.load.toFixed(1)} kW`,
    ai: 'Planning',
  }

  return (
    <section id='system' aria-labelledby='alive-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='The energy system'
          id='alive-title'
          title={<>The site is already talking. CARBONOZ listens to every part of it.</>}
          lede='Solar, inverter, battery, load and grid report continuously. CARBONOZ keeps them in one model — power flows on the solid lines, telemetry on the dashed ones. Select any part to inspect it.'
        />

        <Live className='homeos mt-16 grid gap-4 lg:grid-cols-12'>
          <div className='panel relative overflow-hidden lg:col-span-8'>
            <div className='flex items-center justify-between border-b border-line px-5 py-3'>
              <p className='label text-[10px] text-muted'>Site model · demo site</p>
              <SimTag />
            </div>
            <div className='relative mx-auto aspect-[800/540] w-full max-w-[860px]'>
              <svg viewBox={`0 0 ${W} ${H}`} className='absolute inset-0 h-full w-full text-fg' aria-hidden>
                {DATA.map((d, i) => (
                  <FlowPath key={i} d={d} power={0.6} color='var(--color-ai)' data dots={3} r={2.2} />
                ))}
                <FlowPath d={POWER.solar} power={s.pv} color='var(--color-solar)' width={1.8} r={2.8} />
                <FlowPath d={POWER.grid} power={s.outage ? 0 : s.grid} color='var(--color-grid)' width={1.8} r={2.8} />
                <FlowPath d={POWER.battery} power={s.battery} color='var(--color-batt)' width={1.8} r={2.8} />
                <FlowPath d={POWER.load} power={s.load} color='var(--color-load)' width={1.8} r={2.8} />
              </svg>
              {(Object.keys(NODES) as NodeId[]).map((id) => {
                const n = NODES[id]
                const Icon = n.icon
                const on = sel === id
                return (
                  <button
                    key={id}
                    type='button'
                    onClick={() => setSel(id)}
                    aria-pressed={on}
                    aria-label={`${n.label}: ${value[id]}`}
                    className={cx(
                      'group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-xl p-1 text-center outline-none',
                    )}
                    style={pos(n.x, n.y)}
                  >
                    <span
                      className={cx(
                        'relative flex h-[clamp(40px,7vw,64px)] w-[clamp(40px,7vw,64px)] items-center justify-center rounded-full border bg-ink-900 transition-[border-color,box-shadow,transform] duration-300 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-brand',
                        on ? 'border-transparent' : 'border-line-strong',
                        n.tone,
                      )}
                      style={on ? { boxShadow: `0 0 0 1.5px ${n.color}, 0 0 32px -4px ${n.color}` } : undefined}
                    >
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    <span className='hidden flex-col items-center leading-tight xs:flex'>
                      <span className='label text-[9.5px] text-muted'>{n.label}</span>
                      <span className='num text-[12px] text-fg sm:text-[13px]'>{value[id]}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='panel lg:col-span-4'>
            <AnimatePresence mode='wait'>
              <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className='p-5 sm:p-6'>
                <Inspector id={sel} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Live>
      </div>
    </section>
  )
}

function Row({ k, v, tone }: { k: string; v: React.ReactNode; tone?: string }) {
  return (
    <div className='flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[13.5px] last:border-0'>
      <dt className='text-muted'>{k}</dt>
      <dd className={cx('num text-right text-fg', tone)}>{v}</dd>
    </div>
  )
}

function Inspector({ id }: { id: NodeId }) {
  const n = NODES[id]
  const Icon = n.icon
  const s = useSim((x, d) => {
    const dv = d()
    const spread = Math.max(...dv.packs.map((p) => p.spreadMv))
    const packV = dv.packs.reduce((a, p) => a + p.voltage, 0) / dv.packs.length
    return {
      pv: q(x.core.pv),
      load: q(x.core.load),
      battery: q(x.core.battery),
      grid: q(x.core.grid),
      soc: q(x.core.soc, 0.1),
      temp: q(x.core.tempC, 0.1),
      spread: q(spread, 1),
      packV: q(packV, 0.01),
      band: tariffAt(x.core.t),
      outage: x.faults.gridOutage,
      inv: dv.inverters.map((i) => `${i.status}|${q(i.acPower)}|${q(i.frequency, 0.01)}|${q(i.acVoltage, 0.5)}|${q(i.temperature, 0.5)}`).join(';'),
      fromSolar: q(dv.flows.solarHome),
      fromBattery: q(dv.flows.batteryHome),
      fromGrid: q(dv.flows.gridHome),
      decision: decision(x.core, x.controls, x.faults),
      tomorrow: forecastPvKwh(dayOf(x.core.t) + 1),
    }
  }, (a, b) => shallow({ ...a, decision: a.decision.action }, { ...b, decision: b.decision.action }))
  const today = useToday()
  const hist = useHistory(6)
  const series: Record<NodeId, { v: number[]; c: string; l: string }> = {
    solar: { v: hist.map((h) => h.pv), c: 'var(--color-solar)', l: 'Solar power, last 6 hours' },
    grid: { v: hist.map((h) => h.grid), c: 'var(--color-grid)', l: 'Grid power, last 6 hours (positive = import)' },
    inverter: { v: hist.map((h) => h.pv - h.battery), c: 'var(--color-fg-2)', l: 'Inverter AC output, last 6 hours' },
    battery: { v: hist.map((h) => h.soc), c: 'var(--color-batt)', l: 'Battery state of charge, last 6 hours' },
    load: { v: hist.map((h) => h.load), c: 'var(--color-load)', l: 'Site load, last 6 hours' },
    ai: { v: hist.map((h) => h.pv - h.load), c: 'var(--color-ai)', l: 'Solar surplus or deficit, last 6 hours' },
  }
  const sum = Math.max(0.01, s.fromSolar + s.fromBattery + s.fromGrid)

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className={cx('flex items-center gap-2.5', n.tone)}>
          <Icon size={18} strokeWidth={1.6} />
          <h3 className='text-[17px] font-medium tracking-[-0.02em] text-fg'>{n.label}</h3>
        </div>
        {id === 'battery' && <Badge tone={s.battery > 0.05 ? 'ok' : s.battery < -0.05 ? 'warn' : 'idle'}>{batteryState(s.battery)}</Badge>}
        {id === 'grid' && <Badge tone={s.outage ? 'danger' : s.grid > 0.05 ? 'warn' : s.grid < -0.05 ? 'ok' : 'idle'}>{gridState(s.grid, s.outage)}</Badge>}
        {id === 'solar' && <Badge tone={s.pv > 0.05 ? 'ok' : 'idle'}>{s.pv > 0.05 ? 'Producing' : 'Idle'}</Badge>}
        {id === 'inverter' && <Badge tone={s.outage ? 'danger' : 'ok'}>{s.outage ? 'Island mode' : 'Normal'}</Badge>}
        {id === 'ai' && <Badge tone='info'>Concept</Badge>}
      </div>

      <div className='mt-6 flex items-baseline gap-1.5'>
        {id === 'battery' ? (
          <>
            <Num value={s.soc} digits={0} className='text-[44px] text-fg' />
            <span className='text-muted'>% SOC</span>
          </>
        ) : id === 'ai' ? (
          <p className='text-[19px] leading-snug tracking-[-0.02em] text-fg'>{s.decision.action}</p>
        ) : (
          <>
            <Num value={id === 'solar' ? s.pv : id === 'load' ? s.load : id === 'grid' ? (s.outage ? 0 : s.grid) : s.pv - s.battery} abs digits={2} className='text-[44px] text-fg' />
            <span className='text-muted'>kW</span>
          </>
        )}
      </div>

      <Sparkline values={series[id].v} color={series[id].c} height={56} className='mt-4 text-fg' label={series[id].l} />
      <p className='label mt-1 text-[9px] text-subtle'>Last 6 h</p>

      <dl className='mt-4'>
        {id === 'solar' && (
          <>
            <Row k='Share of current demand' v={`${Math.min(100, (s.pv / Math.max(0.01, s.load)) * 100).toFixed(0)}%`} tone='text-solar' />
            <Row k='Yield today' v={`${today.pv.toFixed(1)} kWh`} />
            <Row k='Array' v={`${SITE.pvKwp} kWp · 2 strings`} />
            <Row k='Forecast tomorrow' v={`${s.tomorrow.toFixed(0)} kWh`} />
          </>
        )}
        {id === 'battery' && (
          <>
            <Row k='Voltage' v={`${s.packV.toFixed(1)} V`} />
            <Row k='Power' v={`${s.battery > 0 ? '+' : ''}${s.battery.toFixed(1)} kW`} tone={s.battery > 0.05 ? 'text-batt' : undefined} />
            <Row k='Temperature' v={`${s.temp.toFixed(1)} °C`} />
            <Row k='Cell spread' v={`${s.spread.toFixed(0)} mV`} tone={s.spread > 30 ? 'text-warn' : undefined} />
            <Row k='Capacity' v={`${CAPACITY_KWH.toFixed(2)} kWh · ${SITE.packs} packs`} />
          </>
        )}
        {id === 'grid' && (
          <>
            <Row k='Imported today' v={`${today.imported.toFixed(1)} kWh`} />
            <Row k='Exported today' v={`${today.exported.toFixed(1)} kWh`} />
            <Row k='Tariff window' v={s.band} />
          </>
        )}
        {id === 'load' && (
          <>
            <Row k='From solar' v={`${((s.fromSolar / sum) * 100).toFixed(0)}%`} tone='text-solar' />
            <Row k='From battery' v={`${((s.fromBattery / sum) * 100).toFixed(0)}%`} tone='text-batt' />
            <Row k='From grid' v={`${((s.fromGrid / sum) * 100).toFixed(0)}%`} tone='text-grid' />
            <Row k='Consumed today' v={`${today.load.toFixed(1)} kWh`} />
          </>
        )}
        {id === 'inverter' &&
          s.inv.split(';').map((r, i) => {
            const [status, ac, f, v, t] = r.split('|')
            return <Row key={i} k={`Inverter ${i + 1} · ${status}`} v={`${Number(ac).toFixed(1)} kW · ${Number(f).toFixed(2)} Hz · ${Number(v).toFixed(0)} V · ${Number(t).toFixed(0)} °C`} />
          })}
        {id === 'ai' && (
          <>
            <p className='pb-3 text-[13.5px] leading-relaxed text-fg-2'>{s.decision.reason}</p>
            <Row k='Next' v={<span className='font-sans text-[13px]'>{s.decision.next}</span>} />
            <Row k='Forecast tomorrow' v={`${s.tomorrow.toFixed(0)} kWh solar`} />
          </>
        )}
      </dl>
    </div>
  )
}
