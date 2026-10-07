'use client'

import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { motion } from 'motion/react'
import { Activity, BrainCircuit, Cloud, CloudSun, ShieldCheck, Sun, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Live } from '@/components/ui/Live'
import { Badge, cx, SectionHeader, StatusTag, Switch } from '@/components/ui/primitives'
import { useSim } from '@/sim/hooks'
import { sim } from '@/sim/store'
import { dayOf } from '@/sim/model'
import { dayPlan, insight, Weather } from '@/sim/forecast'
import { dayName } from '@/sim/format'
import { pad } from '@/sim/telemetry'

export const WeatherIcon = ({ w, className }: { w: Weather; className?: string }) => {
  const I = w === 'clear' ? Sun : w === 'partly' ? CloudSun : Cloud
  return <I size={16} className={cx(w === 'clear' ? 'text-solar' : w === 'partly' ? 'text-solar/80' : 'text-muted', className)} aria-hidden />
}

const sign = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v).toFixed(0)}%`

export function Intelligence({ index = '09' }: { index?: string }) {
  const reduced = useReducedMotion()
  const core = useSim((x) => x.core, (a, b) => Math.floor(a.t / 60) === Math.floor(b.t / 60))
  const controls = useSim((x) => x.controls)
  const today = dayOf(core.t)
  const [pick, setPick] = useState(1)
  const ins = useMemo(() => insight(core, controls), [core, controls])
  const plan = useMemo(() => dayPlan(today + pick, today, controls), [today, pick, controls])

  const anomaly = useSim((x, d) => {
    const p = d().packs.reduce((a, b) => (b.spreadMv > a.spreadMv ? b : a))
    return { spread: Math.round(p.spreadMv), pack: p.name, cell: p.minCell.id, dev: Math.round((p.minCell.voltage - p.avgCell) * 1000), on: x.faults.cellImbalance, alarms: d().alarms.filter((a) => a.severity !== 'info').length }
  }, (a, b) => a.spread === b.spread && a.on === b.on && a.alarms === b.alarms && a.dev === b.dev)

  const steps = [
    { k: 'Forecast received', v: `${plan.day.pvKwh.toFixed(1)} kWh solar on ${dayName(plan.day.day)} (${sign(plan.vsTodayPct)} vs today)` },
    { k: 'Surplus estimated', v: `${plan.surplusKwh.toFixed(1)} kWh left after daytime demand` },
    { k: 'Battery requirement', v: `${plan.needKwh.toFixed(1)} kWh to go from ${controls.reserveSoc}% to ${controls.targetSoc}%` },
    { k: plan.shortfallKwh >= 1 ? 'Shortfall' : 'Covered', v: plan.shortfallKwh >= 1 ? `${plan.shortfallKwh.toFixed(1)} kWh the sun will not provide` : 'Solar surplus refills the battery' },
    { k: 'Decision', v: plan.target == null ? 'No grid charging the night before. Charge from surplus; discharge through 18:00–22:00.' : `Off-peak top-up to ${plan.target}% the night before; hold charge from 15:00 for the ${plan.peakLoadKwh.toFixed(1)} kWh evening peak.` },
  ]

  return (
    <section id='intelligence' aria-labelledby='ai-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div aria-hidden className='pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(700px_320px_at_70%_0%,rgba(92,225,230,0.06),transparent)]' />
      <div className='container-x relative'>
        <SectionHeader
          index={index}
          kicker='Energy intelligence'
          id='ai-title'
          title={<>The system notices. Then it plans.</>}
          lede='Forecasts, measured history and the battery’s own limits, combined into a plan you can read. Every number here is computed by the demo model from its forecast — none of it is a customer result.'
          aside={<div className='mt-5'><StatusTag status='concept' /></div>}
        />

        <Live className='homeos mt-14 grid gap-4 lg:grid-cols-12'>
          {/* headline insight */}
          <div className='panel p-6 sm:p-8 lg:col-span-7'>
            <div className='flex items-center gap-2 text-ai'>
              <BrainCircuit size={16} />
              <span className='label text-[10px]'>Insight · {dayName(today)} {pad(Math.floor((core.t % 1440) / 60))}:00</span>
            </div>
            <p className='mt-5 text-[clamp(1.35rem,2.4vw,2rem)] font-medium leading-[1.2] tracking-[-0.03em] text-fg'>
              CARBONOZ expects {ins.solarDeltaPct >= 0 ? 'more' : 'less'} solar tomorrow: <span className={ins.solarDeltaPct >= 0 ? 'text-solar' : 'text-grid'}>{sign(ins.solarDeltaPct)}</span> against today.
            </p>
            <div className='mt-8 grid gap-px overflow-hidden rounded-[8px] border border-line bg-line sm:grid-cols-3'>
              <div className='bg-ink-900 p-4'>
                <p className='text-[11.5px] text-muted'>Forecast · solar tomorrow</p>
                <p className='num mt-1 text-[24px] text-fg'>{ins.tomorrow.pvKwh.toFixed(1)} <span className='text-[12px] text-muted'>kWh</span></p>
                <p className='text-[11.5px] text-muted'>{sign(ins.solarDeltaPct)} vs today</p>
              </div>
              <div className='bg-ink-900 p-4'>
                <p className='text-[11.5px] text-muted'>Peak-tariff import · 7 days</p>
                <p className='num mt-1 text-[24px] text-fg'>{sign(ins.peakImportDeltaPct)}</p>
                <p className='num text-[11.5px] text-muted'>{ins.planned.peakImportKwh.toFixed(1)} vs {ins.baseline.peakImportKwh.toFixed(1)} kWh</p>
              </div>
              <div className='bg-ink-900 p-4'>
                <p className='text-[11.5px] text-muted'>Energy cost index · 7 days</p>
                <p className='num mt-1 text-[24px] text-fg'>{sign(ins.costDeltaPct)}</p>
                <p className='text-[11.5px] text-muted'>Example tariff, vs self-consumption</p>
              </div>
            </div>
            <div className='mt-6 grid gap-2 text-[14px]'>
              {[
                ['Charge', ins.strategy.charge],
                ['Discharge', ins.strategy.discharge],
                ['Overnight', ins.strategy.overnight],
              ].map(([k, v]) => (
                <div key={k} className='flex gap-4 border-b border-line pb-2 last:border-0'>
                  <span className='label w-24 shrink-0 pt-1 text-[10px] text-subtle'>{k}</span>
                  <span className='text-fg-2'>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* anomaly + health */}
          <div className='grid content-start gap-4 lg:col-span-5'>
            <div className='panel p-5'>
              <div className='flex items-center justify-between'>
                <p className='flex items-center gap-2 text-[14px] font-medium text-fg'>
                  <Activity size={15} className='text-ai' /> Anomaly detection
                </p>
                <Switch checked={anomaly.on} onChange={(v) => sim.setFaults({ cellImbalance: v })} label='Inject a weak cell' tint='bg-warn' />
              </div>
              {anomaly.spread > 30 ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='mt-4 rounded-[7px] border border-warn/30 bg-warn/[0.06] p-3.5'>
                  <p className='flex items-center gap-2 text-[13.5px] text-warn'>
                    <TriangleAlert size={14} /> Cell {pad(anomaly.cell)} in {anomaly.pack} is drifting low
                  </p>
                  <p className='num mt-1 text-[12px] text-fg-2'>
                    {anomaly.dev} mV from the pack average · spread {anomaly.spread} mV
                  </p>
                  <p className='mt-2 text-[12px] text-muted'>Suggested: check balancing and the cell connection at the next service visit.</p>
                </motion.div>
              ) : (
                <p className='mt-4 text-[13px] text-muted'>
                  Largest cell spread across all packs: <span className='num text-fg'>{anomaly.spread} mV</span>. Switch on the weak-cell scenario to see how a drifting cell is flagged.
                </p>
              )}
            </div>
            <div className='panel p-5'>
              <p className='flex items-center gap-2 text-[14px] font-medium text-fg'>
                <ShieldCheck size={15} className='text-ok' /> System health
              </p>
              <ul className='mt-3 grid gap-1.5 text-[13px]'>
                {[
                  ['Data freshness', 'Reading 15 s ago', true],
                  ['BMS alarms', anomaly.alarms ? `${anomaly.alarms} active` : 'None active', !anomaly.alarms],
                  ['Cell balance', `${anomaly.spread} mV spread`, anomaly.spread <= 30],
                  ['Forecast', 'Received for 7 days', true],
                ].map(([k, v, ok]) => (
                  <li key={k as string} className='flex items-center justify-between border-b border-line py-1.5 last:border-0'>
                    <span className='text-muted'>{k}</span>
                    <Badge tone={ok ? 'ok' : 'warn'}>{v as string}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* planner reasoning */}
          <div className='panel p-5 sm:p-6 lg:col-span-12'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <p className='text-[14px] font-medium text-fg'>Plan a day</p>
              <div className='scroll-x -mx-1 px-1'>
                <div className='flex gap-1.5' role='radiogroup' aria-label='Forecast day'>
                  {ins.week.slice(1).map((d, i) => (
                    <button
                      key={d.day}
                      type='button'
                      role='radio'
                      aria-checked={pick === i + 1}
                      onClick={() => setPick(i + 1)}
                      className={cx('flex w-[78px] shrink-0 flex-col items-center gap-1 rounded-[7px] border py-2 transition-colors', pick === i + 1 ? 'border-ai/50 bg-ai/[0.06]' : 'border-line hover:border-line-strong')}
                    >
                      <span className='text-[11.5px] text-muted'>{i === 0 ? 'Tomorrow' : dayName(d.day)}</span>
                      <WeatherIcon w={d.weather} />
                      <span className='num text-[12px] text-fg'>{d.pvKwh.toFixed(0)} kWh</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ol key={pick} className='mt-6 grid gap-3 md:grid-cols-5'>
              {steps.map((s, i) => (
                <motion.li
                  key={s.k}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.12, duration: 0.4 }}
                  className={cx('relative rounded-[8px] border p-4', i === steps.length - 1 ? 'border-ai/40 bg-ai/[0.05]' : 'border-line bg-ink-950')}
                >
                  <p className='num text-[10.5px] text-subtle'>{String(i + 1).padStart(2, '0')}</p>
                  <p className={cx('mt-1 text-[13px] font-medium', i === steps.length - 1 ? 'text-ai' : 'text-fg')}>{s.k}</p>
                  <p className='mt-1.5 text-[12.5px] leading-relaxed text-fg-2'>{s.v}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </Live>
      </div>
    </section>
  )
}
