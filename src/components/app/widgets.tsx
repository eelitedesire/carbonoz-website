'use client'

import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, AudioLines, BatteryCharging, Bell, Cloud, CloudSun, Cpu, Gauge, Info, Send, Sparkles, Sun, Zap } from 'lucide-react'
import { FormEvent, useMemo, useRef, useState } from 'react'
import { q, shallow, useSim } from '@/sim/hooks'
import { sim } from '@/sim/store'
import { ambientC, dayOf, forecastPvKwh, minuteOf, tariffAt } from '@/sim/model'
import { daySummary, horizon, WEATHER_LABEL } from '@/sim/forecast'
import { decision } from '@/sim/decision'
import { clock } from '@/sim/telemetry'
import { AppButton, Card, cn, LinkButton, StatusBadge } from '@/components/homeos/ui'
import { PylonIcon } from '@/components/homeos/Glyphs'

const ago = (min: number) => (min < 1 ? 'just now' : min < 60 ? `${Math.round(min)} min ago` : `${Math.round(min / 60)} h ago`)

// ------------------------------------------------------------------ SolarAutopilot assistant

/** Best solar-surplus window in the next 12 h of the forecast, e.g. "11:30 – 14:00". */
function useBestWindow() {
  const core = useSim((x) => x.core, (a, b) => Math.floor(a.t / 60) === Math.floor(b.t / 60))
  const controls = useSim((x) => x.controls)
  return useMemo(() => {
    const f = horizon(core, controls, 24, 15).slice(0, 48)
    let best: [number, number] | null = null
    let run: number | null = null
    f.forEach((p, i) => {
      const surplus = p.pv - p.load > 1.2
      if (surplus && run == null) run = i
      if ((!surplus || i === f.length - 1) && run != null) {
        const end = surplus ? i : i - 1
        if (!best || end - run > best[1] - best[0]) best = [run, end]
        run = null
      }
    })
    return best ? `${clock(f[best[0]].t)} – ${clock(f[best[1]].t)}` : null
  }, [core, controls])
}

function answer(question: string) {
  const s = sim.snap
  const d = decision(s.core, s.controls, s.faults)
  const day = dayOf(s.core.t)
  const ql = question.toLowerCase()
  if (/tomorrow|forecast|weather/.test(ql)) {
    const t = daySummary(day + 1)
    return `Tomorrow's forecast: ${WEATHER_LABEL[t.weather].toLowerCase()}, about ${t.pvKwh.toFixed(0)} kWh of solar against ${t.loadKwh.toFixed(0)} kWh of expected demand.`
  }
  if (/tonight|plan|night|strategy/.test(ql)) return `${d.action}. ${d.reason} Next: ${d.next}.`
  if (/grid|import|export/.test(ql)) return s.faults.gridOutage ? 'The grid is unavailable; the inverters are running the site in island mode.' : s.core.grid > 0.05 ? `Importing ${s.core.grid.toFixed(1)} kW from the grid right now (${tariffAt(s.core.t)} tariff window).` : s.core.grid < -0.05 ? `Exporting ${Math.abs(s.core.grid).toFixed(1)} kW of surplus solar.` : 'The site is balanced — no grid exchange right now.'
  if (/battery|charg|soc/.test(ql)) return `Battery at ${s.core.soc.toFixed(0)}%, ${s.core.battery > 0.05 ? `charging ${s.core.battery.toFixed(1)} kW` : s.core.battery < -0.05 ? `discharging ${Math.abs(s.core.battery).toFixed(1)} kW` : 'idle'}. ${d.reason}`
  return 'In this demo I can answer about the battery, the grid, tonight’s plan and tomorrow’s forecast — all computed from the simulated site.'
}

const QUESTIONS = ['What’s the plan for tonight?', 'Why is the battery doing that?', 'How much solar tomorrow?']

export function AssistantCard({ className }: { className?: string }) {
  const s = useSim((x) => ({ pv: q(x.core.pv, 0.1), load: q(x.core.load, 0.1), soc: q(x.core.soc, 1), boosted: x.overrides.load > 1.2 }), shallow)
  const best = useBestWindow()
  const [dismissed, setDismissed] = useState(false)
  const [chat, setChat] = useState<{ q: string; a: string } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const surplus = s.pv - s.load
  const insight =
    surplus > 1.5 && s.soc > 85
      ? 'Solar production is high and the battery is nearly full. You can run high-power appliances now instead of exporting the surplus.'
      : surplus > 1
        ? `Solar surplus of ${surplus.toFixed(1)} kW is charging the battery (${s.soc}%).`
        : s.pv < 0.05
          ? 'No solar right now. The battery and the plan cover the evening and the night.'
          : 'Solar is covering most of the demand right now.'

  const ask = (text: string) => setChat({ q: text, a: answer(text) })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = input.current?.value.trim()
    if (v) ask(v)
    if (input.current) input.current.value = ''
  }
  const runNow = () => {
    sim.setOverrides({ load: 1.8 })
    sim.setControls({}, 'Appliance started on SolarAutopilot suggestion')
    setDismissed(true)
    // The appliance run lasts 45 s of real time, then demand returns to normal.
    setTimeout(() => sim.setOverrides({ load: 1 }), 45_000)
  }

  return (
    <Card className={cn('flex min-w-0 flex-col p-4', className)}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent-ink'>
            <Sparkles size={15} />
          </span>
          <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>SolarAutopilot</h3>
          <StatusBadge tone='info'>Concept</StatusBadge>
        </div>
        <AudioLines size={16} className='text-accent-ink' aria-hidden />
      </div>
      <div className='mt-3 rounded-xl border border-line bg-panel-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-fg-2'>{insight}</div>
      <AnimatePresence initial={false}>
        {!dismissed && best && !s.boosted && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
            <div className='mt-2.5 rounded-xl border border-line bg-panel-2 px-3.5 py-3'>
              <p className='flex items-center gap-1.5 text-[12.5px] font-medium text-fg'>
                <Zap size={13} className='text-accent-ink' /> Run a high-power appliance?
              </p>
              <p className='mt-1 text-[11.5px] text-muted'>Best time: {best} (solar surplus)</p>
              <div className='mt-2.5 grid grid-cols-2 gap-2'>
                <AppButton variant='primary' size='sm' className='px-2' onClick={runNow}>
                  Yes, run now
                </AppButton>
                <AppButton variant='outline' size='sm' className='px-2' onClick={() => setDismissed(true)}>
                  Maybe later
                </AppButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {s.boosted && <p className='mt-2.5 rounded-xl border border-batt/25 bg-batt/5 px-3.5 py-2.5 text-[12px] text-fg-2'>Appliance running — watch Home usage and the flow change.</p>}
      <AnimatePresence mode='wait'>
        {chat ? (
          <motion.div key={chat.q} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className='mt-2.5 space-y-2 text-[12px]'>
            <p className='ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-accent/15 px-3 py-2 text-fg'>{chat.q}</p>
            <p className='w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-line bg-panel-2 px-3 py-2 leading-relaxed text-fg-2'>{chat.a}</p>
          </motion.div>
        ) : (
          <motion.div key='chips' className='mt-2.5 flex flex-wrap gap-1.5'>
            {QUESTIONS.map((qq) => (
              <button key={qq} type='button' onClick={() => ask(qq)} className='rounded-full border border-line-strong px-2.5 py-1 text-[11px] text-fg-2 transition-colors hover:border-subtle hover:text-fg'>
                {qq}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className='min-h-3 flex-1' />
      <form onSubmit={submit} className='flex items-center gap-2 border-t border-line pt-3'>
        <input ref={input} aria-label='Ask SolarAutopilot' placeholder='Ask about your system…' className='min-w-0 flex-1 bg-transparent text-[12.5px] text-fg placeholder:text-subtle focus:outline-none' />
        <button type='submit' aria-label='Send' className='text-accent-ink hover:text-fg'>
          <Send size={16} />
        </button>
      </form>
    </Card>
  )
}

// ------------------------------------------------------------------ devices

export function DevicesStatus({ className, onViewAll }: { className?: string; onViewAll?: () => void }) {
  const rows = useSim(
    (x, d) => {
      const dv = d()
      return [
        ...dv.inverters.map((i) => ({ icon: 'cpu', name: i.name, sub: `Hybrid · ${i.id}`, status: i.status === 'Island mode' ? 'Island' : i.status === 'Standby' ? 'Standby' : 'Online', tone: i.status === 'Island mode' ? 'warn' : i.status === 'Standby' ? 'idle' : 'ok' })),
        ...dv.packs.map((p) => ({ icon: 'batt', name: p.name, sub: `LFP 16S · ${p.soc.toFixed(0)}%`, status: p.alarms.length ? 'Alarm' : 'Online', tone: p.alarms.length ? 'warn' : 'ok' })),
        { icon: 'gauge', name: 'SolarBMS gateway', sub: 'Raspberry Pi · sbms-demo-01', status: 'Online', tone: 'ok' },
        { icon: 'grid', name: 'Grid measurement', sub: 'Import / export', status: x.faults.gridOutage ? 'Offline' : 'Online', tone: x.faults.gridOutage ? 'bad' : 'ok' },
      ]
    },
    (a, b) => a.map((r) => r.status + r.sub).join() === b.map((r) => r.status + r.sub).join(),
  )
  const ICON = { cpu: <Cpu size={16} />, batt: <BatteryCharging size={16} />, gauge: <Gauge size={16} />, grid: <PylonIcon size={16} strokeWidth={1.5} /> }
  return (
    <Card className={cn('p-4', className)}>
      <div className='flex items-center justify-between'>
        <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>Devices Status</h3>
        <LinkButton onClick={onViewAll}>View all</LinkButton>
      </div>
      <ul className='mt-3 space-y-1'>
        {rows.map((r) => (
          <li key={r.name} className='flex items-center gap-3 rounded-lg px-1 py-1.5'>
            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-panel-3 text-fg-2'>{ICON[r.icon as keyof typeof ICON]}</span>
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-[13px] font-medium text-fg'>{r.name}</span>
              <span className='block truncate text-[11.5px] text-muted'>{r.sub}</span>
            </span>
            <span className={cn('text-[12px] font-medium', r.tone === 'ok' ? 'text-batt' : r.tone === 'warn' ? 'text-gridp' : r.tone === 'bad' ? 'text-danger' : 'text-muted')}>{r.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// ------------------------------------------------------------------ alerts

export function AlertsCard({ className, onViewAll }: { className?: string; onViewAll?: () => void }) {
  const core = useSim((x) => x.core, (a, b) => Math.floor(a.t / 5) === Math.floor(b.t / 5))
  const controls = useSim((x) => x.controls)
  const alarms = useSim((_, d) => d().alarms.filter((a) => a.severity !== 'info'), (a, b) => a.map((x) => x.code + x.device).join() === b.map((x) => x.code + x.device).join())
  const rev = useSim((x) => Math.floor(x.rev / 20))
  const items = useMemo(() => {
    void rev
    const out: { key: string; tone: 'info' | 'warn' | 'bad'; text: string; sub?: string; when: string }[] = []
    for (const a of alarms) out.push({ key: a.code + a.device, tone: a.severity === 'critical' ? 'bad' : 'warn', text: a.message, sub: a.device, when: 'now' })
    // Predicted: when the battery reaches its reserve, from the forecast.
    const f = horizon(core, controls, 18, 15)
    const hit = f.find((p) => p.soc <= controls.reserveSoc + 0.5 && p.battery <= 0)
    if (hit && core.soc > controls.reserveSoc + 1) out.push({ key: 'reserve', tone: 'info', text: `Battery will reach ${controls.reserveSoc}% at ${clock(hit.t)}`, sub: 'Forecast', when: ago(0) })
    if (minuteOf(core.t) < 18 * 60) out.push({ key: 'peak', tone: 'info', text: 'Peak tariff window starts at 18:00', sub: 'Example tariff', when: 'today' })
    for (const e of sim.events.filter((e) => e.level === 'warning' || e.level === 'critical').slice(0, 2)) out.push({ key: `e${e.id}`, tone: e.level === 'critical' ? 'bad' : 'warn', text: e.message, when: ago(core.t - e.t) })
    return out.slice(0, 4)
  }, [alarms, core, controls, rev])
  return (
    <Card className={cn('p-4', className)}>
      <div className='flex items-center justify-between'>
        <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>Alerts</h3>
        <LinkButton onClick={onViewAll}>View all</LinkButton>
      </div>
      <ul className='mt-3 space-y-3' aria-live='polite'>
        {items.map((it) => (
          <li key={it.key} className='flex items-start gap-3'>
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full', it.tone === 'bad' ? 'bg-danger/15 text-danger' : it.tone === 'warn' ? 'bg-gridp/15 text-gridp' : 'bg-accent/15 text-accent-ink')}>
              {it.tone === 'info' ? <Info size={15} /> : it.tone === 'warn' ? <AlertTriangle size={15} /> : <Bell size={15} />}
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-[12.5px] leading-snug text-fg'>{it.text}</span>
              {it.sub && <span className='block text-[11px] text-muted'>{it.sub}</span>}
            </span>
            <span className='shrink-0 text-[11px] text-muted'>{it.when}</span>
          </li>
        ))}
        {!items.length && <li className='text-[12.5px] text-muted'>No alerts. Everything is running smoothly.</li>}
      </ul>
    </Card>
  )
}

// ------------------------------------------------------------------ weather

export function WeatherCard({ className }: { className?: string }) {
  const w = useSim((x) => {
    const day = dayOf(x.core.t)
    const s = daySummary(day)
    return { temp: Math.round(ambientC(x.core.t)), weather: s.weather, cloud: Math.round(s.cloud * 100), today: Math.round(forecastPvKwh(day)), tomorrow: Math.round(forecastPvKwh(day + 1)), night: x.core.pv < 0.02 }
  }, shallow)
  const Icon = w.weather === 'clear' ? (w.night ? Cloud : Sun) : w.weather === 'partly' ? CloudSun : Cloud
  return (
    <Card className={cn('p-4', className)}>
      <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-fg'>Weather</h3>
      <p className='text-[12px] text-muted'>Demo site · forecast</p>
      <div className='mt-4 flex items-center gap-4'>
        <Icon size={58} strokeWidth={1.3} className={w.weather === 'clear' && !w.night ? 'text-solar' : 'text-fg-2'} aria-hidden />
        <div>
          <p className='tabular text-[34px] font-semibold leading-none tracking-[-0.03em] text-fg'>
            {w.temp}
            <span className='text-accent-ink'>°C</span>
          </p>
          <p className='mt-1 text-[15px] text-fg-2'>{WEATHER_LABEL[w.weather]}</p>
        </div>
      </div>
      <dl className='mt-5 grid grid-cols-3 gap-3 text-[12px]'>
        <div>
          <dt className='text-muted'>Cloud</dt>
          <dd className='tabular mt-0.5 text-[15px] font-semibold text-fg'>{w.cloud}%</dd>
        </div>
        <div>
          <dt className='text-muted'>Solar today</dt>
          <dd className='tabular mt-0.5 text-[15px] font-semibold text-fg'>{w.today} kWh</dd>
        </div>
        <div>
          <dt className='text-muted'>Tomorrow</dt>
          <dd className='tabular mt-0.5 text-[15px] font-semibold text-fg'>{w.tomorrow} kWh</dd>
        </div>
      </dl>
    </Card>
  )
}
