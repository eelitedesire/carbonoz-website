'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { LiveVisible } from '@/sim/hooks'

/**
 * Marks a live region: everything inside follows the simulation only while
 * the region is on screen (plus a margin), so a long page stays cheap.
 */
export function Live({ children, className, margin = '200px' }: { children: ReactNode; className?: string; margin?: string }) {
  const el = useRef<HTMLDivElement>(null)
  const visible = useRef(true)
  useEffect(() => {
    const node = el.current
    if (!node) return
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { rootMargin: margin })
    io.observe(node)
    return () => io.disconnect()
  }, [margin])
  return (
    <LiveVisible.Provider value={visible}>
      <div ref={el} className={className}>
        {children}
      </div>
    </LiveVisible.Provider>
  )
}
