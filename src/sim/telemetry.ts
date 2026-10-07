/**
 * Device-level telemetry derived from the core model: battery packs, BMS,
 * individual cells, inverters and alarms — the same device kinds the CARBONOZ
 * platform stores for a SolarBMS installation (SYSTEM / INVERTER / BATTERY / BMS).
 */
import { ambientC, Core, Faults, minuteOf, noise, SITE } from './model'

/** LiFePO4 open-circuit voltage per cell (V) against state of charge (%). */
const OCV: [number, number][] = [
  [0, 2.9], [3, 3.1], [8, 3.2], [15, 3.245], [25, 3.268], [40, 3.287], [55, 3.298],
  [70, 3.312], [82, 3.328], [90, 3.342], [95, 3.36], [98, 3.4], [100, 3.47],
]

export function ocv(soc: number) {
  const s = Math.min(100, Math.max(0, soc))
  for (let i = 1; i < OCV.length; i++) {
    const [s1, v1] = OCV[i]
    const [s0, v0] = OCV[i - 1]
    if (s <= s1) return v0 + ((v1 - v0) * (s - s0)) / (s1 - s0)
  }
  return OCV[OCV.length - 1][1]
}

const PACK_IDS = ['A', 'B', 'C'] as const
const PACK_SOC_OFFSET = [0.4, -0.6, 0.2]
const PACK_SOH = [98.6, 97.4, 98.1]
const PACK_CYCLES = [412, 418, 409]
const SENSOR_OFFSETS = [0.2, 0.9, 1.5, 0.6]

/** Per-cell capacity drift (%) and contact offset (mV): fixed, like a real pack's fingerprint. */
function cellFingerprint(pack: number, cell: number) {
  const a = noise(pack * 41 + cell * 7.3, 5)
  const b = noise(pack * 17 + cell * 3.1, 9)
  return { drift: (a - 0.5) * 2.4, offsetMv: (b - 0.5) * 5, resistanceMohm: 0.55 + b * 0.25 }
}

export interface Cell {
  id: number
  voltage: number
  temperature: number
  balancing: boolean
}

export type Severity = 'info' | 'warning' | 'critical'

export interface Alarm {
  code: string
  message: string
  severity: Severity
  device: string
}

export interface Pack {
  id: string
  name: string
  bmsId: string
  soc: number
  soh: number
  cycles: number
  voltage: number
  current: number
  power: number
  temperatures: number[]
  mosTemp: number
  cells: Cell[]
  minCell: Cell
  maxCell: Cell
  spreadMv: number
  avgCell: number
  state: 'Charging' | 'Discharging' | 'Idle'
  alarms: Alarm[]
}

export interface Inverter {
  id: string
  name: string
  status: 'Normal' | 'Island mode' | 'Standby'
  pvPower: number
  acPower: number
  batteryPower: number
  acVoltage: number
  frequency: number
  temperature: number
}

export function packs(s: Core, f: Faults): Pack[] {
  return PACK_IDS.map((id, p) => {
    const soc = Math.min(100, Math.max(0, s.soc + PACK_SOC_OFFSET[p] * (s.soc > 5 && s.soc < 95 ? 1 : 0.3)))
    const power = s.battery / SITE.packs
    const nominal = ocv(soc) * SITE.cellsPerPack
    const current = (power * 1000) / nominal
    const charging = power > 0.05
    const cells: Cell[] = []
    for (let i = 0; i < SITE.cellsPerPack; i++) {
      const fp = cellFingerprint(p, i)
      let drift = fp.drift
      let offset = fp.offsetMv
      if (f.cellImbalance && p === 1 && i === 6) {
        drift -= 7
        offset -= 32
      }
      const cellSoc = soc + (drift * (soc - 50)) / 50 + drift * 0.15
      const v = ocv(cellSoc) + (current * fp.resistanceMohm) / 1000 + offset / 1000
      const temp = s.tempC + SENSOR_OFFSETS[i % 4] * 0.8 + (i % 5) * 0.12 + p * 0.3
      cells.push({ id: i + 1, voltage: v, temperature: temp, balancing: false })
    }
    let minCell = cells[0]
    let maxCell = cells[0]
    let sum = 0
    for (const c of cells) {
      if (c.voltage < minCell.voltage) minCell = c
      if (c.voltage > maxCell.voltage) maxCell = c
      sum += c.voltage
    }
    const spreadMv = (maxCell.voltage - minCell.voltage) * 1000
    // Passive balancing bleeds the highest cells during the top of charge.
    if (charging && soc > 86 && spreadMv > 10) {
      for (const c of cells) if (c.voltage - minCell.voltage > 0.008) c.balancing = true
    }
    const temperatures = SENSOR_OFFSETS.map((o) => s.tempC + o + p * 0.3)
    const bmsId = `bms-${id.toLowerCase()}`
    const alarms: Alarm[] = []
    if (spreadMv > 30) alarms.push({ code: 'CELL_SPREAD', message: `Cell spread ${spreadMv.toFixed(0)} mV`, severity: 'warning', device: bmsId })
    if (minCell.voltage < 3.0) alarms.push({ code: 'CELL_UNDERVOLT', message: `Cell ${pad(minCell.id)} below 3.000 V`, severity: 'critical', device: bmsId })
    if (maxCell.voltage > 3.6) alarms.push({ code: 'CELL_OVERVOLT', message: `Cell ${pad(maxCell.id)} above 3.600 V`, severity: 'warning', device: bmsId })
    if (Math.max(...temperatures) > 42) alarms.push({ code: 'OVER_TEMP', message: 'Pack temperature high', severity: 'warning', device: bmsId })
    return {
      id,
      name: `Battery ${id}`,
      bmsId,
      soc,
      soh: PACK_SOH[p],
      cycles: PACK_CYCLES[p],
      voltage: sum,
      current,
      power,
      temperatures,
      mosTemp: s.tempC + 3 + Math.abs(current) * 0.04,
      cells,
      minCell,
      maxCell,
      spreadMv,
      avgCell: sum / cells.length,
      state: charging ? 'Charging' : power < -0.05 ? 'Discharging' : 'Idle',
      alarms,
    }
  })
}

export const pad = (n: number) => String(n).padStart(2, '0')

const STRING_SHARE = [0.54, 0.46]

export function inverters(s: Core, f: Faults): Inverter[] {
  return STRING_SHARE.map((share, i) => {
    const pv = s.pv * share
    const bat = s.battery / SITE.inverters
    const ac = pv - bat
    const load = Math.abs(ac) / SITE.inverterKw
    return {
      id: `inv-${i + 1}`,
      name: `Hybrid inverter ${i + 1}`,
      status: f.gridOutage ? 'Island mode' : Math.abs(ac) < 0.03 && pv < 0.03 ? 'Standby' : 'Normal',
      pvPower: pv,
      acPower: ac,
      batteryPower: bat,
      acVoltage: 230 + (noise(s.t / 6, 40 + i) - 0.5) * 6 - load * 1.5,
      frequency: f.gridOutage ? 50 : 50 + (noise(s.t / 3, 50 + i) - 0.5) * 0.06,
      temperature: ambientC(s.t) + 6 + load * 18,
    }
  })
}

export function systemAlarms(s: Core, f: Faults, p: Pack[]): Alarm[] {
  const out: Alarm[] = p.flatMap((x) => x.alarms)
  if (f.gridOutage) out.push({ code: 'GRID_LOST', message: 'Grid unavailable — inverters in island mode', severity: 'critical', device: 'inv-1' })
  if (s.unserved > 0.05) out.push({ code: 'LOAD_SHED', message: 'Demand exceeds available supply', severity: 'critical', device: 'system' })
  if (s.curtailed > 0.2) out.push({ code: 'PV_CURTAILED', message: `PV curtailed ${s.curtailed.toFixed(1)} kW (export limit)`, severity: 'info', device: 'inv-1' })
  return out
}

export function clock(t: number) {
  const m = minuteOf(t)
  return `${pad(Math.floor(m / 60))}:${pad(Math.floor(m % 60))}`
}
