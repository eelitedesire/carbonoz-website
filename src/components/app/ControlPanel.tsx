'use client'

import { RotateCcw, ShieldAlert, SlidersHorizontal, Sparkles } from 'lucide-react'
import { q, shallow, useSim } from '@/sim/hooks'
import { sim } from '@/sim/store'
import { BatteryMode, GridStrategy, SolarPriority } from '@/sim/model'
import { decision } from '@/sim/decision'
import { batteryState, gridState } from '@/sim/format'
import { Slider } from '@/components/ui/primitives'
import { AnimatedNumber, AppSwitch, Card, CardHeader, cn, Segmented, StatusBadge } from '@/components/homeos/ui'

const MODE_LABEL: Record<BatteryMode, string> = { auto: 'Automatic', hold: 'Hold', backup: 'Backup' }
const GRID_LABEL: Record<GridStrategy, string> = { optimized: 'Optimized', 'self-consumption': 'Self-consumption' }
const SOLAR_LABEL: Record<SolarPriority, string> = { 'self-consumption': 'Self-consumption', 'export-first': 'Export first' }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className='grid gap-2 border-b border-line py-3.5 last:border-0 @xl:grid-cols-[190px_1fr] @xl:items-center @xl:gap-6'>
      <div>
        <div className='text-[13px] font-medium text-fg'>{label}</div>
        {hint && <div className='text-[11.5px] leading-snug text-muted'>{hint}</div>}
      </div>
      <div className='min-w-0'>{children}</div>
    </div>
  )
}

/**
 * Control concept: battery mode, grid strategy, solar priority and peak
 * shaving drive the simulation directly, so every change is visible in the
 * flows, the plan and the event log. Not a statement of production features.
 */
export function ControlPanel({ className }: { className?: string }) {
  const c = useSim((x) => x.controls, shallow)
  const f = useSim((x) => x.faults, shallow)
  const live = useSim((x) => ({ battery: q(x.core.battery), grid: q(x.core.grid), soc: q(x.core.soc, 0.1), outage: x.faults.gridOutage, unserved: q(x.core.unserved) }), shallow)
  const d = useSim((x) => decision(x.core, x.controls, x.faults), (a, b) => a.action === b.action && a.reason === b.reason)
  const set = sim.setControls.bind(sim)
  const tone = d.tone === 'danger' ? 'critical' : d.tone === 'warn' ? 'warning' : d.tone === 'info' ? 'info' : 'good'

  return (
    <div className={cn('homeos @container', className)}>
    <div className='grid gap-3 @4xl:grid-cols-5'>
      <Card className='p-4 @4xl:col-span-3'>
        <CardHeader title='Strategy' subtitle='SolarAutopilot settings for this site' icon={<SlidersHorizontal size={16} />} action={<StatusBadge tone='info'>Concept · simulated</StatusBadge>} />
        <div className='mt-2'>
          <Field label='Battery mode' hint='Automatic follows the plan; Backup keeps 60% in reserve.'>
            <Segmented label='Battery mode' value={c.batteryMode} onChange={(v) => set({ batteryMode: v }, `Battery mode set to ${MODE_LABEL[v]}`)} options={(['auto', 'hold', 'backup'] as const).map((id) => ({ id, label: MODE_LABEL[id] }))} />
          </Field>
          <Field label='Grid strategy' hint='Optimized uses the forecast and tariff windows.'>
            <Segmented label='Grid strategy' value={c.gridStrategy} onChange={(v) => set({ gridStrategy: v }, `Grid strategy set to ${GRID_LABEL[v]}`)} options={(['optimized', 'self-consumption'] as const).map((id) => ({ id, label: GRID_LABEL[id] }))} />
          </Field>
          <Field label='Solar priority' hint='Where surplus solar goes first.'>
            <Segmented label='Solar priority' value={c.solarPriority} onChange={(v) => set({ solarPriority: v }, `Solar priority set to ${SOLAR_LABEL[v]}`)} options={(['self-consumption', 'export-first'] as const).map((id) => ({ id, label: SOLAR_LABEL[id] }))} />
          </Field>
          <Field label='Peak shaving' hint={`Battery caps grid import at ${c.peakLimitKw.toFixed(1)} kW.`}>
            <div className='flex items-center gap-4'>
              <AppSwitch checked={c.peakShaving} onChange={(v) => set({ peakShaving: v }, `Peak shaving ${v ? 'enabled' : 'disabled'}`)} label='Peak shaving' />
              <div className='flex-1'>
                <Slider label='Peak import limit' value={c.peakLimitKw} min={1.5} max={6} step={0.1} tint='var(--color-accent)' valueText={`${c.peakLimitKw.toFixed(1)} kilowatts`} onChange={(v) => set({ peakLimitKw: v })} />
              </div>
            </div>
          </Field>
          <Field label='Reserve / target SOC' hint={`Keep ≥ ${c.reserveSoc}% for backup; stop charging at ${c.targetSoc}%.`}>
            <div className='grid gap-1 sm:grid-cols-2 sm:gap-4'>
              <Slider label='Reserve state of charge' value={c.reserveSoc} min={10} max={60} valueText={`${c.reserveSoc} percent`} tint='var(--color-batt)' onChange={(v) => set({ reserveSoc: v })} />
              <Slider label='Target state of charge' value={c.targetSoc} min={70} max={100} valueText={`${c.targetSoc} percent`} tint='var(--color-batt)' onChange={(v) => set({ targetSoc: v })} />
            </div>
          </Field>
          <Field label='Export limit' hint={`${c.exportLimitKw.toFixed(1)} kW; above it, solar is curtailed.`}>
            <Slider label='Export limit' value={c.exportLimitKw} min={0} max={8} step={0.1} valueText={`${c.exportLimitKw.toFixed(1)} kilowatts`} tint='var(--color-gridp)' onChange={(v) => set({ exportLimitKw: v })} />
          </Field>
        </div>
      </Card>

      <div className='grid content-start gap-3 @4xl:col-span-2'>
        <Card className='p-4'>
          <CardHeader title='Effect, live' icon={<Sparkles size={16} />} action={<StatusBadge tone={tone} dot pulse>{tone === 'good' ? 'Running' : tone === 'info' ? 'Planning' : tone === 'warning' ? 'Attention' : 'Critical'}</StatusBadge>} />
          <p className='mt-3 text-[14px] font-semibold text-fg'>{d.action}</p>
          <p className='mt-1 text-[12.5px] leading-relaxed text-muted'>{d.reason}</p>
          <div className='mt-4 grid grid-cols-2 gap-2.5'>
            <div className='rounded-lg border border-line bg-panel-2 px-3 py-2'>
              <p className='text-[11px] text-muted'>Battery · {batteryState(live.battery)}</p>
              <p className='tabular mt-0.5 text-[15px] font-semibold text-fg'>
                <AnimatedNumber value={Math.abs(live.battery)} decimals={2} />
                <span className='ml-1 text-[11.5px] font-normal text-fg-2'>kW · {live.soc.toFixed(0)}%</span>
              </p>
            </div>
            <div className='rounded-lg border border-line bg-panel-2 px-3 py-2'>
              <p className='text-[11px] text-muted'>Grid · {gridState(live.grid, live.outage)}</p>
              <p className='tabular mt-0.5 text-[15px] font-semibold text-fg'>
                <AnimatedNumber value={live.outage ? 0 : Math.abs(live.grid)} decimals={2} />
                <span className='ml-1 text-[11.5px] font-normal text-fg-2'>kW</span>
              </p>
            </div>
          </div>
          <p className='mt-3 border-t border-line pt-2.5 text-[11.5px] text-muted'>{d.next}</p>
        </Card>
        <Card className='p-4'>
          <CardHeader title='Scenarios' icon={<ShieldAlert size={16} />} />
          <div className='mt-3 flex items-center justify-between gap-4 py-1.5'>
            <div>
              <div className='text-[13px] font-medium text-fg'>Grid outage</div>
              <div className='text-[11.5px] text-muted'>Inverters island; the battery carries the site.</div>
            </div>
            <AppSwitch checked={f.gridOutage} onChange={(v) => sim.setFaults({ gridOutage: v })} label='Simulate grid outage' tone='danger' />
          </div>
          <div className='flex items-center justify-between gap-4 border-t border-line py-1.5 pt-3'>
            <div>
              <div className='text-[13px] font-medium text-fg'>Cell imbalance</div>
              <div className='text-[11.5px] text-muted'>Cell 7 of Battery B drifts low.</div>
            </div>
            <AppSwitch checked={f.cellImbalance} onChange={(v) => sim.setFaults({ cellImbalance: v })} label='Simulate cell imbalance' tone='warning' />
          </div>
          {live.unserved > 0.05 && <p className='mt-2 text-[12px] text-danger'>Battery empty — {live.unserved.toFixed(1)} kW of demand unserved.</p>}
          <button type='button' onClick={() => sim.reset()} className='mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-accent-ink hover:text-fg'>
            <RotateCcw size={12} /> Reset all controls
          </button>
        </Card>
      </div>
    </div>
    </div>
  )
}
