/**
 * Application scenarios: the same site model, re-run for one day with a
 * different demand profile or grid condition. Used for the sectors section.
 */
import { Core, DAY, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, initialCore, loadAt, minuteOf, NO_FAULTS, noise, simulate, type LoadFn } from './model'
import { totals } from './energy'

export type ScenarioId = 'residential' | 'commercial' | 'industrial' | 'backup' | 'remote'

const g = (m: number, mu: number, s: number) => Math.exp(-((m - mu) ** 2) / (2 * s * s))

const LOAD: Record<ScenarioId, LoadFn> = {
  residential: loadAt,
  commercial: (t) => {
    const m = minuteOf(t)
    return 0.5 + 3.2 * g(m, 13 * 60, 170) * (m > 7 * 60 && m < 19 * 60 ? 1 : 0.2) + (noise(t / 12, 4) - 0.5) * 0.5
  },
  industrial: (t) => {
    const m = minuteOf(t)
    return 2.2 + 1.6 * g(m, 11 * 60, 220) + (noise(t / 8, 6) - 0.5) * 0.7
  },
  backup: loadAt,
  remote: (t) => loadAt(t) * 0.7,
}

export interface ScenarioDay {
  id: ScenarioId
  samples: Core[]
  selfSufficiency: number
  imported: number
  unserved: number
  outage?: [number, number]
}

const cache = new Map<ScenarioId, ScenarioDay>()

export function scenarioDay(id: ScenarioId): ScenarioDay {
  const hit = cache.get(id)
  if (hit) return hit
  const day = 7
  const warm = simulate(initialCore(0), day * DAY, 10, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, NO_FAULTS, 10, undefined, LOAD[id]).end
  let samples: Core[] = []
  let outage: [number, number] | undefined
  if (id === 'backup') {
    outage = [13 * 60, 19 * 60]
    const a = simulate(warm, outage[0], 5, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, NO_FAULTS, 15)
    const b = simulate(a.end, outage[1] - outage[0], 5, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, { ...NO_FAULTS, gridOutage: true }, 15)
    const c = simulate(b.end, DAY - outage[1], 5, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, NO_FAULTS, 15)
    samples = [...a.samples, ...b.samples, ...c.samples]
  } else {
    const f = id === 'remote' ? { ...NO_FAULTS, gridOutage: true } : NO_FAULTS
    samples = simulate(warm, DAY, 5, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, f, 15, undefined, LOAD[id]).samples
  }
  const t = totals(samples, 15)
  const unserved = samples.reduce((a, s) => a + s.unserved * 0.25, 0)
  const out = { id, samples, selfSufficiency: t.selfSufficiency, imported: t.imported, unserved, outage }
  cache.set(id, out)
  return out
}
