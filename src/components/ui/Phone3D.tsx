'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { PointerEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { cx } from './cx'
import { useReducedMotion } from './useReducedMotion'

const SCREEN_W = 390
const SCREEN_H = 844

/**
 * A 3D smartphone, drawn in CSS: titanium frame, side buttons, Dynamic
 * Island, glass glare and a floor shadow, tilted in perspective. It leans
 * toward the pointer and floats slowly (both off with reduced motion). The
 * child renders at native phone size (390 × 844) and is scaled to fit.
 */
export function Phone3D({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const reduced = useReducedMotion()
  const screen = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.8)

  // Fit the native-size screen into the frame.
  useEffect(() => {
    const el = screen.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / SCREEN_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Pointer tilt
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 90, damping: 18 })
  const sy = useSpring(py, { stiffness: 90, damping: 18 })
  const rotY = useTransform(sx, (v) => -16 + v * 10)
  const rotX = useTransform(sy, (v) => 7 - v * 8)
  const glare = useTransform(sx, (v) => {
    const g = `${40 + v * 25}%`
    return `linear-gradient(115deg, transparent ${g}, rgb(255 255 255 / 0.10) calc(${g} + 6%), transparent calc(${g} + 20%))`
  })
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => (px.set(0), py.set(0))

  return (
    <div className={cx('relative [perspective:2000px]', className)} onPointerMove={move} onPointerLeave={leave}>
      <div className={cx(!reduced && 'phone-float')}>
        <motion.div
          className='relative mx-auto w-full [transform-style:preserve-3d]'
          style={reduced ? { transform: 'rotateY(-12deg) rotateX(5deg)' } : { rotateY: rotY, rotateX: rotX, rotateZ: 1.2 }}
        >
          {/* depth: the frame's edge, offset behind the face */}
          <div aria-hidden className='absolute inset-0 rounded-[17%/8%] bg-[#2a2d33] [transform:translateZ(-14px)_translateX(6px)]' />
          <div aria-hidden className='absolute inset-0 rounded-[17%/8%] bg-gradient-to-br from-[#4a4e57] to-[#121418] [transform:translateZ(-7px)_translateX(3px)]' />

          {/* side buttons */}
          <span aria-hidden className='absolute -left-[3px] top-[18%] h-[5%] w-[4px] rounded-l-sm bg-gradient-to-r from-[#1b1d22] to-[#4a4e57]' />
          <span aria-hidden className='absolute -left-[3px] top-[26%] h-[9%] w-[4px] rounded-l-sm bg-gradient-to-r from-[#1b1d22] to-[#4a4e57]' />
          <span aria-hidden className='absolute -left-[3px] top-[37%] h-[9%] w-[4px] rounded-l-sm bg-gradient-to-r from-[#1b1d22] to-[#4a4e57]' />
          <span aria-hidden className='absolute -right-[3px] top-[30%] h-[13%] w-[4px] rounded-r-sm bg-gradient-to-l from-[#1b1d22] to-[#4a4e57]' />

          {/* body */}
          <div className='relative rounded-[17%/8%] bg-gradient-to-br from-[#5b606a] via-[#23262c] to-[#0d0e11] p-[3.2%] shadow-[0_0_0_1px_rgb(255_255_255/0.08)_inset,0_50px_100px_-30px_rgb(5_10_20/0.55),0_30px_60px_-40px_rgb(5_10_20/0.6)]'>
            <div className='relative rounded-[14%/6.6%] bg-black p-[1.6%]'>
              <div ref={screen} role='region' aria-label={label} className='relative w-full overflow-hidden rounded-[12.6%/5.8%] bg-black' style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }}>
                <div className='absolute left-0 top-0 origin-top-left' style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${scale})` }}>
                  {children}
                </div>
                {/* Dynamic Island */}
                <span aria-hidden className='absolute left-1/2 top-[1.4%] z-20 h-[4.1%] w-[31%] -translate-x-1/2 rounded-full bg-black'>
                  <span className='absolute right-[14%] top-1/2 h-[34%] w-[9%] -translate-y-1/2 rounded-full bg-[#141b2b] ring-1 ring-[#25324f]' />
                </span>
                {/* glass glare */}
                <motion.span aria-hidden className='pointer-events-none absolute inset-0 z-10' style={{ background: glare }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* floor shadow */}
      <div aria-hidden className='mx-auto mt-6 h-6 w-[70%] rounded-[50%] bg-[#0b1220]/25 blur-xl' />
    </div>
  )
}
