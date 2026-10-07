import Link from 'next/link'
import { SERVICES } from '@/content/services'
import { SectionHeader, StatusTag } from '@/components/ui/primitives'

/** CARBONOZ services, each grounded in the official copy and linked to where the site shows it. */
export function Services({ index }: { index?: string }) {
  return (
    <section id='services' aria-labelledby='services-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader index={index} kicker='Services' id='services-title' title={<>From the roof to the data room.</>} lede='What the CARBONOZ Group does — physical energy systems on one side, data and intelligence on the other.' aside={<div className='mt-5'><StatusTag status='verified' /></div>} />
        <ul className='mt-14 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-5'>
          {SERVICES.map((s, i) => (
            <li key={s.id} className='bg-ink-950'>
              <Link href={s.href} className='group flex h-full flex-col p-5 transition-colors hover:bg-ink-900'>
                <span className='num text-[11px] text-subtle'>{String(i + 1).padStart(2, '0')} · {i < 4 ? 'Energy systems' : 'Data & software'}</span>
                <span className='mt-3 text-[16px] font-medium tracking-[-0.015em] text-fg'>{s.name}</span>
                <span className='mt-2 text-[13px] leading-relaxed text-muted'>{s.line}</span>
                <span className='mt-auto pt-4 text-[12.5px] text-fg-2 transition-transform group-hover:translate-x-0.5'>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
