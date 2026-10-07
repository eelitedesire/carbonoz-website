'use client'

/**
 * App device cards (features/solar/components/cards.tsx, BatteryCard.tsx,
 * InverterCard.tsx, CellVoltageTable.tsx), ported to the demo telemetry.
 */
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BatteryCharging, CalendarDays, Cpu, Gauge, HeartPulse, House, Minus, Moon, Percent, RefreshCcw, Sun, Thermometer, Waves, Zap } from 'lucide-react'
import { ReactNode, useId } from 'react'
import type { Inverter, Pack } from '@/sim/telemetry'
import { SITE } from '@/sim/model'
import { BatteryGlyph, PylonIcon } from './Glyphs'
import { AnimatedNumber, Card, CardHeader, cn, powerText, StatusBadge, Tone } from './ui'

// ------------------------------------------------------------------ headline

/** Headline icons, identical to the dashboard metric cards. */
export const ICONS = {
  pv: <Sun size={34} strokeWidth={1.5} className='text-solar' />,
  load: <House size={32} strokeWidth={1.5} className='text-home' />,
  grid: <PylonIcon size={34} strokeWidth={1.3} className='text-fg-2' />,
  battery: (soc?: number) => <BatteryGlyph level={soc ?? 0} width={22} height={36} />,
}

/** Headline value tile — same anatomy as the dashboard metric cards. */
export function MetricCard({ icon, label, value, decimals = 1, unit, hint, tone, bar, barTone = 'bg-batt', extra, className }: { icon?: ReactNode; label: ReactNode; value: number | string; decimals?: number; unit?: string; hint?: ReactNode; tone?: string; bar?: number; barTone?: string; extra?: ReactNode; className?: string }) {
  return (
    <Card className={cn('flex min-w-0 items-start gap-2.5 px-3.5 py-3.5 2xl:gap-3 2xl:px-4', className)}>
      {icon && <span className='mt-1 grid h-9 w-8 shrink-0 place-items-center'>{icon}</span>}
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='truncate text-[12px] font-semibold uppercase leading-4 tracking-[0.02em] text-fg'>{label}</span>
        <span className='mt-1.5 flex items-baseline gap-1 text-fg'>
          <span className='tabular text-[23px] font-semibold leading-none tracking-[-0.02em]'>{typeof value === 'number' ? <AnimatedNumber value={value} decimals={decimals} /> : value}</span>
          {unit && <span className='text-[15px] font-medium text-fg-2'>{unit}</span>}
          {extra && <span className='ml-1 whitespace-nowrap text-[11.5px] text-muted'>{extra}</span>}
        </span>
        {bar != null && (
          <span className='mt-2 h-1 overflow-hidden rounded-full bg-panel-3'>
            <span className={cn('block h-full rounded-full transition-[width] duration-700', barTone)} style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} />
          </span>
        )}
        {hint && <span className={cn('mt-2 truncate text-[13px] font-medium leading-4 text-muted', tone)}>{hint}</span>}
      </span>
    </Card>
  )
}

/** "3.80 kW" split for MetricCard (W below 1 kW, like the app). */
export function powerParts(kw: number) {
  const w = Math.abs(kw) * 1000
  return w < 1000 ? { value: Math.round(w), unit: 'W', decimals: 0 } : { value: w / 1000, unit: 'kW', decimals: w < 10000 ? 2 : 1 }
}

// ------------------------------------------------------------------ battery

const levelColor = (soc: number) => (soc < 15 ? 'var(--color-danger)' : soc < 35 ? 'var(--color-gridp)' : 'var(--color-batt)')

/** Large battery with 10 segments; the charge level fills from the left. */
export function BatteryGauge({ soc, charging }: { soc: number; charging: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const level = Math.max(0, Math.min(100, soc))
  const color = levelColor(level)
  const segs = 10
  const lit = Math.round((level / 100) * segs)
  return (
    <svg viewBox='0 0 212 96' className='h-auto w-full max-w-[212px]' role='img' aria-label={`State of charge ${Math.round(level)}%`}>
      <defs>
        <linearGradient id={`${id}-shine`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#fff' stopOpacity='0.35' />
          <stop offset='0.5' stopColor='#fff' stopOpacity='0' />
        </linearGradient>
      </defs>
      <rect x='2' y='2' width='194' height='92' rx='18' fill='var(--color-panel-2)' stroke='var(--color-line-strong)' strokeWidth='2.5' />
      <rect x='198' y='32' width='10' height='32' rx='4' fill='var(--color-line-strong)' />
      {Array.from({ length: segs }, (_, i) => (
        <rect key={i} x={12 + i * 18} y='12' width='14' height='72' rx='4' fill={i < lit ? color : 'var(--color-panel-3)'} opacity={i < lit ? 0.35 + 0.65 * ((i + 1) / segs) : 1} className={charging && i === lit - 1 ? 'animate-pulse' : undefined} />
      ))}
      <rect x='8' y='8' width='182' height='40' rx='14' fill={`url(#${id}-shine)`} />
      {charging && <path d='M110 22 92 52h14l-6 22 22-33h-14l6-19z' fill='#fff' stroke='var(--color-panel)' strokeWidth='2' strokeLinejoin='round' />}
    </svg>
  )
}

function StateChip({ state, kw }: { state: Pack['state']; kw: number }) {
  const tone: Tone = state === 'Charging' ? 'good' : state === 'Discharging' ? 'solar' : 'neutral'
  const Icon = state === 'Charging' ? ArrowDownRight : state === 'Discharging' ? ArrowUpRight : Minus
  return (
    <StatusBadge tone={tone} dot={state !== 'Idle'} pulse={state === 'Charging'}>
      <Icon size={12} className='-ml-0.5' />
      {state}
      {state !== 'Idle' && <span className='tabular font-semibold'>{powerText(Math.abs(kw))}</span>}
    </StatusBadge>
  )
}

export function Tile({ icon, label, value, unit, tone }: { icon: ReactNode; label: string; value: string; unit?: string; tone?: 'warning' | 'critical' | 'good' }) {
  return (
    <div className='flex min-w-0 items-center gap-3 bg-panel px-4 py-3'>
      <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', tone === 'critical' ? 'bg-danger/10 text-danger' : tone === 'warning' ? 'bg-gridp/10 text-gridp' : tone === 'good' ? 'bg-batt/10 text-batt' : 'bg-panel-3 text-fg-2')}>{icon}</span>
      <span className='min-w-0'>
        <span className='block truncate text-[11.5px] text-muted'>{label}</span>
        <span className='tabular block truncate text-[15px] font-semibold text-fg'>
          {value}
          {unit && <span className='ml-1 text-[12px] font-normal text-fg-2'>{unit}</span>}
        </span>
      </span>
    </div>
  )
}

const duration = (h: number) => {
  const total = Math.round(h * 60)
  return `${Math.floor(total / 60)} h ${total % 60} min`
}

/** Premium battery card: charge gauge, live state, key figures, capacity, BMS summary. */
export function BatteryCard({ p, className }: { p: Pack; className?: string }) {
  const remaining = (p.soc / 100) * SITE.packKwh
  const eta = p.power > 0.05 ? ((100 - p.soc) / 100) * SITE.packKwh / p.power : p.power < -0.05 ? remaining / -p.power : null
  const spreadTone: Tone = p.spreadMv < 30 ? 'good' : p.spreadMv < 80 ? 'warning' : 'critical'
  const balancing = p.cells.filter((c) => c.balancing).length
  const maxT = Math.max(...p.temperatures)
  return (
    <Card className={cn('@container overflow-hidden p-0', className)}>
      <div className='px-4 pt-4'>
        <CardHeader
          title={p.name}
          subtitle={`LFP 16S · ${p.bmsId}`}
          icon={<BatteryCharging size={16} />}
          action={
            <>
              <StatusBadge tone={p.alarms.length ? 'warning' : 'good'} dot>
                {p.alarms.length ? `${p.alarms.length} alarm` : 'Normal'}
              </StatusBadge>
              <span className='hidden text-[11.5px] text-muted sm:inline'>just now</span>
            </>
          }
        />
      </div>
      <div className='grid items-center gap-5 px-4 py-5 @md:grid-cols-[minmax(0,212px)_minmax(0,1fr)]'>
        <BatteryGauge soc={p.soc} charging={p.state === 'Charging'} />
        <div className='min-w-0'>
          <div className='flex items-baseline gap-1'>
            <span className='tabular text-[44px] font-semibold leading-none tracking-[-0.03em] text-fg'>
              <AnimatedNumber value={p.soc} decimals={0} />
            </span>
            <span className='text-[20px] font-medium text-fg-2'>%</span>
          </div>
          <p className='mt-1 text-[12.5px] text-muted'>State of charge</p>
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <StateChip state={p.state} kw={p.power} />
            {eta != null && (
              <span className='text-[12.5px] text-fg-2'>
                {p.power > 0 ? 'Full in' : 'Empty in'} {duration(eta)}
                <span className='text-muted'> · estimate</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-px border-t border-line bg-line @md:grid-cols-3'>
        <Tile icon={<Gauge size={15} />} label='Voltage' value={p.voltage.toFixed(2)} unit='V' />
        <Tile icon={<Activity size={15} />} label='Current' value={p.current.toFixed(1)} unit='A' />
        <Tile icon={<Zap size={15} />} label='Power' value={powerText(Math.abs(p.power))} />
        <Tile icon={<Thermometer size={15} />} label='Temperature' value={maxT.toFixed(1)} unit='°C' tone={maxT >= 45 ? 'warning' : undefined} />
        <Tile icon={<HeartPulse size={15} />} label='Health' value={p.soh.toFixed(0)} unit='%' tone='good' />
        <Tile icon={<RefreshCcw size={15} />} label='Cycles' value={String(p.cycles)} />
      </div>
      <div className='border-t border-line px-4 py-3'>
        <div className='flex items-baseline justify-between text-[12px]'>
          <span className='text-muted'>Capacity</span>
          <span className='tabular text-fg'>
            {((remaining / SITE.nominalPackV) * 1000).toFixed(1)} of {((SITE.packKwh / SITE.nominalPackV) * 1000).toFixed(1)} Ah
          </span>
        </div>
        <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-3'>
          <div className='h-full rounded-full transition-[width] duration-700' style={{ width: `${p.soc}%`, background: levelColor(p.soc) }} />
        </div>
      </div>
      <div className='grid gap-2 border-t border-line px-4 py-3'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-panel-2 px-3 py-2 text-[12px]'>
          <span className='flex items-center gap-1.5 font-medium text-fg'>
            <Activity size={13} className='text-muted' />
            {p.bmsId.toUpperCase()}
          </span>
          <span className='text-fg-2'>{p.cells.length} cells</span>
          <span className='tabular text-fg-2'>
            {p.minCell.voltage.toFixed(3)}–{p.maxCell.voltage.toFixed(3)} V
          </span>
          <StatusBadge tone={spreadTone}>Spread {p.spreadMv.toFixed(0)} mV</StatusBadge>
          {balancing > 0 && <StatusBadge tone='info'>{balancing} cells balancing</StatusBadge>}
        </div>
      </div>
    </Card>
  )
}

// ------------------------------------------------------------------ cells

/** One tile per cell: voltage, deviation from the pack average, position between min and max (app CellVoltageTable). */
export function CellTiles({ p, selected, onSelect, cols = 'grid-cols-2 sm:grid-cols-4 xl:grid-cols-8' }: { p: Pack; selected?: number | null; onSelect?: (id: number | null) => void; cols?: string }) {
  const min = p.minCell.voltage
  const max = p.maxCell.voltage
  const span = max - min
  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <p className='text-[12.5px] font-medium text-fg-2'>Cell voltages</p>
        <span className='text-[11.5px] text-muted'>{p.cells.length} cells</span>
      </div>
      <ul className={cn('grid gap-2', cols)} aria-label='Cell voltages'>
        {p.cells.map((c) => {
          const isLow = c.id === p.minCell.id
          const isHigh = c.id === p.maxCell.id && span > 0
          const dev = Math.round((c.voltage - p.avgCell) * 1000)
          const pos = span === 0 ? 50 : ((c.voltage - min) / span) * 100
          const on = selected === c.id
          return (
            <li key={c.id}>
              <button
                type='button'
                onClick={() => onSelect?.(on ? null : c.id)}
                aria-pressed={on}
                aria-label={`Cell ${c.id}: ${c.voltage.toFixed(3)} V, ${dev} mV from average${isLow ? ', lowest' : ''}${isHigh ? ', highest' : ''}`}
                className={cn('w-full rounded-lg border bg-panel-2 px-2.5 py-2 text-left transition-colors', on ? 'border-fg/50' : isLow ? 'border-accent/40' : isHigh ? 'border-gridp/40' : 'border-line hover:border-line-strong')}
              >
                <span className='flex h-5 items-center justify-between gap-1'>
                  <span className='text-[11px] text-muted'>Cell {c.id}</span>
                  {isLow && <StatusBadge tone='info'>Min</StatusBadge>}
                  {isHigh && <StatusBadge tone='warning'>Max</StatusBadge>}
                </span>
                <span className='tabular mt-0.5 block text-[14px] font-semibold text-fg'>{c.voltage.toFixed(3)} V</span>
                <span className='mt-1.5 block h-1 overflow-hidden rounded-full bg-panel-3'>
                  <span className={cn('block h-full rounded-full transition-[width] duration-700', isLow ? 'bg-accent' : isHigh ? 'bg-gridp' : 'bg-batt')} style={{ width: `${Math.max(6, pos)}%` }} />
                </span>
                <span className='tabular mt-1 block text-[10.5px] text-muted'>
                  {`${dev > 0 ? '+' : dev < 0 ? '−' : '±'}${Math.abs(dev)} mV`} · {c.temperature.toFixed(1)} °C{c.balancing && ' · Balancing'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ------------------------------------------------------------------ inverter

type InvState = 'producing' | 'standby' | 'fault'
const INV: Record<InvState, { tone: Tone; icon: ReactNode; label: string }> = {
  producing: { tone: 'good', icon: <Sun size={12} className='-ml-0.5' />, label: 'Producing' },
  standby: { tone: 'neutral', icon: <Moon size={12} className='-ml-0.5' />, label: 'Standby' },
  fault: { tone: 'critical', icon: <Activity size={12} className='-ml-0.5' />, label: 'Island mode' },
}

function PowerRing({ output, load, state }: { output: number; load: number; state: InvState }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const r = 52
  const c = 2 * Math.PI * r
  const arc = 0.75
  const color = state === 'fault' ? 'var(--color-danger)' : 'var(--color-solar)'
  const p = powerText(Math.abs(output)).split(' ')
  return (
    <div className='relative h-[140px] w-[140px] shrink-0'>
      <svg viewBox='0 0 128 128' className='h-full w-full -rotate-[225deg]' aria-hidden>
        <defs>
          <linearGradient id={`${id}-g`} x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stopColor={color} stopOpacity='0.55' />
            <stop offset='1' stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx='64' cy='64' r={r} fill='none' stroke='var(--color-panel-3)' strokeWidth='10' strokeLinecap='round' strokeDasharray={`${c * arc} ${c}`} />
        {load > 0 && <circle cx='64' cy='64' r={r} fill='none' stroke={`url(#${id}-g)`} strokeWidth='10' strokeLinecap='round' strokeDasharray={`${c * arc * Math.min(1, load)} ${c}`} className='transition-[stroke-dasharray] duration-700' />}
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
        <span className='tabular text-[28px] font-semibold leading-none tracking-[-0.03em] text-fg'>{p[0]}</span>
        <span className='mt-0.5 text-[12.5px] font-medium text-fg-2'>{p[1]}</span>
        <span className='mt-1 text-[10.5px] uppercase tracking-[0.08em] text-muted'>Output</span>
      </div>
    </div>
  )
}

export function InverterCard({ inv, yieldToday }: { inv: Inverter; yieldToday?: number }) {
  const state: InvState = inv.status === 'Island mode' ? 'fault' : inv.status === 'Standby' ? 'standby' : 'producing'
  const load = Math.abs(inv.acPower) / SITE.inverterKw
  const active = state === 'producing' && inv.pvPower > 0.02
  const side = (icon: ReactNode, label: string, main: string, sub: string | null) => (
    <div className='flex min-w-0 items-center gap-2.5'>
      <span className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-panel-3 text-fg-2'>{icon}</span>
      <span className='min-w-0'>
        <span className='block truncate text-[11px] uppercase tracking-[0.06em] text-muted'>{label}</span>
        <span className='tabular block truncate text-[14px] font-semibold text-fg'>{main}</span>
        {sub && <span className='tabular block truncate text-[11.5px] text-fg-2'>{sub}</span>}
      </span>
    </div>
  )
  return (
    <Card className='@container overflow-hidden p-0'>
      <div className='px-4 pt-4'>
        <CardHeader title={inv.name} subtitle={`Hybrid · ${SITE.inverterKw} kW · ${inv.id}`} icon={<Cpu size={16} />} action={<span className='hidden text-[11.5px] text-muted sm:inline'>just now</span>} />
      </div>
      <div className='grid items-center gap-5 px-4 py-5 @lg:grid-cols-[auto_minmax(0,1fr)]'>
        <PowerRing output={inv.acPower} load={load} state={state} />
        <div className='flex min-w-0 flex-col gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <StatusBadge tone={INV[state].tone} dot={state !== 'standby'} pulse={state === 'producing'}>
              {INV[state].icon}
              {INV[state].label}
            </StatusBadge>
            <span className='text-[12.5px] text-fg-2'>
              {(load * 100).toFixed(0)}% of {SITE.inverterKw}.00 kW rated
            </span>
          </div>
          <div className='grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-line bg-panel-2 px-3 py-2.5'>
            {side(<Sun size={16} className='text-solar' />, 'PV input', powerText(inv.pvPower), null)}
            <span className={cn('flex items-center gap-1 text-subtle', active && 'text-solar')} aria-hidden>
              <span className={cn('h-[2px] w-6 rounded bg-current opacity-60', active && 'animate-pulse')} />
              <ArrowRight size={15} />
            </span>
            {side(<Zap size={16} className='text-accent-ink' />, 'AC output', powerText(Math.abs(inv.acPower)), `${inv.acVoltage.toFixed(0)} V · ${inv.frequency.toFixed(2)} Hz`)}
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-px border-t border-line bg-line @md:grid-cols-3'>
        <Tile icon={<CalendarDays size={15} />} label='Yield today' value={(yieldToday ?? 0).toFixed(1)} unit='kWh' />
        <Tile icon={<Percent size={15} />} label='Efficiency' value={active ? (96.2 + Math.min(1.4, load * 2)).toFixed(1) : '—'} unit={active ? '%' : undefined} tone={active ? 'good' : undefined} />
        <Tile icon={<Thermometer size={15} />} label='Temperature' value={inv.temperature.toFixed(1)} unit='°C' tone={inv.temperature >= 60 ? 'warning' : undefined} />
        <Tile icon={<Waves size={15} />} label='Frequency' value={inv.frequency.toFixed(2)} unit='Hz' />
        <Tile icon={<Gauge size={15} />} label='AC voltage' value={inv.acVoltage.toFixed(0)} unit='V' />
        <Tile icon={<BatteryCharging size={15} />} label='Battery' value={powerText(Math.abs(inv.batteryPower))} />
      </div>
    </Card>
  )
}
