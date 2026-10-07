/**
 * CARBONOZ demo energy model.
 *
 * A deterministic, physically plausible simulation of one solar + storage
 * site. Every value on the website's product demos comes from here; nothing
 * is random per frame. Same time + same controls → same numbers.
 *
 * Sign convention (identical to the CARBONOZ platform, see
 * login.carbonoz.com/docs/solarbms-ingestion.md):
 *   battery  > 0  charging,   < 0 discharging
 *   grid     > 0  importing,  < 0 exporting
 * All power in kW, energy in kWh, time in minutes since sim epoch.
 */

export const DAY = 1440

/** The simulated demo site. Values are illustrative, not a real installation. */
export const SITE = {
  name: 'Demo site',
  pvKwp: 7.8,
  /** Real-world derate (soiling, temperature, wiring). */
  pvDerate: 0.84,
  sunrise: 6 * 60 + 5,
  sunset: 18 * 60 + 10,
  packs: 3,
  cellsPerPack: 16,
  packKwh: 5.12,
  maxChargeKw: 5,
  maxDischargeKw: 6,
  gridChargeKw: 3,
  inverters: 2,
  inverterKw: 5,
  efficiency: 0.95,
  nominalPackV: 51.2,
} as const

export const CAPACITY_KWH = SITE.packs * SITE.packKwh

export type BatteryMode = 'auto' | 'hold' | 'backup'
export type GridStrategy = 'optimized' | 'self-consumption'
export type SolarPriority = 'self-consumption' | 'export-first'

export interface Controls {
  batteryMode: BatteryMode
  gridStrategy: GridStrategy
  solarPriority: SolarPriority
  peakShaving: boolean
  peakLimitKw: number
  reserveSoc: number
  targetSoc: number
  exportLimitKw: number
}

export const DEFAULT_CONTROLS: Controls = {
  batteryMode: 'auto',
  gridStrategy: 'optimized',
  solarPriority: 'self-consumption',
  peakShaving: true,
  peakLimitKw: 3.5,
  reserveSoc: 20,
  targetSoc: 95,
  exportLimitKw: 5,
}

/** Visitor-driven what-ifs (hero sliders, scenario buttons). 1 = model as-is. */
export interface Overrides {
  sun: number
  load: number
}

export const DEFAULT_OVERRIDES: Overrides = { sun: 1, load: 1 }

export interface Faults {
  /** Cell 07 of pack B drifts low: exercises SolarBMS spread alarms. */
  cellImbalance: boolean
  /** Grid unavailable: the battery carries the site alone. */
  gridOutage: boolean
}

export const NO_FAULTS: Faults = { cellImbalance: false, gridOutage: false }

/** Core state. Everything else (cells, inverters, alarms) is derived from it. */
export interface Core {
  t: number
  soc: number
  tempC: number
  pv: number
  load: number
  battery: number
  grid: number
  curtailed: number
  unserved: number
  /** SOC target the planner is charging towards from the grid (off-peak), or null. */
  planTarget: number | null
}

// ------------------------------------------------------------------
// Deterministic noise
// ------------------------------------------------------------------

function hash(n: number) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967295
}

/** Smooth value noise in [0, 1]. */
export function noise(x: number, seed: number) {
  const i = Math.floor(x)
  const f = x - i
  const a = hash(i * 374761 + seed * 668265)
  const b = hash((i + 1) * 374761 + seed * 668265)
  const u = (1 - Math.cos(f * Math.PI)) / 2
  return a + (b - a) * u
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const dayOf = (t: number) => Math.floor(t / DAY)
export const minuteOf = (t: number) => ((t % DAY) + DAY) % DAY

// ------------------------------------------------------------------
// Weather
// ------------------------------------------------------------------

/** Cloud cover of a day, 0 (clear) … 1 (overcast). A week-long pattern that repeats with variation. */
export function dayCloud(day: number) {
  const pattern = [0.12, 0.22, 0.72, 0.3, 0.08, 0.48, 0.18]
  return clamp(pattern[((day % 7) + 7) % 7] + (hash(day * 31) - 0.5) * 0.12, 0, 0.9)
}

/** What a forecast provider would have predicted: close to the real day, never identical. */
export function forecastCloud(day: number) {
  return clamp(dayCloud(day) + (hash(day * 97 + 5) - 0.5) * 0.14, 0, 0.92)
}

export function sunElevation(m: number) {
  if (m <= SITE.sunrise || m >= SITE.sunset) return 0
  return Math.sin((Math.PI * (m - SITE.sunrise)) / (SITE.sunset - SITE.sunrise))
}

/** Fraction of clear-sky output that gets through passing clouds at time t. */
export function cloudTransmission(t: number, cloud: number) {
  const passing = noise(t / 38, dayOf(t) + 11) * 0.7 + noise(t / 9, dayOf(t) + 3) * 0.3
  return clamp(1 - cloud * (0.25 + 0.95 * passing), 0.08, 1)
}

export function ambientC(t: number) {
  const m = minuteOf(t)
  const diurnal = Math.sin((Math.PI * 2 * (m - 9 * 60)) / DAY)
  return 19.5 + 5.5 * diurnal - dayCloud(dayOf(t)) * 2 + (noise(t / 90, 7) - 0.5)
}

export function pvPotential(t: number, cloud = dayCloud(dayOf(t))) {
  const e = sunElevation(minuteOf(t))
  if (e <= 0) return 0
  return SITE.pvKwp * SITE.pvDerate * Math.pow(e, 1.22) * cloudTransmission(t, cloud)
}

// ------------------------------------------------------------------
// Consumption
// ------------------------------------------------------------------

const gauss = (m: number, mu: number, sigma: number) => Math.exp(-((m - mu) ** 2) / (2 * sigma * sigma))

/** Appliance runs per day: [start minute, duration, kW]. Shifted a little each day. */
function appliances(day: number): [number, number, number][] {
  const j = (k: number, span: number) => Math.round((hash(day * 13 + k) - 0.5) * span)
  return [
    [7 * 60 + 12 + j(1, 20), 6, 2.0],
    [12 * 60 + 25 + j(2, 40), 28, 2.2],
    [15 * 60 + 40 + j(3, 60), 45, 1.1],
    [19 * 60 + 5 + j(4, 30), 42, 2.4],
    [21 * 60 + 10 + j(5, 40), 30, 1.2],
  ]
}

export function loadAt(t: number) {
  const m = minuteOf(t)
  const d = dayOf(t)
  let kw = 0.55
  kw += 1.15 * gauss(m, 7 * 60, 55)
  kw += 0.9 * gauss(m, 13 * 60, 150)
  kw += 2.4 * gauss(m, 19 * 60 + 40, 90)
  kw += (noise(t / 14, 21) - 0.5) * 0.5
  for (const [start, dur, p] of appliances(d)) if (m >= start && m < start + dur) kw += p
  return Math.max(0.25, kw)
}

// ------------------------------------------------------------------
// Tariff (example bands, for the planner and peak shaving)
// ------------------------------------------------------------------

export type TariffBand = 'off-peak' | 'standard' | 'peak'

export function tariffAt(t: number): TariffBand {
  const m = minuteOf(t)
  if (m < 6 * 60) return 'off-peak'
  if (m >= 18 * 60 && m < 22 * 60) return 'peak'
  return 'standard'
}

// ------------------------------------------------------------------
// Planner: the SolarAutopilot strategy (concept)
// ------------------------------------------------------------------

const memo = <T,>(fn: (day: number) => T) => {
  const cache = new Map<number, T>()
  return (day: number) => {
    let v = cache.get(day)
    if (v === undefined) {
      v = fn(day)
      if (cache.size > 64) cache.clear()
      cache.set(day, v)
    }
    return v
  }
}

/** Expected solar energy of a day from the forecast, kWh. */
export const forecastPvKwh = memo((day: number) => {
  let e = 0
  for (let m = SITE.sunrise; m < SITE.sunset; m += 15) e += (pvPotential(day * DAY + m, forecastCloud(day)) * 15) / 60
  return e
})

/** Solar energy the day actually delivers under its real clouds (before curtailment), kWh. */
export const actualPvKwh = memo((day: number) => {
  let e = 0
  for (let m = SITE.sunrise; m < SITE.sunset; m += 15) e += (pvPotential(day * DAY + m) * 15) / 60
  return e
})

/** Typical daily consumption, kWh. */
export const expectedLoadKwh = memo((day: number) => {
  let e = 0
  for (let m = 0; m < DAY; m += 15) e += (loadAt(day * DAY + m) * 15) / 60
  return e
})

/** Forecast solar energy left over after daytime consumption, kWh. */
export const forecastSurplusKwh = memo((day: number) => {
  let e = 0
  for (let m = SITE.sunrise; m < SITE.sunset; m += 15) {
    const t = day * DAY + m
    e += (Math.max(0, pvPotential(t, forecastCloud(day)) - loadAt(t)) * 15) / 60
  }
  return e
})

/** Expected consumption inside the evening peak window, kWh. */
export const peakLoadKwh = memo((day: number) => {
  let e = 0
  for (let m = 18 * 60; m < 22 * 60; m += 15) e += (loadAt(day * DAY + m) * 15) / 60
  return e
})

/** Energy (kWh) by which the forecast surplus falls short of refilling the battery from reserve to target. */
export function solarShortfallKwh(day: number, c: Controls) {
  const need = (CAPACITY_KWH * (c.targetSoc - c.reserveSoc)) / 100
  return Math.max(0, need - forecastSurplusKwh(day) * SITE.efficiency)
}

/**
 * Overnight grid-charge target for the coming day: only when the forecast
 * surplus will not refill the battery before the evening peak.
 */
export function planTargetFor(day: number, c: Controls) {
  if (c.gridStrategy !== 'optimized' || c.batteryMode === 'hold') return null
  const short = solarShortfallKwh(day, c)
  if (short < 1) return null
  return Math.round(Math.min(80, c.reserveSoc + (short / CAPACITY_KWH) * 100))
}

/** SOC held back in the late afternoon so the battery's energy is spent inside the evening peak. */
export function peakReserveFor(day: number, c: Controls) {
  return Math.min(c.targetSoc - 5, c.reserveSoc + (peakLoadKwh(day) / CAPACITY_KWH) * 100)
}

// ------------------------------------------------------------------
// One step of the site
// ------------------------------------------------------------------

/** Charge acceptance tapers near full, like a real LFP pack in CV phase. */
function chargeAcceptKw(soc: number, target: number) {
  if (soc >= target) return 0
  const taper = soc < 90 ? 1 : clamp(1 - (soc - 90) / 12, 0.2, 1)
  return SITE.maxChargeKw * taper
}

export function initialCore(t: number): Core {
  return { t, soc: 46, tempC: 22, pv: 0, load: loadAt(t), battery: 0, grid: 0, curtailed: 0, unserved: 0, planTarget: null }
}

export type CloudFn = (day: number) => number
export type LoadFn = (t: number) => number

export function step(prev: Core, dt: number, c: Controls, o: Overrides, f: Faults, cloud: CloudFn = dayCloud, loadFn: LoadFn = loadAt): Core {
  const t = prev.t + dt
  const pvAvail = pvPotential(t, cloud(dayOf(t))) * o.sun
  const load = loadFn(t) * o.load
  const gridUp = !f.gridOutage
  const reserve = f.gridOutage ? 5 : c.batteryMode === 'backup' ? Math.max(c.reserveSoc, 60) : c.reserveSoc
  const soc = prev.soc
  const accept = c.batteryMode === 'hold' && gridUp ? 0 : chargeAcceptKw(soc, c.targetSoc)
  const canDischarge = (c.batteryMode === 'hold' && gridUp) || soc <= reserve ? 0 : SITE.maxDischargeKw

  let battery = 0
  let grid = 0
  let curtailed = 0
  let unserved = 0
  const net = pvAvail - load

  if (net >= 0) {
    if (c.solarPriority === 'export-first' && gridUp) {
      const exp = Math.min(net, c.exportLimitKw)
      battery = Math.min(net - exp, accept)
      grid = -exp
      curtailed = net - exp - battery
    } else {
      battery = Math.min(net, accept)
      const rest = net - battery
      const exp = gridUp ? Math.min(rest, c.exportLimitKw) : 0
      grid = -exp
      curtailed = rest - exp
    }
  } else {
    const deficit = -net
    const dis = Math.min(deficit, canDischarge)
    battery = -dis
    if (gridUp) grid = deficit - dis
    else unserved = deficit - dis
  }

  // Off-peak: keep the battery for the evening peak and top it up to the plan target.
  const planTarget = tariffAt(t) === 'off-peak' ? planTargetFor(dayOf(t + 6 * 60), c) : null
  if (gridUp && planTarget != null) {
    if (battery < 0 && soc <= planTarget + 15) {
      grid += -battery
      battery = 0
    }
    if (soc < planTarget) {
      const extra = Math.max(0, Math.min(SITE.gridChargeKw, chargeAcceptKw(soc, planTarget) - Math.max(battery, 0)))
      battery += extra
      grid += extra
    }
  }

  // Late afternoon: once solar can no longer refill the battery, save its charge for the peak window.
  if (gridUp && c.gridStrategy === 'optimized' && c.batteryMode !== 'hold' && minuteOf(t) >= 15 * 60 && minuteOf(t) < 18 * 60 && battery < 0) {
    const keep = peakReserveFor(dayOf(t), c)
    if (soc <= keep) {
      grid += -battery
      battery = 0
    }
  }

  // Peak shaving: cap grid import with the battery, down to an emergency floor.
  if (c.peakShaving && gridUp && grid > c.peakLimitKw && soc > 8) {
    const room = SITE.maxDischargeKw + Math.min(battery, 0)
    const add = Math.min(grid - c.peakLimitKw, room)
    battery -= add
    grid -= add
  }

  const kwh = (battery * dt) / 60
  const nextSoc = clamp(soc + ((kwh > 0 ? kwh * SITE.efficiency : kwh / SITE.efficiency) / CAPACITY_KWH) * 100, 0, 100)

  const amps = Math.abs((battery * 1000) / SITE.nominalPackV / SITE.packs)
  const heatTarget = ambientC(t) + 1.2 + amps * amps * 0.0016
  const tempC = prev.tempC + (heatTarget - prev.tempC) * (1 - Math.exp(-dt / 55))

  return { t, soc: nextSoc, tempC, pv: pvAvail - curtailed, load, battery, grid, curtailed, unserved, planTarget }
}

/** Run the model from `from` for `minutes`, sampling every `sampleEvery` minutes. */
export function simulate(start: Core, minutes: number, dt: number, c: Controls, o: Overrides, f: Faults, sampleEvery = dt, cloud: CloudFn = dayCloud, loadFn: LoadFn = loadAt) {
  const out: Core[] = []
  let s = start
  let acc = 0
  for (let k = 0; k < minutes; k += dt) {
    s = step(s, dt, c, o, f, cloud, loadFn)
    acc += dt
    if (acc >= sampleEvery - 1e-9) {
      out.push(s)
      acc = 0
    }
  }
  return { end: s, samples: out }
}

// ------------------------------------------------------------------
// Energy flow split (source → destination)
// ------------------------------------------------------------------

export interface Flows {
  solarHome: number
  solarBattery: number
  solarGrid: number
  gridHome: number
  gridBattery: number
  batteryHome: number
  batteryGrid: number
}

export function flows(s: Pick<Core, 'pv' | 'load' | 'battery' | 'grid'>): Flows {
  const charge = Math.max(s.battery, 0)
  const discharge = Math.max(-s.battery, 0)
  const imp = Math.max(s.grid, 0)
  const exp = Math.max(-s.grid, 0)
  const solarHome = Math.min(s.pv, s.load)
  let pvLeft = s.pv - solarHome
  let loadLeft = s.load - solarHome
  const solarBattery = Math.min(pvLeft, charge)
  pvLeft -= solarBattery
  const solarGrid = Math.min(pvLeft, exp)
  const batteryHome = Math.min(discharge, loadLeft)
  loadLeft -= batteryHome
  const gridHome = Math.min(imp, loadLeft)
  const gridBattery = Math.max(0, charge - solarBattery)
  const batteryGrid = Math.max(0, discharge - batteryHome)
  return { solarHome, solarBattery, solarGrid, gridHome, gridBattery, batteryHome, batteryGrid }
}
