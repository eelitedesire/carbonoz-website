/**
 * The "story day" behind the scroll-driven energy flow: one deterministic
 * day of the demo site at one-minute resolution, plus the moments where the
 * system changes behaviour — found in the data, not scripted.
 */
import { Core, DAY, DEFAULT_CONTROLS, DEFAULT_OVERRIDES, initialCore, NO_FAULTS, planTargetFor, simulate, forecastPvKwh } from './model'

/** Day 8 of the simulation: partly cloudy, followed by an overcast day the planner must prepare for. */
export const STORY_DAY = 8

export interface Chapter {
  id: string
  at: number
  title: string
  body: string
}

export interface Story {
  states: Core[]
  chapters: Chapter[]
  tomorrowDeltaPct: number
  planTarget: number | null
}

let cached: Story | null = null

export function storyDay(): Story {
  if (cached) return cached
  const c = DEFAULT_CONTROLS
  const warm = simulate(initialCore(0), STORY_DAY * DAY, 5, c, DEFAULT_OVERRIDES, NO_FAULTS).end
  const { samples } = simulate(warm, DAY, 1, c, DEFAULT_OVERRIDES, NO_FAULTS)
  const states = [warm, ...samples].slice(0, DAY)
  const find = (pred: (s: Core) => boolean, from = 0, fallback = from) => {
    const i = states.findIndex((s, k) => k >= from && pred(s))
    return i < 0 ? fallback : i
  }
  const sunrise = find((s) => s.pv > 0.25, 300, 400)
  const charging = find((s) => s.battery > 1, sunrise, 540)
  const full = find((s) => s.soc >= c.targetSoc - 0.6, charging, 690)
  const peak = find((s) => s.load > 2.6, 17 * 60, 19 * 60)
  const grid = find((s) => s.grid > 0.2, 18 * 60 + 30, 22 * 60 + 30)
  const plan = 23 * 60 + 20
  const target = planTargetFor(STORY_DAY + 1, c)
  const delta = ((forecastPvKwh(STORY_DAY + 1) - forecastPvKwh(STORY_DAY)) / forecastPvKwh(STORY_DAY)) * 100

  const chapters: Chapter[] = [
    { id: 'night', at: 4 * 60 + 30, title: 'Before sunrise', body: 'No sun. The battery carries the night load or holds its reserve while the grid fills in.' },
    { id: 'sunrise', at: sunrise, title: 'Solar comes up', body: 'Generation starts and quickly covers the morning demand.' },
    { id: 'charging', at: charging, title: 'Surplus goes into storage', body: 'Solar now exceeds demand. The surplus charges the battery instead of leaving the site.' },
    { id: 'full', at: full, title: 'Battery reaches its target', body: `At ${c.targetSoc}% the battery stops charging. Whatever solar the site cannot use is exported.` },
    { id: 'peak', at: peak, title: 'Evening peak', body: 'Demand climbs as the sun sets. The battery takes over, inside the most expensive tariff window.' },
    { id: 'grid', at: grid, title: 'Reserve reached', body: `At the ${c.reserveSoc}% reserve the battery stops; the grid supplies the rest of the night.` },
    {
      id: 'plan',
      at: plan,
      title: 'CARBONOZ plans tomorrow',
      body:
        target == null
          ? `The forecast changes by ${delta.toFixed(0)}% for tomorrow. The surplus will refill the battery, so there is no grid charging tonight.`
          : `Tomorrow's forecast drops ${Math.abs(delta).toFixed(0)}%. The plan: top the battery up to ${target}% off-peak tonight, so the morning and evening don't run on peak-tariff grid power.`,
    },
  ]
  cached = { states, chapters, tomorrowDeltaPct: delta, planTarget: target }
  return cached
}
