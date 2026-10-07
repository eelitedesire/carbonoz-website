'use client'

import { motion } from 'motion/react'
import { Activity, BarChart3, BatteryCharging, BrainCircuit, Cpu, Database, Gauge, Radio, Sun, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { AssetId } from '@/content/assets'
import { Photo } from '@/components/ui/Photo'
import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { cx, SectionHeader } from '@/components/ui/primitives'

const CHAIN: { k: string; sub: string; icon: LucideIcon; physical: boolean }[] = [
  { k: 'Solar panels', sub: '450 W mono', icon: Sun, physical: true },
  { k: 'Inverter', sub: 'Hybrid AC/DC', icon: Cpu, physical: true },
  { k: 'Battery', sub: 'LIXI · CATL', icon: BatteryCharging, physical: true },
  { k: 'BMS', sub: 'Pack & cells', icon: Gauge, physical: true },
  { k: 'Edge', sub: 'SolarBMS · Solar Assistant', icon: Radio, physical: true },
  { k: 'Data Hub', sub: 'Verified data', icon: Database, physical: false },
  { k: 'Monitoring', sub: 'Live & alarms', icon: Activity, physical: false },
  { k: 'Analytics', sub: 'Insights', icon: BarChart3, physical: false },
  { k: 'Intelligence', sub: 'Automation', icon: BrainCircuit, physical: false },
]

const PAIRS: { id: string; name: string; photo: AssetId; physical: string[]; software: { k: string; href: string }[] }[] = [
  { id: 'system', name: 'Solar system', photo: 'solaire-house', physical: ['Solar panels', 'Hybrid inverter', 'Lithium battery'], software: [{ k: 'Energy monitoring', href: '/platform/' }, { k: 'Performance analytics', href: '/data-hub/' }, { k: 'SolarAutopilot automation', href: '/platform/solarautopilot/' }] },
  { id: 'battery', name: 'Battery', photo: 'lixi-catl-cells', physical: ['LIXI LFP packs', 'CATL cells', 'JK / EHVS BMS'], software: [{ k: 'SolarBMS cell monitoring', href: '/platform/solarbms/' }, { k: 'SOC & health', href: '/platform/solarbms/#solarbms' }, { k: 'Alarms', href: '/platform/#monitoring' }] },
  { id: 'plant', name: 'Solar plant', photo: 'carbonoz-pv-plant', physical: ['PV plant', 'Modern inverters', 'BESS'], software: [{ k: 'Performance monitoring', href: '/platform/' }, { k: 'Repowering analytics', href: '/solutions/repowering/' }, { k: 'Forecasting', href: '/intelligence/#forecast' }] },
  { id: 'hub', name: 'Data Hub', photo: 'carbonoz-rooftop', physical: ['Soft- & hardware sensors', 'Hybrid inverters', 'BMS & gateway'], software: [{ k: 'Real-time data', href: '/data-hub/' }, { k: 'API access', href: '/technology/' }, { k: 'Predictive monitoring', href: '/data-hub/#features' }] },
]

/** Physical infrastructure → data → intelligence, with each real product's software counterpart. */
export function ProductStack({ index = '04' }: { index?: string }) {
  const reduced = useReducedMotion()
  const [pair, setPair] = useState(0)
  const p = PAIRS[pair]
  return (
    <section id='stack' aria-labelledby='stack-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Hardware to intelligence'
          id='stack-title'
          title={<>Every physical product has a software counterpart.</>}
          lede='This is what separates CARBONOZ from a solar installer: the panels, inverters and batteries the group designs and installs are matched with software that monitors, analyses and automates them.'
        />

        {/* chain */}
        <div className='relative mt-14 overflow-hidden rounded-[12px] border border-line bg-ink-900 p-5 sm:p-6'>
          <ol className='relative grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-9 lg:gap-2' aria-label='From hardware to intelligence'>
            <span aria-hidden className='absolute left-[8%] right-[8%] top-[27px] hidden h-px bg-line-strong lg:block' />
            {!reduced && (
              <motion.span aria-hidden className='absolute top-[24px] hidden h-[7px] w-[7px] rounded-full bg-brand shadow-[0_0_12px_var(--color-brand)] lg:block' animate={{ left: ['8%', '92%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
            )}
            {CHAIN.map((c, i) => {
              const Icon = c.icon
              return (
                <li key={c.k} className='relative flex items-center gap-3 lg:flex-col lg:text-center'>
                  <span className={cx('relative z-10 grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full border bg-ink-900', c.physical ? 'border-line-strong text-fg' : 'border-brand/50 text-brand')}>
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className='block text-[13.5px] font-medium text-fg'>{c.k}</span>
                    <span className='block text-[11.5px] text-muted'>{c.sub}</span>
                  </span>
                  {i === 4 && <span aria-hidden className='label absolute -bottom-4 left-1/2 hidden -translate-x-1/2 text-[8.5px] text-subtle lg:block'>edge</span>}
                </li>
              )
            })}
          </ol>
          <div className='mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-[12px] text-muted'>
            <span className='flex items-center gap-2'><i className='h-2.5 w-2.5 rounded-full border border-line-strong' /> Physical infrastructure</span>
            <span className='flex items-center gap-2'><i className='h-2.5 w-2.5 rounded-full border border-brand/60' /> CARBONOZ software</span>
          </div>
        </div>

        {/* pairs */}
        <div className='mt-4 grid gap-4 lg:grid-cols-12'>
          <div className='grid content-start gap-1.5 lg:col-span-4' role='radiogroup' aria-label='Product'>
            {PAIRS.map((x, i) => (
              <button key={x.id} type='button' role='radio' aria-checked={pair === i} onClick={() => setPair(i)} className={cx('flex items-center justify-between rounded-[10px] border px-4 py-3.5 text-left transition-colors', pair === i ? 'border-line-strong bg-fg/[0.04]' : 'border-line hover:border-line-strong')}>
                <span className='text-[16px] font-medium tracking-[-0.01em] text-fg'>{x.name}</span>
                <span className='num text-[11px] text-subtle'>{String(i + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:col-span-8'>
            <div>
              <Photo id={p.photo} aspect='4 / 3' caption={`${p.name} · physical`} />
              <ul className='mt-3 grid gap-1.5'>
                {p.physical.map((x) => (
                  <li key={x} className='flex items-center gap-2 text-[14px] text-fg-2'>
                    <i className='h-1.5 w-1.5 rounded-full bg-fg/40' /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className='panel flex flex-col p-5'>
              <p className='label text-[10px] text-brand'>Software</p>
              <ul className='mt-4 grid gap-2'>
                {p.software.map((x) => (
                  <li key={x.k}>
                    <Link href={x.href} className='group flex items-center justify-between rounded-[8px] border border-line px-3.5 py-3 text-[14px] text-fg transition-colors hover:border-line-strong'>
                      {x.k}
                      <span className='text-muted transition-transform group-hover:translate-x-0.5'>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className='mt-auto pt-4 text-[12px] leading-relaxed text-subtle'>Live values in the linked demos are simulated; the products and software are CARBONOZ’s own.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
