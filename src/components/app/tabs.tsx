'use client'

import { Activity, CloudSun, Cpu, Gauge, ListTree, Percent, Server } from 'lucide-react'
import { useMemo, useState } from 'react'
import { q, samplesOfDay, shallow, useSim, useToday, totals } from '@/sim/hooks'
import { CAPACITY_KWH, dayOf, SITE } from '@/sim/model'
import { daySummary, horizon, WEATHER_LABEL } from '@/sim/forecast'
import { batteryState, dayName, gridState } from '@/sim/format'
import { clock } from '@/sim/telemetry'
import { EnergyFlowCard, FlowView } from '@/components/homeos/EnergyFlow'
import { BatteryCard, CellTiles, ICONS, InverterCard, MetricCard, powerParts } from '@/components/homeos/cards'
import { ChartPanel, SERIES } from '@/components/homeos/ChartPanel'
import { Card, CardHeader, StatusBadge, Tabs } from '@/components/homeos/ui'
import { ChartsDashboard } from './ChartsDashboard'
import { ControlPanel } from './ControlPanel'
import { EventList } from './EventList'
import { AlertsCard, AssistantCard, DevicesStatus, WeatherCard } from './widgets'

export function useFlowView(): FlowView {
  return useSim((x) => ({ pv: q(x.core.pv), load: q(x.core.load), battery: q(x.core.battery), grid: q(x.core.grid), soc: q(x.core.soc, 0.5), outage: x.faults.gridOutage }), shallow)
}

/** The five headline cards (HomeOS dashboard top row). */
export function HeadlineCards({ className = 'grid grid-cols-2 gap-3 @3xl:grid-cols-3 @6xl:grid-cols-5' }: { className?: string }) {
  const s = useFlowView()
  const today = useToday()
  const pv = powerParts(s.pv)
  const load = powerParts(s.load)
  const bat = powerParts(s.battery)
  const grid = powerParts(s.outage ? 0 : s.grid)
  const bState = batteryState(s.battery)
  const g = gridState(s.grid, s.outage)
  return (
    <section aria-label='Live values' className={className}>
      <MetricCard icon={ICONS.pv} label='Solar' value={pv.value} decimals={pv.decimals} unit={pv.unit} hint={s.pv > 0.02 ? 'Producing' : 'Idle'} tone={s.pv > 0.02 ? 'text-batt' : undefined} />
      <MetricCard icon={ICONS.load} label='Home usage' value={load.value} decimals={load.decimals} unit={load.unit} hint='Consuming' tone='text-home' />
      <MetricCard icon={ICONS.battery(s.soc)} label='Battery' value={Math.round(s.soc)} decimals={0} unit='%' extra={`${((s.soc / 100) * CAPACITY_KWH).toFixed(1)} kWh`} bar={s.soc} hint={bState} tone={bState === 'Charging' ? 'text-batt' : bState === 'Discharging' ? 'text-solar' : undefined} />
      <MetricCard icon={ICONS.grid} label='Grid' value={grid.value} decimals={grid.decimals} unit={grid.unit} hint={g} tone={s.outage ? 'text-danger' : g === 'Importing' ? 'text-gridp' : g === 'Exporting' ? 'text-batt' : undefined} />
      <MetricCard icon={<Percent size={30} strokeWidth={1.6} className='text-batt' />} label='Today' value={Math.round(today.selfSufficiency)} decimals={0} unit='%' hint='Self-sufficient' tone='text-batt' className='col-span-2 @3xl:col-span-1' />
    </section>
  )
}

// ------------------------------------------------------------------ overview

export function OverviewTab({ go }: { go: (t: string) => void }) {
  const s = useFlowView()
  return (
    <div className='grid gap-3 @5xl:grid-cols-[minmax(0,1fr)_minmax(250px,276px)]'>
      <div className='grid min-w-0 content-start gap-3'>
        <HeadlineCards />
        <div className='grid gap-3 @6xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]'>
          <EnergyFlowCard s={s} detail='Updated just now' showBreakdown={false} />
          <AssistantCard />
        </div>
        <ChartsDashboard />
      </div>
      <div className='grid content-start gap-3 @2xl:grid-cols-2 @5xl:grid-cols-1'>
        <DevicesStatus onViewAll={() => go('battery')} />
        <AlertsCard onViewAll={() => go('events')} />
        <WeatherCard className='@2xl:col-span-2 @5xl:col-span-1' />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ energy

export function EnergyTab() {
  const s = useFlowView()
  const today = useToday()
  const imp = powerParts(Math.max(0, s.grid))
  const chg = powerParts(Math.max(0, s.battery))
  const dis = powerParts(Math.max(0, -s.battery))
  return (
    <div className='grid gap-3'>
      <EnergyFlowCard s={s} className='min-h-[320px]' />
      <section aria-label='Live energy' className='grid grid-cols-2 gap-3 @3xl:grid-cols-3 @7xl:grid-cols-6'>
        <MetricCard icon={ICONS.pv} label='Solar' {...powerParts(s.pv)} hint={`${today.pv.toFixed(1)} kWh today`} tone='text-batt' />
        <MetricCard icon={ICONS.load} label='Consumption' {...powerParts(s.load)} hint={`${today.load.toFixed(1)} kWh today`} />
        <MetricCard icon={ICONS.grid} label='Grid import' {...imp} hint={s.grid < -0.02 ? `Exporting ${Math.abs(s.grid).toFixed(2)} kW` : `${today.imported.toFixed(1)} kWh today`} />
        <MetricCard icon={ICONS.battery(s.soc)} label='Battery charged' {...chg} hint={`${today.charged.toFixed(1)} kWh today`} tone={s.battery > 0.02 ? 'text-batt' : undefined} />
        <MetricCard icon={ICONS.battery(s.soc)} label='Battery discharged' {...dis} hint={`${today.discharged.toFixed(1)} kWh today`} />
        <MetricCard icon={<Percent size={30} strokeWidth={1.6} className='text-batt' />} label='Solar coverage' value={Math.round(today.selfSufficiency)} decimals={0} unit='%' hint='Today' />
      </section>
    </div>
  )
}

export function ChartsTab() {
  return <ChartsDashboard height={170} />
}

// ------------------------------------------------------------------ battery & BMS

export function BatteryTab() {
  const [pack, setPack] = useState('A')
  const [cell, setCell] = useState<number | null>(null)
  const packs = useSim((_, d) => d().packs, (a, b) => a.every((p, i) => Math.abs(p.voltage - b[i].voltage) < 0.003 && p.state === b[i].state && p.alarms.length === b[i].alarms.length && Math.abs(p.current - b[i].current) < 0.2))
  const p = packs.find((x) => x.id === pack) ?? packs[0]
  return (
    <div className='grid gap-3'>
      <Tabs items={packs.map((x) => ({ id: x.id, label: x.name }))} value={pack} onChange={(v) => (setPack(v), setCell(null))} label='Battery' />
      <div className='grid gap-3 @6xl:grid-cols-2'>
        <BatteryCard p={p} />
        <Card className='p-4'>
          <CardHeader title={`BMS ${p.id}`} subtitle={`${p.bmsId} · pack ${p.name}`} icon={<Activity size={16} />} action={<StatusBadge tone={p.alarms.length ? 'warning' : 'good'} dot>{p.state}</StatusBadge>} />
          <div className='mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
            {[
              ['Min cell', `${p.minCell.voltage.toFixed(3)}`, 'V'],
              ['Max cell', `${p.maxCell.voltage.toFixed(3)}`, 'V'],
              ['Average', `${p.avgCell.toFixed(3)}`, 'V'],
              ['Spread', `${p.spreadMv.toFixed(0)}`, 'mV'],
            ].map(([k, v, u]) => (
              <div key={k} className='rounded-lg border border-line bg-panel-2 px-3 py-2'>
                <p className='truncate text-[11px] text-muted'>{k}</p>
                <p className='tabular mt-0.5 text-[15px] font-semibold text-fg'>
                  {v}
                  <span className='ml-1 text-[11.5px] font-normal text-fg-2'>{u}</span>
                </p>
              </div>
            ))}
          </div>
          <div className='mt-4'>
            <CellTiles p={p} selected={cell} onSelect={setCell} cols='grid-cols-2 @md:grid-cols-4' />
          </div>
          {p.alarms.length > 0 && (
            <div className='mt-3 space-y-1.5'>
              {p.alarms.map((a) => (
                <p key={a.code} className='rounded-lg border border-gridp/25 bg-gridp/5 px-3 py-2 text-[12px] text-fg-2'>
                  <span className='font-medium text-gridp'>{a.code}</span> · {a.message}
                </p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ inverters

export function InvertersTab() {
  const inv = useSim((_, d) => d().inverters, (a, b) => a.every((x, i) => Math.abs(x.acPower - b[i].acPower) < 0.01 && x.status === b[i].status))
  const today = useToday()
  return (
    <div className='grid gap-3 @5xl:grid-cols-2'>
      {inv.map((i, k) => (
        <InverterCard key={i.id} inv={i} yieldToday={today.pv * (k === 0 ? 0.54 : 0.46)} />
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ forecast

export function ForecastTab() {
  const core = useSim((x) => x.core, (a, b) => Math.floor(a.t / 60) === Math.floor(b.t / 60))
  const controls = useSim((x) => x.controls)
  const f = useMemo(() => horizon(core, controls, 48, 30), [core, controls])
  const labels = f.map((p) => `${dayName(dayOf(p.t))} ${clock(p.t)}`)
  const ticks: [number, string][] = f.flatMap((p, i) => (Math.round(p.t) % 360 < 30 ? [[i, clock(p.t)] as [number, string]] : []))
  const days = [0, 1, 2].map((k) => daySummary(dayOf(core.t) + k))
  return (
    <div className='grid gap-3'>
      <div className='grid grid-cols-3 gap-3'>
        {days.map((d, i) => (
          <Card key={d.day} className='p-4'>
            <div className='flex items-center justify-between text-[12px] text-muted'>
              <span>{i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName(d.day)}</span>
              <CloudSun size={18} className='text-solar' />
            </div>
            <p className='tabular mt-1.5 text-[22px] font-semibold text-fg'>
              {d.pvKwh.toFixed(0)} <span className='text-[13px] font-medium text-fg-2'>kWh</span>
            </p>
            <p className='truncate text-[12px] text-muted'>
              {WEATHER_LABEL[d.weather]} · {d.tempHi.toFixed(0)}°
            </p>
          </Card>
        ))}
      </div>
      <div className='grid gap-3 @5xl:grid-cols-2'>
        <ChartPanel title='Solar forecast · next 48 h' unit='kW' labels={labels} ticks={ticks} height={190} series={[{ key: 'pv', name: 'Solar forecast', color: SERIES.pv, values: f.map((p) => p.pv) }, { key: 'l', name: 'Expected load', color: SERIES.load, values: f.map((p) => p.load) }]} />
        <ChartPanel title='Planned battery state of charge' unit='%' decimals={0} domain={[0, 100]} kind='line' labels={labels} ticks={ticks} height={190} series={[{ key: 's', name: 'Planned SOC', color: SERIES.soc, values: f.map((p) => p.soc) }]} />
      </div>
      <p className='text-[11.5px] text-muted'>Forecast source: demo model (simulated). Real installations can send forecast points with their readings.</p>
    </div>
  )
}

// ------------------------------------------------------------------ events / autopilot / system

export function EventsTab() {
  return (
    <Card className='overflow-hidden p-0'>
      <div className='px-4 pt-4'>
        <CardHeader title='Events' subtitle='Alarms, state changes and SolarAutopilot decisions' icon={<ListTree size={16} />} />
      </div>
      <EventList limit={40} className='mt-3' />
    </Card>
  )
}

export function AutopilotTab() {
  return <ControlPanel />
}

export function SystemTab() {
  const s = useSim((x, d) => ({ temp: q(x.core.tempC, 0.1), alarms: d().alarms.length, day: dayOf(x.core.t) }), shallow)
  const week = useMemo(() => totals(Array.from({ length: 7 }, (_, k) => samplesOfDay(s.day - k)).flat()), [s.day])
  const block = (title: string, icon: React.ReactNode, items: [string, React.ReactNode][]) => (
    <Card className='p-4'>
      <CardHeader title={title} icon={icon} />
      <dl className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]'>
        {items.map(([k, v]) => (
          <div key={k} className='min-w-0'>
            <dt className='truncate text-[11.5px] text-muted'>{k}</dt>
            <dd className='mt-0.5 truncate font-medium text-fg'>{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
  return (
    <div className='grid gap-3 @2xl:grid-cols-2 @6xl:grid-cols-3'>
      {block('System status', <Server size={16} />, [
        ['Inverters', SITE.inverters],
        ['Batteries', SITE.packs],
        ['BMS', SITE.packs],
        ['Cells', SITE.packs * SITE.cellsPerPack],
        ['Data', <StatusBadge key='d' tone='good' dot pulse>Live</StatusBadge>],
        ['Forecast', 'Available'],
      ])}
      {block('Installation', <Cpu size={16} />, [
        ['Kind', 'SolarBMS'],
        ['System id', 'sbms-demo-01'],
        ['Gateway', 'Raspberry Pi'],
        ['Reporting', 'Every 15 s'],
        ['Active alarms', s.alarms],
        ['Status', 'Online'],
      ])}
      {block('Site', <Gauge size={16} />, [
        ['Array', `${SITE.pvKwp} kWp`],
        ['Storage', `${CAPACITY_KWH.toFixed(2)} kWh`],
        ['Inverters', `${SITE.inverters} × ${SITE.inverterKw} kW`],
        ['Battery temp', `${s.temp.toFixed(1)} °C`],
        ['Solar, 7 days', `${week.pv.toFixed(0)} kWh`],
        ['Self-sufficiency', `${week.selfSufficiency.toFixed(0)}%`],
      ])}
    </div>
  )
}

