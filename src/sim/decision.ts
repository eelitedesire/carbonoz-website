/**
 * Explains, in words, what the demo strategy is doing right now and why —
 * read from the model's own state, never scripted.
 */
import { Controls, Core, dayOf, Faults, forecastPvKwh, minuteOf, peakReserveFor, planTargetFor, tariffAt } from './model'

export interface Decision {
  action: string
  reason: string
  next: string
  tone: 'ok' | 'info' | 'warn' | 'danger'
}

export function decision(s: Core, c: Controls, f: Faults): Decision {
  const m = minuteOf(s.t)
  const day = dayOf(s.t)
  const band = tariffAt(s.t)
  const charging = s.battery > 0.1
  const discharging = s.battery < -0.1

  if (f.gridOutage)
    return {
      action: s.unserved > 0.05 ? 'Shedding load — battery depleted' : 'Islanded: battery carries the site',
      reason: `Grid unavailable. Battery at ${s.soc.toFixed(0)}%, discharge floor lowered to 5%.`,
      next: 'Resynchronise with the grid when it returns.',
      tone: 'danger',
    }
  if (c.batteryMode === 'hold')
    return { action: 'Battery on hold', reason: 'Operator set the battery to hold. Solar and grid serve the load.', next: 'Return to automatic to resume the plan.', tone: 'warn' }

  const next =
    band === 'off-peak'
      ? `Sunrise ≈ 06:05 · forecast ${forecastPvKwh(day).toFixed(0)} kWh solar today`
      : m < 18 * 60
        ? 'Evening peak window starts 18:00'
        : m < 22 * 60
          ? 'Peak window ends 22:00'
          : 'Off-peak window starts 00:00'

  if (s.planTarget != null && charging && s.grid > 0.3)
    return { action: `Off-peak top-up to ${s.planTarget}%`, reason: `Tomorrow's forecast surplus will not refill the battery; cheaper energy now replaces peak import later.`, next, tone: 'info' }
  if (s.curtailed > 0.2) return { action: 'Export limit reached', reason: `Battery full and export capped at ${c.exportLimitKw} kW — ${s.curtailed.toFixed(1)} kW curtailed.`, next, tone: 'warn' }
  if (charging) return { action: `Charging from solar surplus`, reason: `Solar ${s.pv.toFixed(1)} kW exceeds demand ${s.load.toFixed(1)} kW. Target ${c.targetSoc}%.`, next, tone: 'ok' }
  if (s.soc >= c.targetSoc - 0.7 && s.grid < -0.1) return { action: 'Battery full — exporting surplus', reason: `Target ${c.targetSoc}% reached; surplus goes to the grid.`, next, tone: 'ok' }
  if (discharging && band === 'peak') return { action: 'Covering the evening peak', reason: `Battery supplies ${Math.abs(s.battery).toFixed(1)} kW instead of peak-tariff import.`, next, tone: 'ok' }
  if (discharging && s.grid > 0.05 && c.peakShaving) return { action: 'Peak shaving', reason: `Grid import held near ${c.peakLimitKw} kW; battery covers the rest.`, next, tone: 'info' }
  if (discharging) return { action: 'Discharging to cover demand', reason: `Demand ${s.load.toFixed(1)} kW exceeds solar ${s.pv.toFixed(1)} kW.`, next, tone: 'ok' }

  const keep = peakReserveFor(day, c)
  if (c.gridStrategy === 'optimized' && m >= 15 * 60 && m < 18 * 60 && s.soc <= keep && s.grid > 0.05)
    return { action: 'Holding charge for the peak', reason: `Keeping ${s.soc.toFixed(0)}% for 18:00–22:00 instead of spending it at standard tariff.`, next, tone: 'info' }
  if (band === 'off-peak' && c.gridStrategy === 'optimized' && s.grid > 0.05) {
    const t = planTargetFor(dayOf(s.t + 360), c)
    return { action: t == null ? 'Holding — no grid charging tonight' : `Holding at ${s.soc.toFixed(0)}% for the morning`, reason: t == null ? 'Forecast surplus refills the battery tomorrow.' : `Plan target ${t}% reached.`, next, tone: 'info' }
  }
  if (s.soc <= c.reserveSoc + 0.5 && s.grid > 0.05) return { action: `Reserve held at ${c.reserveSoc}%`, reason: 'Remaining charge is kept for backup; the grid covers demand.', next, tone: 'warn' }
  return { action: 'Site balanced', reason: 'Solar covers demand without storage or grid.', next, tone: 'ok' }
}
