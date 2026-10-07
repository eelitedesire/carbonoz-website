'use client'

import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { animate, useMotionValue, useTransform, motion } from 'motion/react'
import { useEffect } from 'react'

interface Props {
  value: number
  /** Decimal places. */
  digits?: number
  /** Print the absolute value (direction is shown elsewhere). */
  abs?: boolean
  className?: string
  /** Tween duration, s. */
  duration?: number
}

/** A number that eases to each new value without re-rendering React on every frame. */
export function Num({ value, digits = 1, abs, className, duration = 0.6 }: Props) {
  const reduced = useReducedMotion()
  const v = useMotionValue(abs ? Math.abs(value) : value)
  const text = useTransform(v, (x) => x.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }))
  useEffect(() => {
    const target = abs ? Math.abs(value) : value
    if (reduced) {
      v.set(target)
      return
    }
    const c = animate(v, target, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => c.stop()
  }, [value, abs, reduced, duration, v])
  return <motion.span className={`num ${className ?? ''}`}>{text}</motion.span>
}
