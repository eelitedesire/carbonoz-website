'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { KeyboardEvent as ReactKeyboardEvent, PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ASSETS, AssetId } from '@/content/assets'
import { cx } from './cx'

/**
 * Image viewer. Any element with `data-zoom-id` opens it; the gallery is
 * every zoomable image on the current page, in document order, so a
 * visitor can step through a page's products and installations.
 */

type Listener = (id: AssetId, trigger: HTMLElement | null) => void
const listeners = new Set<Listener>()

export function openViewer(id: AssetId, trigger: HTMLElement | null) {
  listeners.forEach((l) => l(id, trigger))
}

const SITE_URL: Record<string, string> = {
  'en.lixibattery.com': 'https://en.lixibattery.com/',
  'caytech.biz': 'https://caytech.biz/',
  'en.solaire.mu': 'https://en.solaire.mu/',
  'carbonoz.com': 'https://carbonoz.com/',
  'heliosnrg.eu': 'https://heliosnrg.eu/',
}

const largest = (id: AssetId) => {
  const a = ASSETS[id]
  return a.widths.length ? `${a.base}-${a.widths[a.widths.length - 1]}.webp` : `${a.base}.webp`
}

export function Lightbox() {
  const [ids, setIds] = useState<AssetId[]>([])
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLElement | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const swipe = useRef<number | null>(null)

  useEffect(() => {
    const l: Listener = (id, el) => {
      const list = [...new Set([...document.querySelectorAll<HTMLElement>('[data-zoom-id]')].map((e) => e.dataset.zoomId as AssetId))]
      const all = list.includes(id) ? list : [id, ...list]
      trigger.current = el
      setIds(all)
      setIndex(all.indexOf(id))
      setOpen(true)
    }
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    trigger.current?.focus()
  }, [])
  const go = useCallback((d: number) => setIndex((i) => (ids.length ? (i + d + ids.length) % ids.length : 0)), [ids.length])

  // Lock page scroll, move focus into the dialog.
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => dialog.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 30)
    return () => {
      document.documentElement.style.overflow = prev
      clearTimeout(t)
    }
  }, [open])

  // Preload neighbours so stepping is instant.
  useEffect(() => {
    if (!open || ids.length < 2) return
    for (const d of [1, -1]) {
      const img = new Image()
      img.src = largest(ids[(index + d + ids.length) % ids.length])
    }
  }, [open, index, ids])

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === 'Tab') {
      // Focus trap
      const f = [...(dialog.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])]
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
    }
  }
  const down = (e: PointerEvent) => (swipe.current = e.clientX)
  const up = (e: PointerEvent) => {
    if (swipe.current == null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  const id = ids[index]
  const a = id ? ASSETS[id] : null

  return (
    <AnimatePresence>
      {open && a && (
        <motion.div
          ref={dialog}
          role='dialog'
          aria-modal='true'
          aria-labelledby='viewer-title'
          aria-describedby='viewer-desc'
          onKeyDown={onKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='fixed inset-0 z-[100] flex flex-col bg-[#05070a]/95 text-[#eceff4] backdrop-blur-md'
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* top bar */}
          <div className='flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6'>
            <p className='num text-[12px] text-white/60' aria-live='polite'>
              {index + 1} / {ids.length}
            </p>
            <button type='button' data-autofocus onClick={close} aria-label='Close image viewer' className='grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10'>
              <X size={20} />
            </button>
          </div>

          {/* image */}
          <div className='relative min-h-0 flex-1 touch-pan-y px-2 sm:px-16' onPointerDown={down} onPointerUp={up} onClick={(e) => e.target === e.currentTarget && close()}>
            <AnimatePresence mode='wait' initial={false}>
              <motion.div key={id} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className='pointer-events-none absolute inset-0 flex items-center justify-center px-2 sm:px-16'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={largest(id)}
                  alt={a.alt}
                  width={a.w}
                  height={a.h}
                  className={cx('pointer-events-auto max-h-full max-w-full object-contain', a.category.startsWith('Battery storage') || a.category.startsWith('Inverter') || a.category === 'System design' ? 'rounded-[10px] bg-white p-3' : 'rounded-[6px]')}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
            {ids.length > 1 && (
              <>
                <button type='button' onClick={() => go(-1)} aria-label='Previous image' className='absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/30 text-white transition-colors hover:bg-white/10 sm:grid'>
                  <ChevronLeft size={22} />
                </button>
                <button type='button' onClick={() => go(1)} aria-label='Next image' className='absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/30 text-white transition-colors hover:bg-white/10 sm:grid'>
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* details */}
          <div className='shrink-0 border-t border-white/10 px-4 py-4 sm:px-6'>
            <div className='mx-auto flex max-w-[1100px] flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
              <div className='min-w-0'>
                <p className='label text-[10px] text-[#f4c94a]'>{a.category}</p>
                <h2 id='viewer-title' className='mt-1.5 text-[clamp(1.2rem,2.4vw,1.6rem)] font-medium tracking-[-0.025em]'>
                  {a.title}
                </h2>
                <p id='viewer-desc' className='mt-1 max-w-[70ch] text-[14px] leading-relaxed text-white/70'>
                  {a.description ?? a.alt}
                </p>
                <p className='mt-2 text-[12px] text-white/50'>
                  Source:{' '}
                  <a href={SITE_URL[a.source] ?? `https://${a.source}/`} target='_blank' rel='noopener noreferrer' className='underline-offset-2 hover:text-white hover:underline'>
                    {a.source}
                  </a>
                </p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                {ids.length > 1 && (
                  <div className='flex gap-2 sm:hidden'>
                    <button type='button' onClick={() => go(-1)} aria-label='Previous image' className='grid h-12 w-12 place-items-center rounded-full border border-white/15 text-white active:bg-white/10'>
                      <ChevronLeft size={22} />
                    </button>
                    <button type='button' onClick={() => go(1)} aria-label='Next image' className='grid h-12 w-12 place-items-center rounded-full border border-white/15 text-white active:bg-white/10'>
                      <ChevronRight size={22} />
                    </button>
                  </div>
                )}
                {a.href && (
                  <Link href={a.href} onClick={close} className='flex h-12 items-center gap-1.5 rounded-full bg-[#e3b11b] px-5 text-[14px] font-medium text-[#171203] hover:bg-[#f4c94a]'>
                    View details <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
            </div>
            {ids.length > 1 && (
              <ol className='scroll-x mx-auto mt-4 hidden max-w-[1100px] gap-2 md:flex' aria-label='Images on this page'>
                {ids.map((t, i) => (
                  <li key={t} className='shrink-0'>
                    <button type='button' onClick={() => setIndex(i)} aria-label={`Show ${ASSETS[t].title}`} aria-current={i === index} className={cx('block h-12 w-16 overflow-hidden rounded-[5px] border transition-opacity', i === index ? 'border-[#e3b11b] opacity-100' : 'border-white/10 opacity-50 hover:opacity-90')}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ASSETS[t].widths.length ? `${ASSETS[t].base}-${ASSETS[t].widths[0]}.webp` : `${ASSETS[t].base}.webp`} alt='' className='h-full w-full bg-white object-cover' loading='lazy' />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
