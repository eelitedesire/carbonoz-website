'use client'

/**
 * Port of the CARBONOZ app design system (login.carbonoz.com/offsettingdashboard
 * src/design): same anatomy, classes and motion, so the website's product
 * surfaces look like the real app. Use inside a `.homeos` scope.
 */
import { motion } from 'motion/react'
import { ButtonHTMLAttributes, forwardRef, HTMLAttributes, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'
import { cx as cn } from '@/components/ui/cx'

export { cn }

// ------------------------------------------------------------------ Card

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { interactive?: boolean }>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-line bg-panel shadow-[var(--shadow-card)]',
      interactive && 'transition-[border-color,transform,background-color] duration-200 hover:-translate-y-px hover:border-line-strong',
      className,
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export function CardHeader({ title, subtitle, action, icon, className, id }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string; id?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className='flex min-w-0 items-center gap-2.5'>
        {icon && <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel-3 text-fg-2'>{icon}</span>}
        <div className='min-w-0'>
          <h3 id={id} className='truncate text-[15px] font-semibold tracking-[-0.01em] text-fg'>
            {title}
          </h3>
          {subtitle && <p className='mt-0.5 truncate text-[12px] text-muted'>{subtitle}</p>}
        </div>
      </div>
      {action && <div className='flex shrink-0 items-center gap-2'>{action}</div>}
    </div>
  )
}

export function LinkButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type='button' className={cn('rounded text-[11.5px] font-medium text-accent-ink transition-colors hover:text-fg', className)} {...props}>
      {children}
    </button>
  )
}

// ------------------------------------------------------------------ StatusBadge

export type Tone = 'good' | 'warning' | 'critical' | 'info' | 'neutral' | 'solar'

const tones: Record<Tone, string> = {
  good: 'bg-batt/10 text-batt border-batt/25',
  warning: 'bg-gridp/10 text-gridp border-gridp/25',
  critical: 'bg-danger/10 text-danger border-danger/25',
  info: 'bg-accent/10 text-accent-ink border-accent/30',
  neutral: 'bg-panel-3 text-muted border-line-strong',
  solar: 'bg-solar/10 text-solar border-solar/30',
}
const dots: Record<Tone, string> = { good: 'bg-batt', warning: 'bg-gridp', critical: 'bg-danger', info: 'bg-accent', neutral: 'bg-subtle', solar: 'bg-solar' }

export function StatusBadge({ tone = 'neutral', children, dot, pulse, className }: { tone?: Tone; children: ReactNode; dot?: boolean; pulse?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium', tones[tone], className)}>
      {dot && (
        <span className='relative flex h-1.5 w-1.5'>
          {pulse && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', dots[tone])} />}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dots[tone])} />
        </span>
      )}
      {children}
    </span>
  )
}

// ------------------------------------------------------------------ Tabs / Segmented

export function Tabs<T extends string>({ items, value, onChange, label, className }: { items: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string; className?: string }) {
  const layoutId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % items.length
    if (e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = items.length - 1
    if (next >= 0) {
      e.preventDefault()
      refs.current[next]?.focus()
      onChange(items[next].id)
    }
  }
  return (
    <div role='tablist' aria-label={label} className={cn('flex items-center gap-1', className)}>
      {items.map((item, i) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role='tab'
            type='button'
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn('relative h-8 shrink-0 rounded-lg px-3 text-[12.5px] font-medium transition-colors', active ? 'text-fg' : 'text-muted hover:text-fg-2')}
          >
            {active && <motion.span layoutId={layoutId} className='absolute inset-0 rounded-lg border border-line-strong bg-panel-3' transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className='relative'>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label, className }: { options: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string; className?: string }) {
  return (
    <div role='radiogroup' aria-label={label} className={cn('flex w-fit rounded-lg border border-line-strong p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type='button'
          role='radio'
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn('whitespace-nowrap rounded-md px-3 py-1 text-[12px] font-medium transition-colors', value === o.id ? 'bg-accent text-on-accent' : 'text-muted hover:text-fg')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ Buttons

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-[0_6px_18px_-8px_rgb(222_175_11/0.8)]',
  secondary: 'bg-panel-3 text-fg-2 hover:text-fg border border-line-strong/60',
  outline: 'border border-line-strong bg-panel/40 text-fg-2 hover:text-fg hover:border-subtle hover:bg-panel-2',
  ghost: 'text-muted hover:text-fg hover:bg-panel-3',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/25',
}

export function AppButton({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return (
    <button
      type='button'
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-150 active:scale-[0.97]',
        variants[variant],
        size === 'sm' ? 'h-8 gap-1.5 rounded-lg px-3 text-[12px]' : 'h-9 gap-2 rounded-lg px-4 text-[13px]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const ctrl = 'grid h-9 w-9 place-items-center rounded-lg text-fg-2 transition-colors hover:bg-panel-3 hover:text-fg'

// ------------------------------------------------------------------ Switch

export function AppSwitch({ checked, onChange, label, tone = 'accent' }: { checked: boolean; onChange: (v: boolean) => void; label: string; tone?: 'accent' | 'danger' | 'warning' }) {
  const on = { accent: 'bg-accent', danger: 'bg-danger', warning: 'bg-gridp' }[tone]
  return (
    <button type='button' role='switch' aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors', checked ? on : 'bg-panel-3 ring-1 ring-inset ring-line-strong')}>
      <motion.span className='absolute h-5 w-5 rounded-full bg-white shadow' animate={{ x: checked ? 22 : 2 }} transition={{ type: 'spring', stiffness: 600, damping: 34 }} />
    </button>
  )
}

// ------------------------------------------------------------------ Brand

/** The app's BrandMark: the CARBONOZ logo image in a rounded tile, with the wordmark. */
export function BrandMark({ size = 30, showName = true, className }: { size?: number; showName?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/brand/carbonoz-mark.jpg' alt='' width={size} height={size} className='shrink-0 rounded-[9px] object-cover ring-1 ring-brand/40' style={{ width: size, height: size }} />
      {showName && <span className='text-[18px] font-semibold tracking-[-0.02em] text-fg'>CARBONOZ</span>}
    </span>
  )
}

// ------------------------------------------------------------------ Numbers

/** Tweens between numeric values so live telemetry updates feel smooth (app AnimatedNumber). */
export function AnimatedNumber({ value, decimals = 1, duration = 450 }: { value: number; decimals?: number; duration?: number }) {
  const [display, setDisplay] = useState(value)
  const from = useRef(value)
  const shown = useRef(value)
  useEffect(() => {
    from.current = shown.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      shown.current = from.current + (value - from.current) * eased
      setDisplay(shown.current)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{display.toFixed(decimals)}</>
}

/** Power for display: watts below 1 kW, kilowatts above (app format.ts). Input in kW. */
export function power(kw: number | null | undefined): { value: string; unit: string } {
  if (kw == null || Number.isNaN(kw)) return { value: '—', unit: '' }
  const w = Math.abs(kw) * 1000
  if (w < 1000) return { value: String(Math.round(w)), unit: 'W' }
  const k = w / 1000
  return { value: k.toFixed(k < 10 ? 2 : 1), unit: 'kW' }
}
export const powerText = (kw: number | null | undefined) => {
  const p = power(kw)
  return p.unit ? `${p.value} ${p.unit}` : p.value
}

// ------------------------------------------------------------------ Live pill

export function LiveStatusPill({ ago, compact }: { ago?: string; compact?: boolean }) {
  return (
    <span className={cn('flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-panel/50 text-[12.5px] font-medium text-fg-2', compact ? 'px-2.5' : 'px-3')} role='status'>
      <span className='relative flex h-2 w-2'>
        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-batt opacity-60' />
        <span className='relative inline-flex h-2 w-2 rounded-full bg-batt' />
      </span>
      <span className={cn(compact && 'sr-only')}>Live</span>
      {!compact && ago && <span className='hidden text-[11.5px] font-normal text-muted 2xl:inline'>{ago}</span>}
    </span>
  )
}
