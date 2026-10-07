'use client'

import { AnimatePresence, motion } from 'motion/react'
import { BatteryCharging, BrainCircuit, ChevronRight, CloudSun, Cpu, Gauge, LayoutDashboard, MapPin, Radio, Server, Sun, Thermometer, Zap, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Live } from '@/components/ui/Live'
import { Badge, cx, SectionHeader, SimTag } from '@/components/ui/primitives'
import { FlowPath } from '@/components/viz/FlowPath'
import { q, useSim } from '@/sim/hooks'
import { CAPACITY_KWH, dayOf, forecastPvKwh, SITE } from '@/sim/model'
import { pad } from '@/sim/telemetry'

// ------------------------------------------------------------------ ecosystem

interface Device {
  id: string
  label: string
  icon: LucideIcon
  tone: string
  read: string
}

function useDevices(): Device[] {
  return useSim(
    (x, d) => {
      const dv = d()
      return [
        { id: 'inv', label: `Inverters × ${SITE.inverters}`, icon: Cpu, tone: 'text-fg', read: `${dv.inverters.map((i) => q(i.acPower).toFixed(1)).join(' / ')} kW` },
        { id: 'bat', label: `Batteries × ${SITE.packs}`, icon: BatteryCharging, tone: 'text-batt', read: `${dv.packs.map((p) => p.soc.toFixed(0)).join(' / ')} %` },
        { id: 'bms', label: `BMS × ${SITE.packs}`, icon: Gauge, tone: 'text-batt', read: `${SITE.packs * SITE.cellsPerPack} cells · Δ ${Math.max(...dv.packs.map((p) => p.spreadMv)).toFixed(0)} mV` },
        { id: 'meter', label: 'Grid measurement', icon: Zap, tone: 'text-grid', read: `${x.faults.gridOutage ? 'offline' : `${q(x.core.grid) > 0 ? '+' : ''}${q(x.core.grid).toFixed(2)} kW`}` },
        { id: 'pv', label: 'Solar array', icon: Sun, tone: 'text-solar', read: `${q(x.core.pv).toFixed(2)} kW` },
        { id: 'temp', label: 'Temperature sensors', icon: Thermometer, tone: 'text-fg-2', read: `${x.core.tempC.toFixed(1)} °C · 12 sensors` },
        { id: 'fc', label: 'Forecast source', icon: CloudSun, tone: 'text-ai', read: `${forecastPvKwh(dayOf(x.core.t) + 1).toFixed(0)} kWh tomorrow` },
      ]
    },
    (a, b) => a.every((v, i) => v.read === b[i].read),
  )
}

const CHAIN = [
  { id: 'ingest', label: 'CARBONOZ ingestion', sub: 'HTTPS · machine credential', icon: Server },
  { id: 'live', label: 'Realtime', sub: 'Live snapshot · history', icon: Radio },
  { id: 'ai', label: 'Intelligence', sub: 'Forecast · plan · alarms', icon: BrainCircuit },
  { id: 'app', label: 'Dashboard', sub: 'Customers · operators', icon: LayoutDashboard },
]

export function Ecosystem({ index = '08' }: { index?: string }) {
  const devices = useDevices()
  const W = 1200
  const H = 560
  const dy = (i: number) => 70 + i * 70
  const GX = 560
  const GY = 280
  const cx_ = (i: number) => 700 + i * 140

  return (
    <section id='hardware' aria-labelledby='hw-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Energy hardware'
          id='hw-title'
          title={<>Physical systems in. Decisions out.</>}
          lede='CARBONOZ is not only a dashboard. A SolarBMS gateway — a Raspberry Pi at the site — reads inverters, batteries and BMS units and sends everything they report to CARBONOZ, where it becomes live data, history and intelligence.'
        />

        <Live className='homeos mt-14'>
          <div className='panel overflow-hidden'>
            <div className='flex items-center justify-between border-b border-line px-5 py-3'>
              <p className='label text-[10px] text-muted'>Device → gateway → CARBONOZ</p>
              <SimTag>Live readings · simulation</SimTag>
            </div>

            {/* Desktop: one connected diagram */}
            <div className='relative hidden aspect-[1200/560] w-full md:block'>
              <svg viewBox={`0 0 ${W} ${H}`} className='absolute inset-0 h-full w-full text-fg' aria-hidden>
                {devices.map((d, i) => (
                  <FlowPath key={d.id} d={`M300,${dy(i)} C420,${dy(i)} 440,${GY} ${GX - 52},${GY}`} power={0.9} color='var(--color-ai)' data dots={2} />
                ))}
                {CHAIN.map((c, i) => (
                  <FlowPath key={c.id} d={`M${i === 0 ? GX + 52 : cx_(i - 1) + 40},${GY} L${cx_(i) - 40},${GY}`} power={1.4} color='var(--color-brand)' data dots={2} />
                ))}
                <circle cx={GX} cy={GY} r='52' fill='var(--color-ink-950)' stroke='var(--color-brand)' strokeOpacity='0.5' />
                <circle cx={GX} cy={GY} r='66' fill='none' stroke='var(--color-brand)' strokeOpacity='0.12' strokeDasharray='2 5' />
              </svg>
              {devices.map((d, i) => {
                const Icon = d.icon
                return (
                  <div key={d.id} className='absolute flex -translate-y-1/2 items-center gap-3 rounded-[8px] border border-line bg-ink-900 px-3 py-2' style={{ left: '2%', width: '23%', top: `${(dy(i) / H) * 100}%` }}>
                    <Icon size={16} className={cx('shrink-0', d.tone)} />
                    <div className='min-w-0'>
                      <div className='truncate text-[12.5px] text-fg'>{d.label}</div>
                      <div className='num truncate text-[11px] text-muted'>{d.read}</div>
                    </div>
                  </div>
                )
              })}
              <div className='absolute -translate-x-1/2 -translate-y-1/2 text-center' style={{ left: `${(GX / W) * 100}%`, top: `${(GY / H) * 100}%` }}>
                <Cpu size={20} className='mx-auto text-brand' />
                <div className='mt-1 text-[11.5px] font-medium text-fg'>SolarBMS</div>
                <div className='label text-[8.5px] text-muted'>Gateway · Pi</div>
              </div>
              {CHAIN.map((c, i) => {
                const Icon = c.icon
                return (
                  <div key={c.id} className='absolute w-[11.5%] -translate-x-1/2 -translate-y-1/2 text-center' style={{ left: `${(cx_(i) / W) * 100}%`, top: `${(GY / H) * 100}%` }}>
                    <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-ink-900'>
                      <Icon size={18} className={i === 2 ? 'text-ai' : 'text-fg'} />
                    </div>
                    <div className='mt-2 text-[12px] text-fg'>{c.label}</div>
                    <div className='text-[10.5px] leading-tight text-muted'>{c.sub}</div>
                  </div>
                )
              })}
            </div>

            {/* Phone: devices, then a vertical pipeline */}
            <div className='grid gap-5 p-4 md:hidden'>
              <ul className='grid grid-cols-2 gap-2'>
                {devices.map((d) => {
                  const Icon = d.icon
                  return (
                    <li key={d.id} className='rounded-[8px] border border-line bg-ink-900 p-2.5'>
                      <Icon size={14} className={d.tone} />
                      <div className='mt-1 text-[12px] text-fg'>{d.label}</div>
                      <div className='num text-[10.5px] text-muted'>{d.read}</div>
                    </li>
                  )
                })}
              </ul>
              <ol className='relative ml-5 border-l border-dashed border-line-strong'>
                {[{ id: 'gw', label: 'SolarBMS gateway', sub: 'Raspberry Pi at the site', icon: Cpu }, ...CHAIN].map((c, i) => {
                  const Icon = c.icon
                  return (
                    <li key={c.id} className='relative py-3 pl-8'>
                      <span className='absolute -left-[17px] top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-ink-950'>
                        <Icon size={14} className={i === 0 ? 'text-brand' : 'text-fg'} />
                      </span>
                      <div className='text-[13.5px] text-fg'>{c.label}</div>
                      <div className='text-[12px] text-muted'>{c.sub}</div>
                    </li>
                  )
                })}
                <motion.span aria-hidden className='absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-brand' animate={{ top: ['2%', '96%'] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }} />
              </ol>
            </div>
          </div>
        </Live>

        <div className='mt-6 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3'>
          {[
            ['Gateway', 'A Raspberry Pi running SolarBMS at the site. It buffers readings during outages and sends them when the connection returns.'],
            ['Identity', 'Every installation has its own machine credential, never a person’s. It can write data for that one installation only; revocation takes effect within 60 seconds.'],
            ['Open data', 'Whatever the devices report is accepted and kept — new metrics need no CARBONOZ change. Each BMS may report its own number of cells.'],
          ].map(([k, v]) => (
            <div key={k} className='bg-ink-950 p-6'>
              <p className='label text-[10px] text-brand'>{k}</p>
              <p className='mt-3 text-[14px] leading-relaxed text-fg-2'>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ topology

type NodeKind = 'site' | 'installation' | 'gateway' | 'system' | 'array' | 'inverter' | 'battery' | 'bms' | 'cells' | 'meter'

interface TNode {
  id: string
  kind: NodeKind
  label: string
  meta?: string
  children?: TNode[]
}

const TREE: TNode = {
  id: 'site',
  kind: 'site',
  label: 'Demo site',
  meta: 'Site · time zone Africa/Kigali',
  children: [
    {
      id: 'inst',
      kind: 'installation',
      label: 'SolarBMS installation',
      meta: 'sbms-demo-01',
      children: [
        { id: 'gw', kind: 'gateway', label: 'CARBONOZ gateway', meta: 'Raspberry Pi · SolarBMS' },
        { id: 'sys', kind: 'system', label: 'System', meta: 'Site totals' },
        { id: 'array', kind: 'array', label: 'Solar array', meta: `${SITE.pvKwp} kWp · 2 strings` },
        { id: 'inv-1', kind: 'inverter', label: 'Inverter 1', meta: 'Hybrid · 5 kW' },
        { id: 'inv-2', kind: 'inverter', label: 'Inverter 2', meta: 'Hybrid · 5 kW' },
        ...['A', 'B', 'C'].map((p, i) => ({
          id: `bat-${p}`,
          kind: 'battery' as const,
          label: `Battery ${p}`,
          meta: `${SITE.packKwh} kWh · 16S LFP`,
          children: [{ id: `bms-${p}`, kind: 'bms' as const, label: `BMS ${p}`, meta: `bms-${p.toLowerCase()}`, children: [{ id: `cells-${i}`, kind: 'cells' as const, label: 'Cells 01–16', meta: '16 in series' }] }],
        })),
        { id: 'meter', kind: 'meter', label: 'Grid measurement', meta: 'Import / export' },
      ],
    },
  ],
}

const KIND_ICON: Record<NodeKind, LucideIcon> = { site: MapPin, installation: Server, gateway: Cpu, system: Gauge, array: Sun, inverter: Cpu, battery: BatteryCharging, bms: Gauge, cells: BatteryCharging, meter: Zap }

export function Topology({ index = '13' }: { index?: string }) {
  const [sel, setSel] = useState('bms-B')
  const [open, setOpen] = useState<Record<string, boolean>>({ site: true, inst: true, 'bat-B': true, 'bms-B': true })
  const find = (n: TNode): TNode | null => (n.id === sel ? n : (n.children ?? []).map(find).find(Boolean) ?? null)
  const node = find(TREE) ?? TREE

  const row = (n: TNode, depth: number, last: boolean): React.ReactNode => {
    const Icon = KIND_ICON[n.kind]
    const has = !!n.children?.length
    const isOpen = open[n.id]
    return (
      <li key={n.id} role='treeitem' aria-expanded={has ? !!isOpen : undefined} aria-selected={sel === n.id}>
        <div className='relative flex items-center' style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && <span aria-hidden className={cx('absolute top-0 w-px bg-line-strong', last ? 'h-1/2' : 'h-full')} style={{ left: depth * 20 - 11 }} />}
          {depth > 0 && <span aria-hidden className='absolute h-px w-2.5 bg-line-strong' style={{ left: depth * 20 - 11 }} />}
          <button type='button' onClick={() => has && setOpen({ ...open, [n.id]: !isOpen })} className={cx('flex h-6 w-5 items-center justify-center text-subtle', !has && 'invisible')} aria-label={isOpen ? `Collapse ${n.label}` : `Expand ${n.label}`} tabIndex={has ? 0 : -1}>
            <ChevronRight size={13} className={cx('transition-transform', isOpen && 'rotate-90')} />
          </button>
          <button type='button' onClick={() => setSel(n.id)} className={cx('flex min-w-0 flex-1 items-center gap-2 rounded-[5px] px-2 py-1.5 text-left text-[13px] transition-colors', sel === n.id ? 'bg-fg/[0.07] text-fg' : 'text-fg-2 hover:bg-fg/[0.03]')}>
            <Icon size={14} className='shrink-0 text-muted' />
            <span className='truncate'>{n.label}</span>
            <span className='num ml-auto hidden truncate pl-2 text-[11px] text-subtle sm:inline'>{n.meta}</span>
          </button>
        </div>
        {has && isOpen && (
          <ul role='group' className='relative'>
            {n.children!.map((c, i) => row(c, depth + 1, i === n.children!.length - 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <section id='topology' aria-labelledby='topo-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Site topology'
          id='topo-title'
          title={<>Every device in its place.</>}
          lede='CARBONOZ organises data the way the system is built: a customer owns sites, a site holds installations, an installation reports its system, inverters, batteries and BMS units — and every BMS its cells.'
        />
        <Live className='homeos mt-14 grid gap-4 lg:grid-cols-12'>
          <div className='panel p-3 sm:p-4 lg:col-span-6'>
            <ul role='tree' aria-label='Site topology' className='text-[13px]'>
              {row(TREE, 0, true)}
            </ul>
          </div>
          <div className='panel p-5 lg:col-span-6'>
            <AnimatePresence mode='wait'>
              <motion.div key={node.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <DeviceDetail n={node} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Live>
      </div>
    </section>
  )
}

function Line({ k, v, tone }: { k: string; v: React.ReactNode; tone?: string }) {
  return (
    <div className='flex justify-between gap-4 border-b border-line py-2 text-[13px] last:border-0'>
      <dt className='text-muted'>{k}</dt>
      <dd className={cx('num text-right text-fg', tone)}>{v}</dd>
    </div>
  )
}

function DeviceDetail({ n }: { n: TNode }) {
  const v = useSim(
    (x, d) => {
      const dv = d()
      const packIdx = n.id.endsWith('A') || n.id === 'cells-0' ? 0 : n.id.endsWith('B') || n.id === 'cells-1' ? 1 : 2
      const p = dv.packs[packIdx]
      const inv = dv.inverters[n.id === 'inv-2' ? 1 : 0]
      return JSON.stringify({
        pv: x.core.pv.toFixed(2), load: x.core.load.toFixed(2), battery: x.core.battery.toFixed(2), grid: x.core.grid.toFixed(2), soc: x.core.soc.toFixed(1),
        p: { soc: p.soc.toFixed(1), v: p.voltage.toFixed(2), a: p.current.toFixed(1), t: Math.max(...p.temperatures).toFixed(1), spread: p.spreadMv.toFixed(1), state: p.state, alarms: p.alarms.length, min: `${pad(p.minCell.id)} · ${p.minCell.voltage.toFixed(3)}`, max: `${pad(p.maxCell.id)} · ${p.maxCell.voltage.toFixed(3)}`, cells: p.cells.map((c) => c.voltage.toFixed(3)), soh: p.soh },
        inv: { status: inv.status, ac: inv.acPower.toFixed(2), pv: inv.pvPower.toFixed(2), f: inv.frequency.toFixed(2), v: inv.acVoltage.toFixed(0), t: inv.temperature.toFixed(0) },
        outage: x.faults.gridOutage,
      })
    },
  )
  const d = JSON.parse(v)
  const Icon = KIND_ICON[n.kind]
  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <span className='flex h-9 w-9 items-center justify-center rounded-full border border-line-strong'>
            <Icon size={16} className='text-fg' />
          </span>
          <div>
            <h3 className='text-[16px] font-medium text-fg'>{n.label}</h3>
            <p className='num text-[11.5px] text-muted'>{n.meta}</p>
          </div>
        </div>
        <Badge tone={n.kind === 'battery' || n.kind === 'bms' ? (d.p.alarms ? 'warn' : 'ok') : n.kind === 'meter' && d.outage ? 'danger' : 'ok'}>
          {n.kind === 'battery' || n.kind === 'bms' ? (d.p.alarms ? `${d.p.alarms} alarm` : d.p.state) : n.kind === 'inverter' ? d.inv.status : n.kind === 'meter' && d.outage ? 'Offline' : 'Online'}
        </Badge>
      </div>
      <dl className='mt-5'>
        {n.kind === 'site' && (<><Line k='Installations' v='1' /><Line k='Devices' v='9' /><Line k='Time zone' v='Africa/Kigali' /><Line k='Status' v='Online' tone='text-ok' /></>)}
        {n.kind === 'installation' && (<><Line k='Kind' v='SOLARBMS' /><Line k='System id' v='sbms-demo-01' /><Line k='Credential' v='Machine API key · per installation' /><Line k='Online rule' v='Reported within 5 min' /></>)}
        {n.kind === 'gateway' && (<><Line k='Hardware' v='Raspberry Pi' /><Line k='Transport' v='HTTPS POST · JSON' /><Line k='Interval' v='10–60 s (demo: 15 s)' /><Line k='Buffering' v='Batches up to 100 messages' /></>)}
        {n.kind === 'system' && (<><Line k='Solar' v={`${d.pv} kW`} tone='text-solar' /><Line k='Load' v={`${d.load} kW`} tone='text-load' /><Line k='Battery' v={`${d.battery} kW`} tone='text-batt' /><Line k='Grid' v={`${d.grid} kW`} tone='text-grid' /><Line k='SOC' v={`${d.soc}%`} /></>)}
        {n.kind === 'array' && (<><Line k='Power' v={`${d.pv} kW`} tone='text-solar' /><Line k='Peak capacity' v={`${SITE.pvKwp} kWp`} /><Line k='Strings' v='2 (one per inverter)' /></>)}
        {n.kind === 'inverter' && (<><Line k='AC power' v={`${d.inv.ac} kW`} /><Line k='PV input' v={`${d.inv.pv} kW`} tone='text-solar' /><Line k='Frequency' v={`${d.inv.f} Hz`} /><Line k='AC voltage' v={`${d.inv.v} V`} /><Line k='Temperature' v={`${d.inv.t} °C`} /></>)}
        {n.kind === 'battery' && (<><Line k='SOC' v={`${d.p.soc}%`} tone='text-batt' /><Line k='Voltage' v={`${d.p.v} V`} /><Line k='Current' v={`${d.p.a} A`} /><Line k='Max temperature' v={`${d.p.t} °C`} /><Line k='State of health' v={`${d.p.soh}%`} /><Line k='Capacity' v={`${SITE.packKwh} kWh of ${CAPACITY_KWH.toFixed(2)} kWh bank`} /></>)}
        {n.kind === 'bms' && (<><Line k='Min cell' v={`${d.p.min} V`} tone='text-grid' /><Line k='Max cell' v={`${d.p.max} V`} tone='text-ai' /><Line k='Spread' v={`${d.p.spread} mV`} tone={Number(d.p.spread) > 30 ? 'text-warn' : undefined} /><Line k='Active alarms' v={d.p.alarms} /></>)}
        {n.kind === 'meter' && (<><Line k='Grid power' v={d.outage ? 'Offline' : `${d.grid} kW`} tone='text-grid' /><Line k='Direction' v={d.outage ? '—' : Number(d.grid) > 0.05 ? 'Import' : Number(d.grid) < -0.05 ? 'Export' : 'Balanced'} /></>)}
      </dl>
      {(n.kind === 'cells' || n.kind === 'bms') && (
        <div className='mt-4 grid grid-cols-8 gap-1'>
          {(d.p.cells as string[]).map((c, i) => (
            <div key={i} className='rounded-[4px] border border-line bg-ink-950 px-1 py-1.5 text-center'>
              <div className='num text-[8.5px] text-subtle'>{pad(i + 1)}</div>
              <div className='num text-[10.5px] text-fg'>{c}</div>
            </div>
          ))}
        </div>
      )}
      <p className='mt-5 text-[11.5px] text-subtle'>Device kinds and hierarchy follow the CARBONOZ platform model. Values: demo simulation.</p>
    </div>
  )
}
