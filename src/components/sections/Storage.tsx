'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { Live } from '@/components/ui/Live'
import { Num } from '@/components/ui/Num'
import { Button, SectionHeader, Segmented, SimTag, StatusTag } from '@/components/ui/primitives'
import { FlowPath } from '@/components/viz/FlowPath'
import { q, shallow, useSim } from '@/sim/hooks'
import { CAPACITY_KWH, SITE } from '@/sim/model'
import { batteryState } from '@/sim/format'

type Mode = 'live' | 'solar' | 'grid' | 'load' | 'export'

const MODES: { id: Mode; label: string; line: string }[] = [
  { id: 'live', label: 'Live', line: 'What the demo site is doing right now.' },
  { id: 'solar', label: 'Solar → Battery', line: 'Midday surplus is stored instead of exported.' },
  { id: 'grid', label: 'Grid → Battery', line: 'Off-peak energy charged ahead of a low-solar day.' },
  { id: 'load', label: 'Battery → Load', line: 'Stored energy carries the evening peak and the night.' },
  { id: 'export', label: 'Battery → Grid', line: 'Stored energy fed back to the grid — illustration of a grid-service scenario.' },
]

// Cabinet-centred diagram coordinates (viewBox 900 × 520)
const PATH = {
  solar: 'M150,120 C260,120 300,220 372,236',
  grid: 'M750,120 C640,120 600,220 528,236',
  load: 'M528,300 C600,320 640,410 750,410',
}

export function Storage({ index = '06' }: { index?: string }) {
  const [mode, setMode] = useState<Mode>('live')
  const s = useSim(
    (x, d) => {
      const f = d().flows
      return { battery: q(x.core.battery), soc: q(x.core.soc, 0.1), temp: q(x.core.tempC, 0.1), solarIn: q(f.solarBattery), gridIn: q(f.gridBattery), out: q(f.batteryHome + f.batteryGrid) }
    },
    shallow,
  )

  // Power on each line: + = towards the cabinet (solar, grid), + = towards the load.
  const live = { solar: s.solarIn, grid: s.gridIn, load: s.out }
  const demo = {
    live,
    solar: { solar: 4.2, grid: 0, load: 0 },
    grid: { solar: 0, grid: 3.0, load: 0 },
    load: { solar: 0, grid: 0, load: 3.4 },
    export: { solar: 0, grid: -3.0, load: 0 },
  }[mode]
  const charging = mode === 'live' ? s.battery > 0.05 : mode === 'solar' || mode === 'grid'
  const discharging = mode === 'live' ? s.battery < -0.05 : mode === 'load' || mode === 'export'
  const m = MODES.find((x) => x.id === mode)!

  return (
    <section id='storage' aria-labelledby='storage-title' className='relative overflow-hidden border-t border-line py-[var(--section-y)]'>
      <div aria-hidden className='pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(600px_300px_at_50%_0%,rgba(61,220,151,0.06),transparent)]' />
      <div className='container-x relative'>
        <SectionHeader
          index={index}
          kicker='Battery energy storage'
          id='storage-title'
          title={<>Storage that knows which way the energy should go.</>}
          lede='Lithium batteries enable efficient storage and electricity trade. A battery is only as good as its timing: CARBONOZ sees the pack, the BMS, the inverter and the grid connection together — so every charge and discharge has a source, a destination and a reason.'
          aside={<div className='mt-5'><StatusTag status='demo' /></div>}
        />

        <Live className='homeos mt-14'>
          <div className='panel overflow-hidden'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3'>
              <div className='scroll-x -mx-1 px-1'>
                <Segmented label='Energy direction' value={mode} onChange={setMode} options={MODES.map((x) => ({ id: x.id, label: x.label }))} size='sm' />
              </div>
              <SimTag>{mode === 'live' ? 'Simulation' : 'Illustration'}</SimTag>
            </div>
            <div className='grid lg:grid-cols-12'>
              <div className='relative lg:col-span-8'>
                <div className='relative mx-auto aspect-[900/520] w-full max-w-[900px]'>
                  <svg viewBox='0 0 900 520' className='absolute inset-0 h-full w-full text-fg' aria-hidden>
                    <FlowPath d={PATH.solar} power={demo.solar} color='var(--color-solar)' width={2} r={3} />
                    <FlowPath d={PATH.grid} power={demo.grid} color='var(--color-grid)' width={2} r={3} />
                    <FlowPath d={PATH.load} power={demo.load} color='var(--color-batt)' width={2} r={3} />
                    <Cabinet soc={mode === 'live' ? s.soc : mode === 'solar' || mode === 'grid' ? 62 : 74} charging={charging} discharging={discharging} temp={s.temp} />
                    <End x={110} y={120} label='Solar' color='var(--color-solar)' />
                    <End x={790} y={120} label='Grid' color='var(--color-grid)' />
                    <End x={790} y={410} label='Load' color='var(--color-load)' />
                  </svg>
                </div>
                <p className='px-5 pb-5 text-center text-[13px] text-muted lg:absolute lg:inset-x-0 lg:bottom-0'>{m.line}</p>
              </div>
              <dl className='grid grid-cols-2 content-start gap-px self-start border-t border-line bg-line lg:col-span-4 lg:border-b lg:border-l lg:border-t-0'>
                <Tile k='Usable capacity' v={<><span className='num'>{CAPACITY_KWH.toFixed(2)}</span> kWh</>} note={`${SITE.packs} packs × ${SITE.packKwh} kWh (demo site)`} />
                <Tile k='Power' v={<><Num value={mode === 'live' ? s.battery : charging ? 4.2 : -3.4} abs digits={2} /> kW</>} note={mode === 'live' ? batteryState(s.battery) : charging ? 'Charging' : 'Discharging'} />
                <Tile k='State of charge' v={<><Num value={s.soc} digits={0} />%</>} note='Live, demo site' />
                <Tile k='Thermal' v={<><Num value={s.temp} digits={1} /> °C</>} note='Pack average · 4 sensors per pack' />
                <Tile k='BMS' v='3 units' note='48 cells monitored' />
                <Tile k='Inverter link' v={`${SITE.inverters} × ${SITE.inverterKw} kW`} note='Hybrid inverters' />
              </dl>
            </div>
          </div>
        </Live>
        <div className='mt-6 flex flex-wrap items-center justify-between gap-4'>
          <p className='max-w-[70ch] text-[12.5px] text-subtle'>Values above describe the simulated demo site. CARBONOZ’s storage products are the LIXI low- and high-voltage batteries — 48 V, 200 V and 400 V.</p>
          <Button href='/solutions/lixi/' variant='secondary'>
            LIXI batteries
          </Button>
        </div>
      </div>
    </section>
  )
}

function Tile({ k, v, note }: { k: string; v: React.ReactNode; note: string }) {
  return (
    <div className='bg-ink-900 px-5 py-4'>
      <dt className='text-[11.5px] text-muted'>{k}</dt>
      <dd className='mt-1 text-[22px] tracking-[-0.02em] text-fg'>{v}</dd>
      <dd className='text-[11.5px] text-subtle'>{note}</dd>
    </div>
  )
}

function End({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r='34' fill='var(--color-ink-950)' stroke={color} strokeOpacity='0.5' />
      <circle r='3.5' fill={color} />
      <text y='56' textAnchor='middle' className='label' fontSize='11' fill='var(--color-muted)'>
        {label.toUpperCase()}
      </text>
    </g>
  )
}

/** Battery cabinet: controller, three modules, inverter and grid connection, drawn as an elevation. */
function Cabinet({ soc, charging, discharging, temp }: { soc: number; charging: boolean; discharging: boolean; temp: number }) {
  const x = 372
  const y = 150
  const w = 156
  const h = 250
  const modules = [0, 1, 2]
  const fill = Math.max(0, Math.min(100, soc)) / 100
  return (
    <g>
      <rect x={x - 10} y={y - 10} width={w + 20} height={h + 40} rx='8' fill='var(--color-ink-900)' stroke='currentColor' strokeOpacity='0.18' />
      {/* controller / BMS */}
      <rect x={x} y={y} width={w} height='34' rx='3' fill='var(--color-ink-800)' stroke='currentColor' strokeOpacity='0.12' />
      <text x={x + 10} y={y + 21} fontSize='10' className='label' fill='var(--color-muted)'>
        BMS · CONTROLLER
      </text>
      <circle cx={x + w - 14} cy={y + 17} r='3' fill={charging ? 'var(--color-batt)' : discharging ? 'var(--color-warn)' : 'var(--color-subtle)'}>
        {(charging || discharging) && <animate attributeName='opacity' values='1;0.3;1' dur='1.6s' repeatCount='indefinite' />}
      </circle>
      {modules.map((i) => {
        const my = y + 44 + i * 62
        return (
          <g key={i}>
            <rect x={x} y={my} width={w} height='54' rx='3' fill='var(--color-ink-950)' stroke='currentColor' strokeOpacity='0.12' />
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x={x + 10 + k * 17.5} y={my + 10} width='13' height='34' rx='2' fill='currentColor' fillOpacity='0.05' />
            ))}
            <motion.rect x={x + 10} y={my + 10} height='34' rx='2' fill='var(--color-batt)' fillOpacity='0.22' animate={{ width: 136 * fill }} transition={{ duration: 1 }} />
            <text x={x + w - 8} y={my + 50} textAnchor='end' fontSize='9' className='num' fill='var(--color-subtle)'>
              {['A', 'B', 'C'][i]}
            </text>
          </g>
        )
      })}
      <text x={x + w / 2} y={y + h + 22} textAnchor='middle' fontSize='12' className='num' fill='var(--color-fg)'>
        {soc.toFixed(0)}% · {temp.toFixed(1)} °C
      </text>
      {/* callouts, kept clear of the energy paths */}
      <line x1={x - 10} x2={x - 56} y1={y + 17} y2={y + 17} stroke='currentColor' strokeOpacity='0.2' />
      <text x={x - 62} y={y + 21} textAnchor='end' fontSize='10' className='label' fill='var(--color-subtle)'>
        BMS
      </text>
      <line x1={x - 10} x2={x - 56} y1={y + 132} y2={y + 132} stroke='currentColor' strokeOpacity='0.2' />
      <text x={x - 62} y={y + 136} textAnchor='end' fontSize='10' className='label' fill='var(--color-subtle)'>
        THERMAL · 4 SENSORS / PACK
      </text>
      <line x1={x - 10} x2={x - 56} y1={y + 230} y2={y + 230} stroke='currentColor' strokeOpacity='0.2' />
      <text x={x - 62} y={y + 234} textAnchor='end' fontSize='10' className='label' fill='var(--color-subtle)'>
        HYBRID INVERTER LINK
      </text>
    </g>
  )
}

