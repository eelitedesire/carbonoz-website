'use client'

import { useReducedMotion } from '@/components/ui/useReducedMotion'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { ReactNode, useId } from 'react'
import { Status, STATUS_LABEL } from '@/content/site'
import { cx } from './cx'

export { cx }

// ------------------------------------------------------------------ buttons

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  external?: boolean
  className?: string
}

export function Button({ href, children, variant = 'primary', external, className }: ButtonProps) {
  const base =
    'group inline-flex h-11 items-center gap-2 rounded-[6px] px-5 text-[14.5px] font-medium tracking-[-0.01em] transition-[background,color,border-color,transform] duration-200 ease-out active:scale-[0.98]'
  const styles = {
    primary: 'bg-brand text-on-brand hover:bg-brand-hi',
    secondary: 'border border-line-strong text-fg hover:border-fg/40 hover:bg-fg/[0.03]',
    ghost: 'px-0 text-fg hover:text-brand-hi',
  }[variant]
  const Icon = external ? ArrowUpRight : ArrowRight
  const inner = (
    <>
      <span>{children}</span>
      <Icon size={16} strokeWidth={1.75} className='transition-transform duration-200 group-hover:translate-x-0.5' aria-hidden />
    </>
  )
  if (external)
    return (
      <a href={href} className={cx(base, styles, className)} target='_blank' rel='noopener noreferrer'>
        {inner}
      </a>
    )
  return (
    <Link href={href} className={cx(base, styles, className)}>
      {inner}
    </Link>
  )
}

// ------------------------------------------------------------------ labels

/** "Simulation" marker on every demo surface: honest without shouting. */
export function SimTag({ children = 'Simulation', className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cx('label inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] text-muted', className)}>
      <span className='h-1.5 w-1.5 rounded-full bg-ai/80' aria-hidden />
      {children}
    </span>
  )
}

/** Content status from the content config (verified / demo / concept / pending). */
export function StatusTag({ status, className }: { status: Status; className?: string }) {
  const tone = { verified: 'text-batt border-batt/30', demo: 'text-ai border-ai/30', concept: 'text-ai border-ai/30', pending: 'text-warn border-warn/30' }[status]
  return <span className={cx('label inline-flex items-center rounded-full border px-2.5 py-1 text-[10px]', tone, className)}>{STATUS_LABEL[status]}</span>
}

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'idle'

export function Dot({ tone = 'ok', pulse, className }: { tone?: Tone; pulse?: boolean; className?: string }) {
  const c = { ok: 'bg-ok text-ok', warn: 'bg-warn text-warn', danger: 'bg-danger text-danger', info: 'bg-ai text-ai', idle: 'bg-subtle text-subtle' }[tone]
  return <span aria-hidden className={cx('inline-block h-1.5 w-1.5 shrink-0 rounded-full', c, pulse && 'animate-pulse-dot', className)} />
}

export function Badge({ tone = 'idle', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const c = {
    ok: 'bg-ok/10 text-ok',
    warn: 'bg-warn/10 text-warn',
    danger: 'bg-danger/12 text-danger',
    info: 'bg-ai/10 text-ai',
    idle: 'bg-fg/[0.05] text-muted',
  }[tone]
  return <span className={cx('inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium', c, className)}>{children}</span>
}

// ------------------------------------------------------------------ section scaffolding

export function SectionHeader({
  index,
  kicker,
  title,
  lede,
  aside,
  id,
  className,
}: {
  index?: string
  kicker: string
  title: ReactNode
  lede?: ReactNode
  aside?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <div className={cx('grid gap-8 lg:grid-cols-12 lg:items-end', className)}>
      <div className='lg:col-span-7'>
        <Reveal>
          <p className='label mb-6 flex items-center gap-3 text-muted'>
            {index && <span className='text-brand'>{index}</span>}
            <span className='h-px w-8 bg-line-strong' aria-hidden />
            <span>{kicker}</span>
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id={id} className='h2 text-balance'>
            {title}
          </h2>
        </Reveal>
      </div>
      {(lede || aside) && (
        <Reveal delay={0.1} className='lg:col-span-5 lg:pb-1'>
          {lede && <p className='lede max-w-[46ch] text-pretty'>{lede}</p>}
          {aside}
        </Reveal>
      )}
    </div>
  )
}

/** Fade + rise on first view. Instant with reduced motion. */
export function Reveal({ children, delay = 0, className, y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ------------------------------------------------------------------ controls

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = 'md',
  className,
}: {
  value: T
  options: { id: T; label: ReactNode }[]
  onChange: (v: T) => void
  label: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const id = useId()
  return (
    <div role='radiogroup' aria-label={label} className={cx('relative inline-flex rounded-[7px] border border-line bg-ink-950/60 p-0.5', className)}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type='button'
            role='radio'
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={cx(
              'relative z-10 whitespace-nowrap rounded-[5px] font-medium transition-colors duration-200',
              size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]',
              on ? 'text-fg' : 'text-muted hover:text-fg-2',
            )}
          >
            {on && <motion.span layoutId={`seg-${id}`} className='absolute inset-0 -z-10 rounded-[5px] bg-fg/[0.08] ring-1 ring-inset ring-white/[0.08]' transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Switch({ checked, onChange, label, tint = 'bg-batt' }: { checked: boolean; onChange: (v: boolean) => void; label: string; tint?: string }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors duration-200', checked ? `${tint} border-transparent` : 'border-line-strong bg-fg/[0.04]')}
    >
      <motion.span
        className={cx('absolute h-[16px] w-[16px] rounded-full', checked ? 'bg-ink-950' : 'bg-muted')}
        animate={{ x: checked ? 18 : 2 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
      />
    </button>
  )
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  tint = 'var(--color-brand)',
  valueText,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  label: string
  tint?: string
  valueText?: string
}) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <input
      type='range'
      className='range'
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      aria-valuetext={valueText}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ ['--fill' as string]: `${fill}%`, ['--tint' as string]: tint }}
    />
  )
}

/** Corner registration marks for technical panels. */
export function Corners({ className }: { className?: string }) {
  const m = 'absolute h-2.5 w-2.5 border-fg/25'
  return (
    <span aria-hidden className={cx('pointer-events-none absolute inset-0', className)}>
      <span className={cx(m, '-left-px -top-px border-l border-t')} />
      <span className={cx(m, '-right-px -top-px border-r border-t')} />
      <span className={cx(m, '-bottom-px -left-px border-b border-l')} />
      <span className={cx(m, '-bottom-px -right-px border-b border-r')} />
    </span>
  )
}
