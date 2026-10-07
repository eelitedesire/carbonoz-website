/**
 * Forecast and planning views of the demo model. The "forecast" runs the same
 * site model forward on forecast clouds and a smoothed load profile — so the
 * prediction is close to what later happens, but never identical.
 */
import {
  ambientC, Controls, Core, DAY, dayOf, DEFAULT_OVERRIDES, forecastCloud, forecastPvKwh,
  expectedLoadKwh, loadAt, NO_FAULTS, planTargetFor, simulate, tariffAt, type TariffBand,
  CAPACITY_KWH, forecastSurplusKwh, peakLoadKwh, solarShortfallKwh,
} from './model'

export type Weather = 'clear' | 'partly' | 'cloudy' | 'overcast'

export const weatherOf = (cloud: number): Weather => (cloud < 0.18 ? 'clear' : cloud < 0.38 ? 'partly' : cloud < 0.55 ? 'cloudy' : 'overcast')

export const WEATHER_LABEL: Record<Weather, string> = { clear: 'Clear', partly: 'Partly cloudy', cloudy: 'Cloudy', overcast: 'Overcast' }

/** Expected consumption: the profile without individual appliance runs. */
export function expectedLoad(t: number) {
  let s = 0
  for (let k = -3; k <= 3; k++) s += loadAt(t + k * 15)
  return s / 7
}

export interface ForecastPoint {
  t: number
  cloud: number
  weather: Weather
  tempC: number
  pv: number
  load: number
  soc: number
  battery: number
  grid: number
}

const cache = new Map<string, ForecastPoint[]>()

/** Hourly-ish forecast from `start` for `hours`, planned with controls `c`. */
export function horizon(start: Core, c: Controls, hours = 7 * 24, stepMin = 15): ForecastPoint[] {
  const hourStart = Math.floor(start.t / 60) * 60
  const key = `${hourStart}|${hours}|${stepMin}|${JSON.stringify(c)}`
  const hit = cache.get(key)
  if (hit) return hit
  const from = { ...start, t: hourStart }
  const { samples } = simulate(from, hours * 60, 5, c, DEFAULT_OVERRIDES, NO_FAULTS, stepMin, forecastCloud, expectedLoad)
  const out = samples.map((s) => {
    const cloud = forecastCloud(dayOf(s.t))
    return { t: s.t, cloud, weather: weatherOf(cloud), tempC: ambientC(s.t), pv: s.pv, load: s.load, soc: s.soc, battery: s.battery, grid: s.grid }
  })
  if (cache.size > 24) cache.clear()
  cache.set(key, out)
  return out
}

export interface DaySummary {
  day: number
  cloud: number
  weather: Weather
  pvKwh: number
  loadKwh: number
  tempHi: number
  tempLo: number
}

export function daySummary(day: number): DaySummary {
  const cloud = forecastCloud(day)
  let hi = -99
  let lo = 99
  for (let m = 0; m < DAY; m += 60) {
    const a = ambientC(day * DAY + m)
    hi = Math.max(hi, a)
    lo = Math.min(lo, a)
  }
  return { day, cloud, weather: weatherOf(cloud), pvKwh: forecastPvKwh(day), loadKwh: expectedLoadKwh(day), tempHi: hi, tempLo: lo }
}

/** Example tariff used only by the demo (relative units, not a real price list). */
export const EXAMPLE_TARIFF: Record<TariffBand, number> = { 'off-peak': 0.1, standard: 0.2, peak: 0.36 }
const EXPORT_RATE = 0.05

export interface StrategyOutcome {
  importKwh: number
  peakImportKwh: number
  exportKwh: number
  cost: number
  minSoc: number
}

function outcome(points: ForecastPoint[], stepMin: number): StrategyOutcome {
  const h = stepMin / 60
  let importKwh = 0
  let peakImportKwh = 0
  let exportKwh = 0
  let cost = 0
  let minSoc = 100
  for (const p of points) {
    const imp = Math.max(p.grid, 0) * h
    const exp = Math.max(-p.grid, 0) * h
    importKwh += imp
    exportKwh += exp
    if (tariffAt(p.t) === 'peak') peakImportKwh += imp
    cost += imp * EXAMPLE_TARIFF[tariffAt(p.t)] - exp * EXPORT_RATE
    minSoc = Math.min(minSoc, p.soc)
  }
  return { importKwh, peakImportKwh, exportKwh, cost, minSoc }
}

export interface Insight {
  /** Tomorrow's forecast solar vs today's, %. */
  solarDeltaPct: number
  today: DaySummary
  tomorrow: DaySummary
  week: DaySummary[]
  /** Next 7 days on the forecast: the Autopilot plan vs plain self-consumption. */
  planned: StrategyOutcome
  baseline: StrategyOutcome
  peakImportDeltaPct: number
  costDeltaPct: number
  strategy: { charge: string; discharge: string; overnight: string }
}

const pct = (a: number, b: number) => (Math.abs(b) > 0.01 ? ((a - b) / Math.abs(b)) * 100 : 0)

/**
 * What the intelligence layer would say about the coming week: the optimized
 * plan against a plain self-consumption baseline, on the same forecast.
 */
export function insight(now: Core, c: Controls): Insight {
  const day = dayOf(now.t)
  const hours = 7 * 24
  const planned = outcome(horizon(now, { ...c, gridStrategy: 'optimized', batteryMode: 'auto', peakShaving: true }, hours, 15), 15)
  const baseline = outcome(horizon(now, { ...c, gridStrategy: 'self-consumption', batteryMode: 'auto', peakShaving: false }, hours, 15), 15)
  const today = daySummary(day)
  const tomorrow = daySummary(day + 1)
  const ratio = tomorrow.pvKwh / tomorrow.loadKwh
  const target = planTargetFor(day + 1, c)
  return {
    solarDeltaPct: pct(tomorrow.pvKwh, today.pvKwh),
    today,
    tomorrow,
    week: Array.from({ length: 7 }, (_, k) => daySummary(day + k)),
    planned,
    baseline,
    peakImportDeltaPct: pct(planned.peakImportKwh, baseline.peakImportKwh),
    costDeltaPct: pct(planned.cost, baseline.cost),
    strategy: {
      charge: ratio > 1.3 ? 'Charge from solar surplus, late morning to early afternoon' : 'Charge from every solar surplus window',
      discharge: 'Discharge through the evening peak, 18:00–22:00',
      overnight: target == null ? 'No grid charging tonight — forecast surplus refills the battery' : `Off-peak top-up to ${target}% before sunrise`,
    },
  }
}

export interface DayPlan {
  day: DaySummary
  surplusKwh: number
  needKwh: number
  shortfallKwh: number
  target: number | null
  peakLoadKwh: number
  vsTodayPct: number
}

/** The planner's reasoning for one forecast day, step by step. */
export function dayPlan(day: number, today: number, c: Controls): DayPlan {
  const d = daySummary(day)
  return {
    day: d,
    surplusKwh: forecastSurplusKwh(day),
    needKwh: (CAPACITY_KWH * (c.targetSoc - c.reserveSoc)) / 100,
    shortfallKwh: solarShortfallKwh(day, c),
    target: planTargetFor(day, c),
    peakLoadKwh: peakLoadKwh(day),
    vsTodayPct: pct(d.pvKwh, forecastPvKwh(today)),
  }
}
