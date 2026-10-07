/** Display helpers shared by every demo. */

export const kw = (v: number, digits = 1) => `${Math.abs(v).toFixed(digits)} kW`

export const batteryState = (p: number) => (p > 0.05 ? 'Charging' : p < -0.05 ? 'Discharging' : 'Idle')
export const gridState = (p: number, outage = false) => (outage ? 'Unavailable' : p > 0.05 ? 'Importing' : p < -0.05 ? 'Exporting' : 'Balanced')

export const pct = (v: number, digits = 0) => `${v.toFixed(digits)}%`

export const signed = (v: number, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}`

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Simulated day index → weekday label (day 7 of the simulation is shown as a Thursday). */
export const dayName = (day: number) => DAY_NAMES[(day + 3) % 7]
