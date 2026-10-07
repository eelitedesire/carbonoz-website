/**
 * The single live simulation every demo on the site reads from, so the hero,
 * the SolarAutopilot app, SolarBMS cells and the control panel always show
 * the same system. A plain external store (useSyncExternalStore), ticking a
 * few times a second only while the page is visible.
 */
import {
  Controls, Core, DAY, dayOf, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, expectedLoadKwh, Faults, flows, Flows,
  forecastPvKwh, initialCore, minuteOf, NO_FAULTS, Overrides, planTargetFor, step, tariffAt,
} from './model'
import { Alarm, Inverter, inverters, Pack, packs, systemAlarms } from './telemetry'

export type EventSource = 'system' | 'autopilot' | 'bms' | 'inverter' | 'operator' | 'grid'

export interface SimEvent {
  id: number
  t: number
  level: 'info' | 'warning' | 'critical' | 'success'
  source: EventSource
  code: string
  message: string
}

export interface Snap {
  core: Core
  controls: Controls
  overrides: Overrides
  faults: Faults
  playing: boolean
  /** Time acceleration: simulated seconds per real second (60 = one simulated minute per second). */
  speed: number
  /** Increments whenever history/events change. */
  rev: number
}

export interface Derived {
  flows: Flows
  packs: Pack[]
  inverters: Inverter[]
  alarms: Alarm[]
}

/** History resolution: one sample per 5 simulated minutes. */
export const SAMPLE_MIN = 5
const HISTORY_DAYS = 7
/** Day 7, 08:40 — the demo opens as solar starts charging the battery, with a week of history behind it. */
export const START_T = HISTORY_DAYS * DAY + 8 * 60 + 40
// Two updates a second: numbers tween and particles animate in SVG, so motion stays smooth while React renders half as often.
const TICK_MS = 500

type Listener = () => void

const BATTERY_ON = 0.15
const GRID_ON = 0.12

class SimStore {
  snap: Snap
  readonly initial: Snap
  history: Core[] = []
  events: SimEvent[] = []
  private listeners = new Set<Listener>()
  private timer: ReturnType<typeof setInterval> | null = null
  private sinceSample = 0
  private eventId = 0
  private prevAlarms = new Set<string>()
  private batteryState: 'charging' | 'discharging' | 'idle' = 'idle'
  private gridState: 'import' | 'export' | 'idle' = 'idle'
  private derivedCache = new WeakMap<Snap, Derived>()

  constructor() {
    let core = initialCore(0)
    const quiet = START_T - DAY
    for (let t = 0; t < START_T; t += SAMPLE_MIN) {
      const next = step(core, SAMPLE_MIN, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, NO_FAULTS)
      if (t >= quiet) this.detect(core, next, DEFAULT_CONTROLS, NO_FAULTS)
      core = next
      this.history.push(core)
    }
    this.snap = { core, controls: DEFAULT_CONTROLS, overrides: DEFAULT_OVERRIDES, faults: NO_FAULTS, playing: true, speed: 60, rev: 0 }
    this.initial = this.snap
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  private emit(patch: Partial<Snap>) {
    this.snap = { ...this.snap, ...patch, rev: this.snap.rev + 1 }
    this.listeners.forEach((l) => l())
  }

  derived(s: Snap = this.snap): Derived {
    let d = this.derivedCache.get(s)
    if (!d) {
      const p = packs(s.core, s.faults)
      d = { flows: flows(s.core), packs: p, inverters: inverters(s.core, s.faults), alarms: systemAlarms(s.core, s.faults, p) }
      this.derivedCache.set(s, d)
    }
    return d
  }

  // ---------------------------------------------------------------- clock

  start() {
    if (this.timer || typeof window === 'undefined') return
    this.timer = setInterval(() => {
      if (document.visibilityState !== 'visible' || !this.snap.playing) return
      this.advance((this.snap.speed * TICK_MS) / 1000 / 60)
    }, TICK_MS)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Advance the live model by `minutes` simulated minutes. */
  advance(minutes: number) {
    const { controls, overrides, faults } = this.snap
    let core = this.snap.core
    let left = minutes
    while (left > 1e-9) {
      const dt = Math.min(1, left)
      const next = step(core, dt, controls, overrides, faults)
      this.detect(core, next, controls, faults)
      core = next
      left -= dt
      this.sinceSample += dt
      if (this.sinceSample >= SAMPLE_MIN) {
        this.sinceSample -= SAMPLE_MIN
        this.history.push(core)
        if (this.history.length > (HISTORY_DAYS + 2) * (DAY / SAMPLE_MIN)) this.history.splice(0, DAY / SAMPLE_MIN)
      }
    }
    this.emit({ core })
  }

  /** Jump forward to the next occurrence of `minuteOfDay` (the past never changes). */
  jumpTo(minuteOfDay: number) {
    const now = minuteOf(this.snap.core.t)
    let delta = minuteOfDay - now
    if (delta <= 0) delta += DAY
    this.advance(delta)
  }

  setPlaying(playing: boolean) {
    this.emit({ playing })
  }

  setSpeed(speed: number) {
    this.emit({ speed })
  }

  setOverrides(o: Partial<Overrides>) {
    this.emit({ overrides: { ...this.snap.overrides, ...o } })
  }

  setControls(c: Partial<Controls>, note?: string) {
    this.emit({ controls: { ...this.snap.controls, ...c } })
    if (note) this.log('info', 'operator', 'CONTROL', note)
    this.advance(0.01)
  }

  setFaults(f: Partial<Faults>) {
    const before = this.snap.faults
    this.emit({ faults: { ...before, ...f } })
    if (f.gridOutage !== undefined && f.gridOutage !== before.gridOutage)
      this.log(f.gridOutage ? 'critical' : 'success', 'grid', f.gridOutage ? 'GRID_LOST' : 'GRID_RESTORED', f.gridOutage ? 'Grid lost — inverters switched to island mode' : 'Grid restored — inverters resynchronised')
    this.advance(0.01)
  }

  reset() {
    this.emit({ controls: DEFAULT_CONTROLS, overrides: DEFAULT_OVERRIDES, faults: NO_FAULTS, speed: 60, playing: true })
  }

  // ---------------------------------------------------------------- events

  private log(level: SimEvent['level'], source: EventSource, code: string, message: string, t = this.snap?.core.t ?? 0) {
    this.events.unshift({ id: ++this.eventId, t, level, source, code, message })
    if (this.events.length > 80) this.events.length = 80
  }

  /** Turn state transitions into an event stream, as a real site would report them. */
  private detect(a: Core, b: Core, c: Controls, f: Faults) {
    const t = b.t
    if (a.pv < 0.1 && b.pv >= 0.1) this.log('info', 'inverter', 'PV_START', 'Solar production started', t)
    if (a.pv >= 0.1 && b.pv < 0.1) this.log('info', 'inverter', 'PV_STOP', 'Solar production ended for the day', t)

    const bs = b.battery > BATTERY_ON ? 'charging' : b.battery < -BATTERY_ON ? 'discharging' : Math.abs(b.battery) < 0.05 ? 'idle' : this.batteryState
    if (bs !== this.batteryState) {
      this.batteryState = bs
      const src = b.grid > 0.5 && bs === 'charging' ? ' from the grid (off-peak)' : bs === 'charging' ? ' from solar surplus' : ''
      this.log(bs === 'idle' ? 'info' : 'success', 'bms', `BATTERY_${bs.toUpperCase()}`, bs === 'idle' ? 'Battery idle' : `Battery ${bs}${src}`, t)
    }
    if (a.soc < c.targetSoc - 0.6 && b.soc >= c.targetSoc - 0.6) this.log('success', 'bms', 'SOC_TARGET', `Battery reached target SOC ${c.targetSoc}%`, t)
    if (a.soc > c.reserveSoc + 0.3 && b.soc <= c.reserveSoc + 0.3) this.log('warning', 'bms', 'SOC_RESERVE', `Battery at reserve ${c.reserveSoc}% — holding for backup`, t)

    const gs = b.grid > GRID_ON ? 'import' : b.grid < -GRID_ON ? 'export' : Math.abs(b.grid) < 0.05 ? 'idle' : this.gridState
    if (gs !== this.gridState && !f.gridOutage) {
      this.gridState = gs
      this.log(gs === 'import' ? 'warning' : 'info', 'grid', `GRID_${gs.toUpperCase()}`, gs === 'import' ? 'Grid import started' : gs === 'export' ? 'Exporting surplus solar to the grid' : 'Grid balanced — site self-sufficient', t)
    }

    const ta = tariffAt(a.t)
    const tb = tariffAt(t)
    if (ta !== tb) this.log('info', 'system', 'TARIFF', tb === 'peak' ? 'Peak tariff window started' : tb === 'off-peak' ? 'Off-peak tariff window started' : 'Standard tariff window', t)

    if (ta !== tb && tb === 'off-peak') {
      const day = dayOf(t + 6 * 60)
      const target = planTargetFor(day, c)
      const pv = forecastPvKwh(day).toFixed(0)
      const load = expectedLoadKwh(day).toFixed(0)
      this.log('info', 'autopilot', 'PLAN', target == null
        ? `Autopilot plan: no grid charging tonight — forecast ${pv} kWh solar vs ${load} kWh demand`
        : `Autopilot plan: off-peak top-up to ${target}% — forecast only ${pv} kWh solar vs ${load} kWh demand`, t)
    }

    const al = systemAlarms(b, f, packs(b, f))
    const keys = new Set(al.map((x) => `${x.device}:${x.code}`))
    for (const x of al) if (!this.prevAlarms.has(`${x.device}:${x.code}`) && x.code !== 'GRID_LOST') this.log(x.severity, x.device.startsWith('bms') ? 'bms' : 'system', x.code, x.message, t)
    for (const k of this.prevAlarms) if (!keys.has(k) && !k.endsWith('GRID_LOST')) this.log('success', 'bms', 'ALARM_CLEARED', `Cleared: ${k.split(':')[1].replace(/_/g, ' ').toLowerCase()} (${k.split(':')[0]})`, t)
    this.prevAlarms = keys
  }
}

export const sim = new SimStore()
