import type { Core } from './model'

export interface EnergyTotals {
  pv: number
  load: number
  imported: number
  exported: number
  charged: number
  discharged: number
  /** Share of consumption covered without the grid, %. */
  selfSufficiency: number
}

/** Integrate power samples (kW) taken every `stepMin` minutes into energy (kWh). */
export function totals(samples: Pick<Core, 'pv' | 'load' | 'grid' | 'battery'>[], stepMin = 5): EnergyTotals {
  const h = stepMin / 60
  const t = { pv: 0, load: 0, imported: 0, exported: 0, charged: 0, discharged: 0, selfSufficiency: 0 }
  for (const s of samples) {
    t.pv += s.pv * h
    t.load += s.load * h
    t.imported += Math.max(s.grid, 0) * h
    t.exported += Math.max(-s.grid, 0) * h
    t.charged += Math.max(s.battery, 0) * h
    t.discharged += Math.max(-s.battery, 0) * h
  }
  t.selfSufficiency = t.load > 0 ? Math.max(0, Math.min(100, (1 - t.imported / t.load) * 100)) : 0
  return t
}
