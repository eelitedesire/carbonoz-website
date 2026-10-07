'use client'

import { AnimatePresence, motion } from 'motion/react'
import { BatteryCharging, ClipboardCheck, Cpu, Gauge, LineChart, RefreshCcw, Sun, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { AssetId } from '@/content/assets'
import { COPY, LINKS } from '@/content/company'
import { Photo } from '@/components/ui/Photo'
import { useReducedMotion } from '@/components/ui/useReducedMotion'
import { Button, cx, SectionHeader, StatusTag } from '@/components/ui/primitives'

const STAGES: { k: string; v: string; icon: LucideIcon; photo: AssetId }[] = [
  { k: 'Existing PV plant', v: 'Solar plants lose efficiency and revenue potential over time.', icon: Sun, photo: 'carbonoz-pv-plant' },
  { k: 'Assessment', v: 'The plant, its inverters and its monitoring are reviewed against current technology.', icon: ClipboardCheck, photo: 'carbonoz-rooftop' },
  { k: 'Repowering', v: 'Turn-key solutions including finance and an optimised system design.', icon: RefreshCcw, photo: 'carbonoz-rooftop' },
  { k: 'Modern inverters', v: 'Upgrading inverters to current state-of-the-art technology.', icon: Cpu, photo: 'solaire-deye-inverter' },
  { k: 'Monitoring', v: 'Modernising monitoring so every part of the plant reports again.', icon: Gauge, photo: 'solarautopilot-dashboard' },
  { k: 'BESS', v: 'Integrating battery energy storage — for example a 112.5 kWh LIXI Pro Rack.', icon: BatteryCharging, photo: 'lixi-pro-rack' },
  { k: 'Energy optimisation', v: 'Energy trading, peak shaving, higher self-consumption and backup capability.', icon: LineChart, photo: 'carbonoz-pv-plant' },
]

const VALUE = ['Energy trading', 'Peak shaving', 'Higher self-consumption', 'Backup capability']

/** Solar repowering & energy storage (Europe · HELIOS ENERGY). */
export function Repowering({ index = '01' }: { index?: string }) {
  const [sel, setSel] = useState(0)
  const reduced = useReducedMotion()
  const s = STAGES[sel]
  return (
    <section id='repowering' aria-labelledby='repower-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader index={index} kicker='Solar repowering & energy storage' id='repower-title' title={<>From an ageing PV plant to a flexible energy system.</>} lede={COPY.europe} aside={<div className='mt-5'><StatusTag status='verified' /></div>} />

        <div className='mt-14 overflow-hidden rounded-[12px] border border-line bg-ink-900'>
          <ol className='scroll-x relative flex lg:grid lg:grid-cols-7' aria-label='Repowering stages'>
            {STAGES.map((x, i) => {
              const Icon = x.icon
              const on = sel === i
              return (
                <li key={x.k} className='min-w-[150px] border-r border-line last:border-0 lg:min-w-0'>
                  <button type='button' onClick={() => setSel(i)} onMouseEnter={() => setSel(i)} aria-pressed={on} className={cx('relative flex h-full w-full flex-col items-start gap-3 px-4 py-5 text-left transition-colors', on ? 'bg-ink-800' : 'hover:bg-ink-850')}>
                    {on && !reduced && <motion.span layoutId='repower-bar' className='absolute inset-x-0 top-0 h-[2px] bg-brand' />}
                    <span className='num text-[11px] text-subtle'>{String(i + 1).padStart(2, '0')}</span>
                    <Icon size={18} strokeWidth={1.6} className={on ? 'text-brand' : 'text-fg-2'} />
                    <span className='text-[13.5px] font-medium leading-snug text-fg'>{x.k}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
        <div className='mt-4 grid gap-4 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <AnimatePresence mode='wait'>
              <motion.div key={sel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Photo id={s.photo} aspect='16 / 10' fit={s.photo === 'lixi-pro-rack' || s.photo === 'solaire-deye-inverter' ? 'contain' : 'cover'} className={s.photo === 'lixi-pro-rack' || s.photo === 'solaire-deye-inverter' ? 'bg-white' : undefined} caption={s.k} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className='panel flex flex-col p-6 lg:col-span-5'>
            <p className='label text-[10px] text-brand'>Stage {String(sel + 1).padStart(2, '0')}</p>
            <h3 className='mt-3 text-[24px] font-medium tracking-[-0.03em] text-fg'>{s.k}</h3>
            <p className='mt-3 text-[15px] leading-relaxed text-fg-2'>{s.v}</p>
            <div id='bess' className='mt-6 border-t border-line pt-5'>
              <p className='label text-[10px] text-muted'>What BESS unlocks</p>
              <ul className='mt-3 grid grid-cols-2 gap-2'>
                {VALUE.map((v) => (
                  <li key={v} className='rounded-[8px] border border-line px-3 py-2.5 text-[13.5px] text-fg'>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <p className='mt-5 text-[13px] leading-relaxed text-muted'>Commercial PV installations that are no longer under subsidies can give their system a new economic purpose through electricity trading on the energy exchange.</p>
            <div className='mt-auto flex flex-wrap gap-3 pt-6'>
              <Button href={LINKS.helios} external>
                HELIOS ENERGY
              </Button>
              <Button href='/solutions/lixi/' variant='secondary'>
                LIXI Pro Rack
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
