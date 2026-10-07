'use client'

/**
 * The CARBONOZ app's Energy Flow (features/dashboard/EnergyFlow.tsx), ported:
 * same geometry, house illustration, rails, dashes, white particles and
 * arrowheads. Values come from the demo simulation (kW).
 */
import { House, Info, SolarPanel } from 'lucide-react'
import { memo, ReactNode, useId } from 'react'
import { flows as splitFlows } from '@/sim/model'
import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { BatteryGlyph, PylonIcon } from './Glyphs'
import { HouseIllustration } from './HouseIllustration'
import { Card, cn, power, powerText, StatusBadge } from './ui'

const IDLE = 0.02 // kW — the app's 20 W idle threshold
const COLORS = { solar: 'var(--color-solar)', grid: 'var(--color-gridp)', home: 'var(--color-home)', battery: 'var(--color-batt)' }

export interface FlowView {
  pv: number
  load: number
  /** + charging */
  battery: number
  /** + import */
  grid: number
  soc: number
  outage?: boolean
}

type Dir = 'import' | 'export' | 'idle'
type BState = 'charging' | 'discharging' | 'idle'
const gridDir = (s: FlowView): Dir => (s.outage ? 'idle' : s.grid > IDLE ? 'import' : s.grid < -IDLE ? 'export' : 'idle')
const battState = (s: FlowView): BState => (s.battery > IDLE ? 'charging' : s.battery < -IDLE ? 'discharging' : 'idle')
const WORD = { import: 'Importing', export: 'Exporting', idle: 'Idle', charging: 'Charging', discharging: 'Discharging' }

/** Rail + animated dashes + travelling particle + arrowhead; speed scales with power (app FlowLine). */
export function FlowLine({ d, color, kw, reverse, dashed, title, markerId, animate }: { d: string; color: string; kw: number; reverse?: boolean; dashed?: boolean; title: string; markerId: string; animate: boolean }) {
  const active = kw > IDLE
  // Quantised so live updates don't restart the particle on every tick.
  const dur = Math.max(0.9, Math.round((2.6 - kw * 0.35) * 4) / 4)
  return (
    <g opacity={active ? 1 : 0.22}>
      <title>{title}</title>
      <path d={d} fill='none' stroke={color} strokeOpacity={0.18} strokeWidth={4} strokeLinecap='round' />
      <path
        d={d}
        fill='none'
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeDasharray={!active ? '2 5' : undefined}
        className={cn(active && animate && dashed && 'flow-line', active && animate && dashed && reverse && 'reverse')}
        markerEnd={active && !reverse ? `url(#${markerId})` : undefined}
        markerStart={active && reverse ? `url(#${markerId})` : undefined}
      />
      {active && animate && (
        <circle r={2.6} fill='#fff' opacity={0.95}>
          <animateMotion key={`${reverse}-${dur}`} dur={`${dur}s`} repeatCount='indefinite' path={d} keyPoints={reverse ? '1;0' : '0;1'} keyTimes='0;1' calcMode='linear' />
        </circle>
      )}
    </g>
  )
}

export function Marker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox='0 0 10 10' refX='6.5' refY='5' markerWidth='5.5' markerHeight='5.5' orient='auto-start-reverse'>
      <path d='M1 1.2 8.2 5 1 8.8z' fill={color} stroke={color} strokeWidth='1' strokeLinejoin='round' />
    </marker>
  )
}

function NodeLabel({ x, y, label, kw, extra, state, anchor = 'start', percent }: { x: number; y: number; label: string; kw?: number; percent?: number; extra?: string; state?: string; anchor?: 'start' | 'middle' | 'end' }) {
  const p = power(kw)
  const value = percent != null ? String(Math.round(percent)) : p.value
  const unit = percent != null ? '%' : p.unit
  return (
    <g>
      <text x={x} y={y} textAnchor={anchor} className='fill-fg-2' fontSize='11.5' fontWeight={500}>
        {label}
        {state && (
          <tspan fontSize='10.5' fontWeight={500} className='fill-muted' dx='5'>
            {state}
          </tspan>
        )}
      </text>
      <text x={x} y={y + 20} textAnchor={anchor} className='fill-fg' fontSize='15.5' fontWeight={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
        <tspan fontSize='11' fontWeight={500} className='fill-fg-2' dx={unit === '%' ? 1 : 3}>
          {unit}
        </tspan>
        {extra && (
          <tspan fontSize='10.5' fontWeight={400} className='fill-muted' dx='5'>
            {extra}
          </tspan>
        )}
      </text>
    </g>
  )
}

const PATHS = {
  solar: 'M124 42 H158 Q170 42 170 54 V70 Q170 80 182 80 H222',
  grid: 'M124 122 H156 Q168 122 168 112 V108 Q168 98 180 98 H222',
  home: 'M434 88 H446 Q456 88 456 78 V66 Q456 56 466 56 H494',
  battery: 'M330 136 V160',
}

export function describeFlow(s: FlowView) {
  return `Energy flow: solar ${powerText(s.pv)}, home ${powerText(s.load)}, grid ${powerText(Math.abs(s.grid))} ${WORD[gridDir(s)].toLowerCase()}, battery ${Math.round(s.soc)}% ${WORD[battState(s)].toLowerCase()} ${powerText(Math.abs(s.battery))}`
}

/** Desktop layout: solar & grid on the left, house as the hub, home on the right, battery below. */
export const FlowDiagram = memo(function FlowDiagram({ s, animate, className, children }: { s: FlowView; animate: boolean; className?: string; children?: ReactNode }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const m = (k: string) => `${uid}-${k}`
  const g = gridDir(s)
  const b = battState(s)
  const bw = Math.abs(s.battery)
  const gw = s.outage ? 0 : Math.abs(s.grid)
  return (
    <svg viewBox='0 0 580 212' className={cn('h-auto w-full', className)} role='img' aria-label={describeFlow(s)}>
      <defs>
        <Marker id={m('s')} color={COLORS.solar} />
        <Marker id={m('g')} color={COLORS.grid} />
        <Marker id={m('h')} color={COLORS.home} />
        <Marker id={m('b')} color={COLORS.battery} />
      </defs>
      <SolarPanel x={26} y={22} width={40} height={40} strokeWidth={1.4} className='text-solar' />
      <NodeLabel x={78} y={36} label='Solar' kw={s.pv} />
      <FlowLine d={PATHS.solar} color={COLORS.solar} kw={s.pv} animate={animate} title={`Solar ${powerText(s.pv)}`} markerId={m('s')} />

      <PylonIcon x={26} y={100} width={40} height={40} strokeWidth={1.3} className={s.outage ? 'text-danger' : 'text-fg-2'} />
      <NodeLabel x={78} y={116} label='Grid' kw={gw} state={s.outage ? 'Offline' : g !== 'idle' ? WORD[g] : undefined} />
      <FlowLine d={PATHS.grid} color={COLORS.grid} kw={gw} animate={animate} reverse={g === 'export'} title={`Grid ${WORD[g]} ${powerText(gw)}`} markerId={m('g')} />

      <svg x={222} y={-2} width={214} height={152} viewBox='0 0 240 170'>
        <HouseIllustration lit={s.load > IDLE} />
      </svg>

      <FlowLine d={PATHS.home} color={COLORS.home} kw={s.load} animate={animate} dashed title={`Home consumption ${powerText(s.load)}`} markerId={m('h')} />
      <House x={494} y={26} width={36} height={36} strokeWidth={1.5} className='text-home' />
      <NodeLabel x={512} y={86} anchor='middle' label='Home' kw={s.load} />

      <FlowLine d={PATHS.battery} color={COLORS.battery} kw={bw} animate={animate} reverse={b === 'discharging'} title={`Battery ${WORD[b]} ${powerText(bw)}`} markerId={m('b')} />
      <svg x={270} y={160} width={26} height={42} viewBox='0 0 22 36'>
        <BatteryGlyph level={s.soc} charging={b === 'charging'} />
      </svg>
      <NodeLabel x={306} y={176} label='Battery' percent={s.soc} state={b !== 'idle' ? WORD[b] : undefined} extra={bw > IDLE ? `(${powerText(bw)})` : undefined} />
      {children}
    </svg>
  )
})

const COMPACT = {
  solar: 'M29 52 V80 Q29 92 41 92 H106',
  grid: 'M29 176 V142 Q29 130 41 130 H106',
  home: 'M234 92 H299 Q311 92 311 80 V56',
  battery: 'M234 130 H299 Q311 130 311 142 V166',
}

/** Portrait layout for phones: nodes in the corners, house in the middle. */
export const FlowDiagramCompact = memo(function FlowDiagramCompact({ s, animate, className }: { s: FlowView; animate: boolean; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const m = (k: string) => `${uid}-${k}`
  const g = gridDir(s)
  const b = battState(s)
  const bw = Math.abs(s.battery)
  const gw = s.outage ? 0 : Math.abs(s.grid)
  return (
    <svg viewBox='0 0 340 222' className={cn('h-auto w-full', className)} role='img' aria-label={describeFlow(s)}>
      <defs>
        <Marker id={m('s')} color={COLORS.solar} />
        <Marker id={m('g')} color={COLORS.grid} />
        <Marker id={m('h')} color={COLORS.home} />
        <Marker id={m('b')} color={COLORS.battery} />
      </defs>
      <svg x={98} y={40} width={144} height={102} viewBox='0 0 240 170'>
        <HouseIllustration lit={s.load > IDLE} />
      </svg>
      <FlowLine d={COMPACT.solar} color={COLORS.solar} kw={s.pv} animate={animate} title={`Solar ${powerText(s.pv)}`} markerId={m('s')} />
      <FlowLine d={COMPACT.grid} color={COLORS.grid} kw={gw} animate={animate} reverse={g === 'export'} title={`Grid ${WORD[g]}`} markerId={m('g')} />
      <FlowLine d={COMPACT.home} color={COLORS.home} kw={s.load} animate={animate} dashed title='Home consumption' markerId={m('h')} />
      <FlowLine d={COMPACT.battery} color={COLORS.battery} kw={bw} animate={animate} reverse={b === 'discharging'} title={`Battery ${WORD[b]}`} markerId={m('b')} />
      <SolarPanel x={12} y={10} width={34} height={34} strokeWidth={1.4} className='text-solar' />
      <NodeLabel x={54} y={22} label='Solar' kw={s.pv} />
      <PylonIcon x={12} y={178} width={34} height={34} strokeWidth={1.3} className={s.outage ? 'text-danger' : 'text-fg-2'} />
      <NodeLabel x={54} y={192} label='Grid' kw={gw} state={s.outage ? 'Offline' : g !== 'idle' ? WORD[g] : undefined} />
      <House x={294} y={12} width={34} height={34} strokeWidth={1.5} className='text-home' />
      <NodeLabel x={284} y={22} anchor='end' label='Home' kw={s.load} />
      <NodeLabel x={292} y={192} anchor='end' label='Battery' percent={s.soc} state={b !== 'idle' ? WORD[b] : undefined} />
      <svg x={300} y={170} width={24} height={40} viewBox='0 0 22 36'>
        <BatteryGlyph level={s.soc} charging={b === 'charging'} />
      </svg>
    </svg>
  )
})

const DOT = { solar: 'bg-solar', grid: 'bg-gridp', battery: 'bg-batt', home: 'bg-home' }
const NAME = { solar: 'Solar', grid: 'Grid', battery: 'Battery', home: 'Home' }

/** Source → destination flows (app FlowBreakdown). */
export function FlowBreakdown({ s, className, title = 'Live flows' }: { s: FlowView; className?: string; title?: string }) {
  const f = splitFlows(s)
  const rows = (
    [
      ['solar', 'home', f.solarHome],
      ['solar', 'battery', f.solarBattery],
      ['solar', 'grid', f.solarGrid],
      ['battery', 'home', f.batteryHome],
      ['grid', 'home', f.gridHome],
      ['grid', 'battery', f.gridBattery],
    ] as const
  ).filter((r) => r[2] > IDLE)
  return (
    <div className={cn('flex flex-col', className)}>
      <h4 className='mb-2.5 text-center text-[11.5px] font-medium text-fg-2'>{title}</h4>
      {rows.length === 0 ? (
        <p className='rounded-lg border border-line bg-panel-2 px-3 py-4 text-center text-[11.5px] leading-relaxed text-muted'>No energy is moving right now.</p>
      ) : (
        <ul className='divide-y divide-line rounded-lg border border-line bg-panel-2'>
          {rows.map(([from, to, kw]) => (
            <li key={`${from}-${to}`} className='flex items-center gap-2 px-2.5 py-[9px]'>
              <span className={cn('h-2 w-2 shrink-0 rounded-full', DOT[from])} />
              <span className='flex-1 truncate text-[11px] text-fg-2'>
                {NAME[from]} <span className='text-subtle'>→</span> {NAME[to]}
              </span>
              <span className='tabular text-[11px] font-medium text-fg'>{powerText(kw)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** The dashboard's Energy Flow card: title, info, live badge, diagram and breakdown. */
export function EnergyFlowCard({ s, className, detail = 'Updated just now', showBreakdown = true, footer }: { s: FlowView; className?: string; detail?: string; showBreakdown?: boolean; footer?: ReactNode }) {
  const reduced = useReducedMotion()
  const animate = !reduced
  return (
    <Card className={cn('@container relative flex min-w-0 flex-col px-4 pb-3 pt-3.5 xl:px-5', className)}>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>Energy Flow</h3>
        <span className='text-muted' title='Live power between your solar array, battery, the grid and your home.'>
          <Info size={14} />
        </span>
        <span className='ml-auto flex items-center gap-2'>
          <span className='hidden text-[11.5px] text-muted sm:inline'>{detail}</span>
          <StatusBadge tone='good' dot pulse={!reduced}>
            Live
          </StatusBadge>
        </span>
      </div>
      <div className='flex flex-1 flex-col items-center gap-4 pt-1 @2xl:flex-row @2xl:items-center @2xl:gap-3'>
        <FlowDiagram s={s} animate={animate} className='mx-auto hidden min-w-0 max-w-[620px] flex-1 @sm:block' />
        <FlowDiagramCompact s={s} animate={animate} className='mx-auto max-w-[420px] @sm:hidden' />
        {showBreakdown && <FlowBreakdown s={s} className='w-full shrink-0 @2xl:w-[168px]' />}
      </div>
      {footer}
    </Card>
  )
}
