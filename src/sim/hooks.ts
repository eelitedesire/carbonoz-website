'use client'

import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react'
import { dayOf } from './model'
import { Derived, SAMPLE_MIN, sim, Snap } from './store'
import { totals } from './energy'

export { totals, type EnergyTotals } from './energy'

/**
 * Visibility of the surrounding live region. Sections scrolled out of view
 * keep their last values and stop re-rendering until they come back.
 */
export const LiveVisible = createContext<{ current: boolean }>({ current: true })

/**
 * Subscribe to a slice of the simulation. The component re-renders only when
 * the selected value changes (by `eq`), not on every tick.
 */
export function useSim<T>(select: (s: Snap, d: () => Derived) => T, eq: (a: T, b: T) => boolean = Object.is): T {
  const visible = useContext(LiveVisible)
  const client = useRef<{ snap: Snap; value: T } | null>(null)
  const server = useRef<{ value: T } | null>(null)
  const get = () => {
    const s = sim.snap
    const c = client.current
    if (c && (c.snap === s || !visible.current)) return c.value
    const v = select(s, () => sim.derived(s))
    if (c && eq(c.value, v)) {
      c.snap = s
      return c.value
    }
    client.current = { snap: s, value: v }
    return v
  }
  const getServer = () => {
    if (!server.current) server.current = { value: select(sim.initial, () => sim.derived(sim.initial)) }
    return server.current.value
  }
  return useSyncExternalStore(sim.subscribe, get, getServer)
}

/** Shallow equality for flat objects/arrays of primitives. */
export function shallow<T>(a: T, b: T) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false
  const ka = Object.keys(a)
  if (ka.length !== Object.keys(b).length) return false
  return ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

/** Round to a display resolution so components ignore sub-visible changes. */
export const q = (v: number, step = 0.01) => Math.round(v / step) * step

/** Starts the shared clock once for the whole app. */
export function useSimClock() {
  useEffect(() => {
    sim.start()
    return () => sim.stop()
  }, [])
}

export function samplesOfDay(day: number) {
  return sim.history.filter((s) => dayOf(s.t - 1e-6) === day)
}

/** Today's energy totals, refreshed when history grows. */
export function useToday() {
  return useSim(
    (s) => {
      void s.rev
      return totals(samplesOfDay(dayOf(s.core.t)))
    },
    (a, b) => Math.abs(a.pv - b.pv) < 0.05 && Math.abs(a.load - b.load) < 0.05 && Math.abs(a.imported - b.imported) < 0.05 && Math.abs(a.exported - b.exported) < 0.05,
  )
}

/** The last `hours` of history at 5-min resolution, re-read every `everyMin` simulated minutes. */
export function useHistory(hours: number, everyMin = 5) {
  return useSim(
    (s) => {
      void Math.floor(s.core.t / everyMin)
      const n = (hours * 60) / SAMPLE_MIN
      return sim.history.slice(-n)
    },
    (a, b) => a.length === b.length && a[a.length - 1] === b[b.length - 1],
  )
}
