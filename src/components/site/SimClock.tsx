'use client'

import { useSimClock } from '@/sim/hooks'

/** Starts the shared simulation once for the whole site. */
export function SimClock() {
  useSimClock()
  return null
}
