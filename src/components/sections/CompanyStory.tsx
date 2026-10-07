'use client'

import Link from 'next/link'
import { COPY } from '@/content/company'
import { Reveal, SectionHeader } from '@/components/ui/primitives'

/** "Data is key" — the bridge between physical infrastructure and CARBONOZ software. */
export function DataIsKey({ compact }: { compact?: boolean }) {
  return (
    <section aria-labelledby='data-key-title' className='on-paper relative py-[clamp(80px,10vw,150px)]'>
      <div aria-hidden className='grid-bg-paper pointer-events-none absolute inset-0' />
      <div className='container-x relative grid gap-10 lg:grid-cols-12'>
        <div className='lg:col-span-4'>
          <p className='label text-paper-muted'>Physical infrastructure → software intelligence</p>
          <h2 id='data-key-title' className='display mt-6 text-[clamp(2.8rem,6vw,5.2rem)]'>
            Data is key.
          </h2>
        </div>
        <Reveal className='lg:col-span-8'>
          <p className='text-[clamp(1.15rem,1.8vw,1.55rem)] leading-[1.5] tracking-[-0.015em] text-paper-ink/90'>{compact ? COPY.dataIsKey.split('. ').slice(1, 3).join('. ') + '.' : COPY.dataIsKey}</p>
          {compact && (
            <Link href='/data-hub/' className='link-u mt-6 inline-block text-[15px] font-medium'>
              CARBONOZ Data Hub →
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  )
}

const REAL = ['Scalability', 'Accountability', 'Just transition', 'Public & private interests', 'Market mechanisms', 'De-risking', 'Co-investment', 'Crowd investment']
const IMPACT = ['Data-driven performance indicators', 'Voluntary & mandatory carbon markets', 'Philanthropic resources', 'Government & private-sector collaboration', 'De-risking fossil-free investment']

/** "Making it real" and "Impact now", from carbonoz.com. */
export function MakingItReal({ index }: { index?: string }) {
  return (
    <section id='impact' aria-labelledby='impact-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader index={index} kicker='Making it real' id='impact-title' title={<>Projects that stay effective — and fundable.</>} lede={COPY.makingItReal} />
        <ul className='mt-10 flex flex-wrap gap-2'>
          {REAL.map((r) => (
            <li key={r} className='rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] text-fg-2'>
              {r}
            </li>
          ))}
        </ul>
        <div className='mt-16 grid gap-10 border-t border-line pt-14 lg:grid-cols-12'>
          <div className='lg:col-span-4'>
            <p className='label text-brand'>Impact now</p>
            <h3 className='h3 mt-4 text-fg'>De-risking the clean energy transition.</h3>
          </div>
          <div className='grid gap-5 lg:col-span-8'>
            <p className='lede'>{COPY.impactNow}</p>
            <p className='text-[15px] leading-relaxed text-muted'>{COPY.impactNow2}</p>
            <ul className='grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2'>
              {IMPACT.map((x) => (
                <li key={x} className='bg-ink-950 px-4 py-3 text-[14px] text-fg-2'>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
