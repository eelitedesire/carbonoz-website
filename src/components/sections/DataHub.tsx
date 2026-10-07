'use client'

import { AnimatePresence, motion } from 'motion/react'
import { BatteryCharging, Building2, Cpu, Database, Home, LayoutDashboard, Puzzle, Radio, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { COPY, HUB_FEATURES } from '@/content/company'
import { Live } from '@/components/ui/Live'
import { cx, Reveal, SectionHeader, StatusTag } from '@/components/ui/primitives'
import { FlowPath } from '@/components/viz/FlowPath'

const SOURCES = [
  { k: 'Residential hybrid inverters', icon: Home },
  { k: 'Commercial hybrid inverters', icon: Building2 },
  { k: 'Battery storage systems', icon: BatteryCharging },
  { k: 'Third-party solutions', icon: Puzzle },
]

const PIPE = [
  { k: 'Device', icon: Cpu },
  { k: 'Edge', icon: Radio },
  { k: 'CARBONOZ', icon: ShieldCheck },
  { k: 'Data', icon: Database },
  { k: 'Intelligence', icon: Database },
  { k: 'Dashboard', icon: LayoutDashboard },
]

const USES = ['Innovative financing models', 'Decentralised energy storage', 'Regulatory ESG reporting', 'Carbon tax filings', 'Investment research & ratings', 'Voluntary carbon markets']

/** CARBONOZ Data Hub — verified copy from carbonoz.com, connected to the platform's real data path. */
export function DataHub({ index = '05', full }: { index?: string; full?: boolean }) {
  const [sel, setSel] = useState<string>(HUB_FEATURES[0].id)
  const f = HUB_FEATURES.find((x) => x.id === sel)!
  return (
    <section id='data-hub' aria-labelledby='hub-title' className='relative overflow-hidden border-t border-line py-[var(--section-y)]'>
      <div aria-hidden className='pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(700px_320px_at_30%_0%,rgba(227,177,27,0.07),transparent)]' />
      <div className='container-x relative'>
        <SectionHeader
          index={index}
          kicker='CARBONOZ Data Hub'
          id='hub-title'
          title={<>Data-driven project insights, from verified real-time data.</>}
          lede={COPY.dataHub}
          aside={<div className='mt-5'><StatusTag status='verified' /></div>}
        />

        {/* sources → pipeline */}
        <Live className='mt-14 grid gap-4 lg:grid-cols-12'>
          <div className='panel p-5 sm:p-6 lg:col-span-5'>
            <p className='label text-[10px] text-muted'>Real-time project data from</p>
            <ul className='mt-4 grid grid-cols-2 gap-2'>
              {SOURCES.map((s) => {
                const Icon = s.icon
                return (
                  <li key={s.k} className='rounded-[8px] border border-line bg-ink-950 p-3'>
                    <Icon size={16} className='text-brand' />
                    <p className='mt-2 text-[13px] leading-snug text-fg'>{s.k}</p>
                  </li>
                )
              })}
            </ul>
            <p className='mt-5 text-[14px] leading-relaxed text-fg-2'>{COPY.dataHubSensors}</p>
          </div>
          <div className='panel flex flex-col p-5 sm:p-6 lg:col-span-7'>
            <p className='label text-[10px] text-muted'>The data path</p>
            <div className='relative mt-6'>
              <svg viewBox='0 0 600 40' className='absolute inset-x-0 top-[18px] hidden h-10 w-full text-fg sm:block' preserveAspectRatio='none' aria-hidden>
                <FlowPath d='M30,8 L570,8' power={1.6} color='var(--color-brand)' />
              </svg>
              <ol className='relative grid grid-cols-3 gap-4 sm:grid-cols-6'>
                {PIPE.map((p, i) => {
                  const Icon = i === 4 ? Database : p.icon
                  return (
                    <li key={p.k} className='flex flex-col items-center text-center'>
                      <span className={cx('grid h-12 w-12 place-items-center rounded-full border bg-ink-900', i >= 2 ? 'border-brand/50 text-brand' : 'border-line-strong text-fg')}>
                        <Icon size={18} strokeWidth={1.6} />
                      </span>
                      <span className='mt-2 text-[12.5px] font-medium text-fg'>{p.k}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
            <p className='mt-6 text-[14px] leading-relaxed text-fg-2'>{COPY.dataHubApplications}</p>
            <ul className='mt-4 flex flex-wrap gap-2'>
              {USES.map((u) => (
                <li key={u} className='rounded-full border border-line-strong px-3 py-1 text-[12px] text-fg-2'>
                  {u}
                </li>
              ))}
            </ul>
            <p className='mt-auto pt-5 text-[12px] text-subtle'>
              The platform’s real data path — SolarBMS gateway, authenticated ingestion, storage and dashboard — is documented on{' '}
              <Link href='/technology/' className='link-u text-fg-2'>
                Technology
              </Link>
              .
            </p>
          </div>
        </Live>

        {/* features */}
        <div id='features' className='mt-4 grid gap-4 lg:grid-cols-12'>
          <div className='grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:col-span-8' role='radiogroup' aria-label='Hub features'>
            {HUB_FEATURES.map((x, i) => (
              <button key={x.id} type='button' role='radio' aria-checked={sel === x.id} onClick={() => setSel(x.id)} onMouseEnter={() => setSel(x.id)} className={cx('flex items-start gap-4 bg-ink-900 p-5 text-left transition-colors', sel === x.id ? 'bg-ink-800' : 'hover:bg-ink-850')}>
                <span className={cx('num w-6 shrink-0 text-[12px]', sel === x.id ? 'text-brand' : 'text-subtle')}>{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className='block text-[15px] font-medium tracking-[-0.01em] text-fg'>{x.title}</span>
                  <span className='mt-1 block text-[13px] leading-relaxed text-muted'>{x.text}</span>
                </span>
              </button>
            ))}
          </div>
          <div className='lg:col-span-4'>
            <div className='panel sticky top-24 p-6'>
              <AnimatePresence mode='wait'>
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p className='label text-[10px] text-brand'>Hub feature</p>
                  <h3 className='mt-3 text-[22px] font-medium tracking-[-0.03em] text-fg'>{f.title}</h3>
                  <p className='mt-3 text-[15px] leading-relaxed text-fg-2'>{f.text}</p>
                  <Link href={f.demo.href} className='mt-6 flex items-center justify-between rounded-[8px] border border-line-strong px-4 py-3 text-[14px] text-fg transition-colors hover:border-fg/40'>
                    {f.demo.label}
                    <span>→</span>
                  </Link>
                  <p className='mt-3 text-[11.5px] leading-relaxed text-subtle'>Feature as described by CARBONOZ. The linked view shows the related part of the platform, running on simulated data.</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {full ? (
          <Reveal className='mt-16 grid gap-8 lg:grid-cols-12'>
            <p className='label text-muted lg:col-span-3'>Data is key</p>
            <p className='text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.5] tracking-[-0.015em] text-fg lg:col-span-9'>{COPY.dataIsKey}</p>
          </Reveal>
        ) : (
          <div className='mt-8'>
            <Link href='/data-hub/' className='link-u text-[15px] text-fg-2 hover:text-fg'>
              Explore the CARBONOZ Data Hub →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
