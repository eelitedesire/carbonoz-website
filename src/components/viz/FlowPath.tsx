'use client'

import { useId } from 'react'
import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { cn } from '@/components/homeos/ui'

interface Props {
  d: string
  /** Signed kW: > 0 flows from the path start to its end. */
  power: number
  color: string
  width?: number
  /** Telemetry link instead of a power line: thin animated dashes. */
  data?: boolean
  /** Unused, kept for call-site compatibility. */
  dots?: number
  r?: number
  trackOpacity?: number
}

const IDLE = 0.02

/**
 * One energy line drawn exactly like the CARBONOZ app's Energy Flow: a soft
 * rail, the coloured line with an arrowhead in the direction of the energy,
 * and a white particle whose speed follows the power. Idle lines are dotted.
 */
export function FlowPath({ d, power, color, width = 2.2, data }: Props) {
  const reduced = useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const kw = Math.abs(power)
  const reverse = power < 0
  const active = kw > IDLE

  if (data)
    return (
      <g>
        <path d={d} fill='none' stroke={color} strokeOpacity={0.14} strokeWidth={3} strokeLinecap='round' />
        <path d={d} fill='none' stroke={color} strokeOpacity={0.7} strokeWidth={1.2} strokeLinecap='round' className={cn(!reduced && 'flow-line')} />
      </g>
    )

  // Quantised so live updates don't restart the particle on every tick.
  const dur = Math.max(0.9, Math.round((2.6 - kw * 0.35) * 4) / 4)
  return (
    <g opacity={active ? 1 : 0.22}>
      <defs>
        <marker id={uid} viewBox='0 0 10 10' refX='6.5' refY='5' markerWidth='5.5' markerHeight='5.5' orient='auto-start-reverse'>
          <path d='M1 1.2 8.2 5 1 8.8z' fill={color} stroke={color} strokeWidth='1' strokeLinejoin='round' />
        </marker>
      </defs>
      <path d={d} fill='none' stroke={color} strokeOpacity={0.18} strokeWidth={width * 1.8} strokeLinecap='round' />
      <path
        d={d}
        fill='none'
        stroke={color}
        strokeWidth={width}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeDasharray={!active ? '2 5' : undefined}
        markerEnd={active && !reverse ? `url(#${uid})` : undefined}
        markerStart={active && reverse ? `url(#${uid})` : undefined}
      />
      {active && !reduced && (
        <circle r={width * 1.2} fill='#fff' opacity={0.95}>
          <animateMotion key={`${reverse}-${dur}`} dur={`${dur}s`} repeatCount='indefinite' path={d} keyPoints={reverse ? '1;0' : '0;1'} keyTimes='0;1' calcMode='linear' />
        </circle>
      )}
    </g>
  )
}
