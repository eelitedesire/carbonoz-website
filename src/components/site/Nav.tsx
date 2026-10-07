'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { COMPANY, NAV } from '@/content/site'
import { cx } from '@/components/ui/primitives'
import { ThemeToggle } from '@/components/ui/theme'
import { Logo } from './Logo'

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href.replace(/#.*$/, '')))

export function Nav() {
  const path = usePathname() ?? '/'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Close menus when the route changes (adjusting state during render, not in an effect).
  const [prevPath, setPrevPath] = useState(path)
  if (prevPath !== path) {
    setPrevPath(path)
    setOpen(false)
    setMenu(null)
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (setOpen(false), setMenu(null))
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMenu(label)
  }
  const leave = () => {
    closeTimer.current = setTimeout(() => setMenu(null), 140)
  }

  return (
    <header className='fixed inset-x-0 top-0 z-50'>
      <a href='#main' className='label sr-only rounded bg-brand px-3 py-2 text-on-brand focus:not-sr-only focus:absolute focus:left-4 focus:top-4'>
        Skip to content
      </a>
      <div
        className={cx(
          'transition-[background,border-color,backdrop-filter] duration-300',
          scrolled || open ? 'border-b border-line bg-ink-950/80 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <nav aria-label='Main' className={cx('container-x flex items-center justify-between transition-[height] duration-300', scrolled ? 'h-14' : 'h-[72px]')}>
          <Link href='/' aria-label='CARBONOZ home' className='text-fg'>
            <Logo />
          </Link>

          <ul className='hidden items-center gap-1 xl:flex'>
            {NAV.map((item) => {
              const children = 'children' in item ? item.children : null
              const active = isActive(path, item.href)
              return (
                <li key={item.label} className='relative' onMouseEnter={() => children && enter(item.label)} onMouseLeave={() => children && leave()}>
                  {children ? (
                    <button
                      type='button'
                      aria-expanded={menu === item.label}
                      aria-haspopup='true'
                      onClick={() => setMenu(menu === item.label ? null : item.label)}
                      className={cx('flex h-9 items-center gap-1 rounded-md px-3 text-[14px] transition-colors', active ? 'text-fg' : 'text-fg-2 hover:text-fg')}
                    >
                      {item.label}
                      <ChevronDown size={14} className={cx('transition-transform duration-200', menu === item.label && 'rotate-180')} aria-hidden />
                    </button>
                  ) : (
                    <Link href={item.href} className={cx('flex h-9 items-center rounded-md px-3 text-[14px] transition-colors', active ? 'text-fg' : 'text-fg-2 hover:text-fg')}>
                      {item.label}
                    </Link>
                  )}
                  <AnimatePresence>
                    {children && menu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className='absolute left-0 top-full pt-2'
                      >
                        <ul className='panel w-[300px] p-1.5 shadow-2xl shadow-black/60'>
                          {children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} className='group flex flex-col rounded-[6px] px-3 py-2.5 transition-colors hover:bg-fg/[0.04]'>
                                <span className='text-[14px] text-fg'>{c.label}</span>
                                <span className='text-[12.5px] text-muted group-hover:text-fg-2'>{c.line}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>

          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <a href={COMPANY.platformUrl} className='hidden h-9 items-center whitespace-nowrap px-3 text-[14px] text-fg-2 transition-colors hover:text-fg md:flex'>
              Sign in
            </a>
            <Link
              href='/demo/'
              className='hidden h-9 items-center whitespace-nowrap rounded-[6px] bg-fg px-4 text-[14px] font-medium text-ink-950 transition-colors hover:bg-white sm:flex'
            >
              Explore platform
            </Link>
            <button
              type='button'
              className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-fg xl:hidden'
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls='mobile-nav'
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id='mobile-nav'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-x-0 bottom-0 top-14 overflow-y-auto bg-ink-950 xl:hidden'
          >
            <nav aria-label='Mobile' className='container-x flex min-h-full flex-col pb-10 pt-4'>
              <ul className='divide-y divide-line border-b border-line'>
                {NAV.map((item, i) => (
                  <motion.li key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i, duration: 0.3 }}>
                    <Link href={item.href} className='flex items-baseline justify-between py-4 text-[26px] font-medium tracking-[-0.03em]'>
                      {item.label}
                      <span className='label text-subtle'>{String(i + 1).padStart(2, '0')}</span>
                    </Link>
                    {'children' in item && (
                      <ul className='-mt-1 grid grid-cols-2 gap-x-4 gap-y-1 pb-4'>
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className='block py-1.5 text-[14.5px] text-fg-2'>
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
              <div className='mt-8 grid gap-3'>
                <Link href='/demo/' className='flex h-12 items-center justify-center rounded-[6px] bg-brand font-medium text-on-brand'>
                  Explore platform
                </Link>
                <a href={COMPANY.platformUrl} className='flex h-12 items-center justify-center rounded-[6px] border border-line-strong text-fg'>
                  Customer sign in
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
