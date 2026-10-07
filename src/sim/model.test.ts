import { describe, expect, it } from 'vitest'
import { DAY, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, flows, initialCore, NO_FAULTS, simulate, step } from './model'
import { packs } from './telemetry'
import { insight, horizon } from './forecast'
import { totals } from './energy'

const run = (days = 3, c = DEFAULT_CONTROLS, f = NO_FAULTS) => simulate(initialCore(0), days * DAY, 1, c, DEFAULT_OVERRIDES, f, 5)

describe('demo energy model', () => {
  it('is deterministic', () => {
    expect(run(2).end).toEqual(run(2).end)
  })

  it('balances every step: pv + import + discharge = load + export + charge', () => {
    for (const s of run(3).samples) {
      expect(s.pv + s.grid - s.battery + s.unserved).toBeCloseTo(s.load, 6)
    }
  })

  it('keeps SOC within bounds and produces nothing at night', () => {
    for (const s of run(3).samples) {
      expect(s.soc).toBeGreaterThanOrEqual(0)
      expect(s.soc).toBeLessThanOrEqual(100)
      const m = s.t % DAY
      if (m < 5 * 60 || m > 19 * 60) expect(s.pv).toBe(0)
    }
  })

  it('charges from surplus at midday and discharges in the evening', () => {
    const day = run(3).samples.filter((s) => s.t >= 2 * DAY && s.t < 3 * DAY)
    const at = (h: number) => day.find((s) => s.t % DAY === h * 60)!
    expect(at(11).battery).toBeGreaterThan(0)
    expect(at(20).battery).toBeLessThan(0)
  })

  it('splits flows consistently', () => {
    for (const s of run(2).samples) {
      const f = flows(s)
      expect(f.solarHome + f.solarBattery + f.solarGrid).toBeLessThanOrEqual(s.pv + 1e-6)
      expect(f.solarHome + f.batteryHome + f.gridHome).toBeCloseTo(Math.min(s.load, s.load), 1)
    }
  })

  it('carries the site through a grid outage on the battery', () => {
    const { samples } = run(1, DEFAULT_CONTROLS, { ...NO_FAULTS, gridOutage: true })
    for (const s of samples) expect(Math.abs(s.grid)).toBe(0)
  })

  it('derives 16 cells per pack and flags an injected imbalance', () => {
    const s = step(initialCore(DAY + 600), 1, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, NO_FAULTS)
    const ok = packs(s, NO_FAULTS)
    expect(ok).toHaveLength(3)
    expect(ok[0].cells).toHaveLength(16)
    expect(ok.every((p) => p.alarms.length === 0)).toBe(true)
    const bad = packs(s, { ...NO_FAULTS, cellImbalance: true })
    expect(bad[1].minCell.id).toBe(7)
    expect(bad[1].alarms.map((a) => a.code)).toContain('CELL_SPREAD')
  })

  it('produces a forecast and a plan that never imports more than the baseline', () => {
    const now = run(7).end
    const f = horizon(now, DEFAULT_CONTROLS, 48, 15)
    expect(f.length).toBe(48 * 4)
    const i = insight(now, DEFAULT_CONTROLS)
    expect(Number.isFinite(i.solarDeltaPct)).toBe(true)
    expect(i.planned.peakImportKwh).toBeLessThanOrEqual(i.baseline.peakImportKwh + 1e-6)
    expect(i.planned.cost).toBeLessThanOrEqual(i.baseline.cost + 1e-6)
    const t = totals(run(1).samples)
    expect(t.pv).toBeGreaterThan(0)
    expect(t.selfSufficiency).toBeGreaterThan(50)
  })
})
