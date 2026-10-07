'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { AssetId } from '@/content/assets'
import { COPY } from '@/content/company'
import { Photo } from '@/components/ui/Photo'
import { cx, Reveal, SectionHeader, StatusTag } from '@/components/ui/primitives'

const STEPS: { id: string; k: string; v: string; photo: AssetId; caption: string; href: string }[] = [
  { id: 'design', k: 'Design', v: 'Hybrid AC/DC solar inverter systems sized to the site — with 48 V, 200 V or 400 V battery storage.', photo: 'solaire-mpp-wiring', caption: 'Hybrid inverter system design', href: '/solutions/' },
  { id: 'install', k: 'Install', v: 'Installation by the group’s regional businesses in Europe, Africa and the Caribbean.', photo: 'caytech-railing', caption: 'Rooftop installation, Cayman Islands', href: '/group/' },
  { id: 'monitor', k: 'Monitor', v: 'Batteries, BMS units and inverters report continuously — down to every cell voltage.', photo: 'lixi-48v-stack', caption: 'LIXI 48 V battery stack', href: '/platform/solarbms/' },
  { id: 'control', k: 'Control', v: 'Inverter automation and customised alerts with SolarAutopilot.', photo: 'solarautopilot-dashboard', caption: 'SolarAutopilot dashboard', href: '/platform/solarautopilot/' },
  { id: 'analyse', k: 'Analyse', v: 'Performance data aggregated in the CARBONOZ Data Hub for owners and investors.', photo: 'carbonoz-rooftop', caption: 'Commercial rooftop PV', href: '/data-hub/' },
]

/** The real business behind the platform: design → install → monitor → control → analyse. */
export function RealSystem({ index = '01' }: { index?: string }) {
  const [sel, setSel] = useState(0)
  const s = STEPS[sel]
  return (
    <section id='real-system' aria-labelledby='real-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='CARBONOZ Group'
          id='real-title'
          title={<>Real energy systems — designed, installed and controlled by CARBONOZ.</>}
          lede={COPY.statement}
          aside={<div className='mt-5'><StatusTag status='verified' /></div>}
        />

        <div className='mt-14 grid gap-4 lg:grid-cols-12'>
          <ol className='grid content-start gap-1.5 lg:col-span-5' aria-label='How CARBONOZ works'>
            {STEPS.map((x, i) => (
              <li key={x.id}>
                <button
                  type='button'
                  onClick={() => setSel(i)}
                  onMouseEnter={() => setSel(i)}
                  aria-pressed={sel === i}
                  className={cx('group flex w-full items-start gap-4 rounded-[10px] border px-4 py-3.5 text-left transition-colors', sel === i ? 'border-line-strong bg-fg/[0.04]' : 'border-transparent hover:bg-fg/[0.02]')}
                >
                  <span className={cx('num mt-0.5 w-7 shrink-0 text-[12px]', sel === i ? 'text-brand' : 'text-subtle')}>{String(i + 1).padStart(2, '0')}</span>
                  <span className='min-w-0'>
                    <span className='flex items-center gap-3 text-[18px] font-medium tracking-[-0.02em] text-fg'>
                      {x.k}
                      {i < STEPS.length - 1 && <span aria-hidden className={cx('h-px w-8 transition-colors', sel === i ? 'bg-brand' : 'bg-line-strong')} />}
                    </span>
                    <span className={cx('mt-1 block text-[14px] leading-relaxed transition-colors', sel === i ? 'text-fg-2' : 'text-muted')}>{x.v}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <Reveal className='lg:col-span-7'>
            <div className='relative'>
              <AnimatePresence mode='wait'>
                <motion.div key={s.id} initial={{ opacity: 0, scale: 1.01 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                  <Photo id={s.photo} aspect='16 / 11' caption={s.caption} fit={s.photo === 'lixi-48v-stack' || s.photo === 'solaire-mpp-wiring' ? 'contain' : 'cover'} className={s.photo === 'lixi-48v-stack' || s.photo === 'solaire-mpp-wiring' ? 'bg-white' : undefined} />
                </motion.div>
              </AnimatePresence>
              <a href={s.href} className='link-u mt-4 inline-block text-[14px] text-fg-2 hover:text-fg'>
                {s.k}: see how it works →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
