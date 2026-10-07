'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'
import { COPY, LINKS } from '@/content/company'
import { LIXI_POINTS, LIXI_PRODUCTS } from '@/content/products'
import { Photo, Thumbs } from '@/components/ui/Photo'
import { Button, cx, SectionHeader, StatusTag } from '@/components/ui/primitives'

/**
 * LIXI battery solutions — real products and official specifications from
 * en.lixibattery.com. Low voltage (48 V) and high voltage (200 V, 400 V).
 */
export function Lixi({ index = '07', compact }: { index?: string; compact?: boolean }) {
  const [sel, setSel] = useState(LIXI_PRODUCTS[0].id)
  const p = LIXI_PRODUCTS.find((x) => x.id === sel)!
  return (
    <section id='lixi' aria-labelledby='lixi-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Solar & trading storage · LIXI'
          id='lixi-title'
          title={<>Low- and high-voltage LIXI battery solutions.</>}
          lede={compact ? COPY.solarStorageCta : COPY.solarStorage}
          aside={<div className='mt-5 flex flex-wrap items-center gap-3'><StatusTag status='verified' />{!compact && <span className='text-[12.5px] text-muted'>Available in the EU, Africa and the Caribbean</span>}</div>}
        />

        <div className='mt-14 flex flex-wrap gap-2' role='tablist' aria-label='LIXI system'>
          {LIXI_PRODUCTS.map((x) => (
            <button key={x.id} type='button' role='tab' aria-selected={sel === x.id} onClick={() => setSel(x.id)} className={cx('rounded-[10px] border px-4 py-3 text-left transition-colors', sel === x.id ? 'border-brand/60 bg-brand/[0.06]' : 'border-line hover:border-line-strong')}>
              <span className={cx('label block text-[9.5px]', sel === x.id ? 'text-brand' : 'text-subtle')}>{x.voltageClass}</span>
              <span className='mt-1 block text-[15px] font-medium text-fg'>{x.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode='wait'>
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className='mt-4 grid gap-4 lg:grid-cols-12'>
            <div className='lg:col-span-5'>
              <Photo id={p.image} aspect='4 / 5' fit='contain' caption={p.name} sizes='(min-width: 1024px) 40vw, 100vw' />
              <Thumbs ids={['lixi-48v-stack', 'lixi-catl-cells', 'lixi-hv-192v-rack', 'lixi-pro-rack']} className='mt-2' />
            </div>
            <div className='panel flex flex-col p-5 sm:p-6 lg:col-span-7'>
              <p className='label text-[10px] text-brand'>{p.voltageClass}</p>
              <h3 className='mt-2 text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-[-0.03em] text-fg'>{p.name}</h3>
              <p className='mt-3 max-w-[60ch] text-[15px] leading-relaxed text-fg-2'>{p.summary}</p>
              <dl className='mt-5 divide-y divide-line border-y border-line'>
                {p.specs.map((s) => (
                  <div key={s.label} className='grid grid-cols-[130px_1fr] gap-4 py-2.5 text-[13.5px] sm:grid-cols-[190px_1fr]'>
                    <dt className='text-muted'>{s.label}</dt>
                    <dd className='num text-fg'>{s.value}</dd>
                  </div>
                ))}
              </dl>
              {p.notes?.map((n) => (
                <p key={n} className='mt-3 text-[13px] leading-relaxed text-muted'>
                  {n}
                </p>
              ))}
              <p className='mt-auto pt-5 text-[11.5px] text-subtle'>
                Specifications:{' '}
                <a href={LINKS.lixiBattery} className='link-u text-fg-2' target='_blank' rel='noopener noreferrer'>
                  en.lixibattery.com
                </a>
                . Values not listed there are available on request.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {!compact && (
          <>
            <div className='mt-4 grid gap-4 lg:grid-cols-12'>
              <div className='lg:col-span-4'>
                <Photo id='lixi-catl-cells' aspect='4 / 5' caption='16 CATL LFP cells inside a LIXI pack' sizes='(min-width: 1024px) 33vw, 100vw' />
              </div>
              <div className='grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:col-span-8'>
                {LIXI_POINTS.map((x) => (
                  <div key={x.k} className='bg-ink-900 p-5'>
                    <p className='label text-[10px] text-brand'>{x.k}</p>
                    <p className='mt-2 text-[14px] leading-relaxed text-fg-2'>{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='panel mt-4 grid gap-4 p-5 sm:p-6 lg:grid-cols-12 lg:items-center'>
              <div className='lg:col-span-8'>
                <p className='label text-[10px] text-muted'>Battery → BMS → CARBONOZ</p>
                <p className='mt-2 text-[15px] leading-relaxed text-fg-2'>
                  Every LIXI system has its own BMS — a JK BMS on the 48 V stack, a BMU with active balancing on the high-voltage rack, master/slave on the Pro Rack — communicating over CAN or RS485. On the CARBONOZ platform, a SolarBMS gateway reads a site’s BMS units and sends their pack and cell data to CARBONOZ.
                </p>
              </div>
              <div className='flex flex-wrap gap-3 lg:col-span-4 lg:justify-end'>
                <Button href='/platform/solarbms/' variant='secondary'>
                  See cell monitoring
                </Button>
                <Button href={LINKS.lixiBattery} external variant='ghost'>
                  LIXI website
                </Button>
              </div>
            </div>
          </>
        )}
        {compact && (
          <div className='mt-6'>
            <Link href='/solutions/lixi/' className='link-u text-[15px] text-fg-2 hover:text-fg'>
              LIXI specifications, CATL cells and BMS →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
