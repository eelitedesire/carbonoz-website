'use client'

import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ASSETS } from '@/content/assets'
import { GROUP, entity, RegionId } from '@/content/group'
import { SOLAR_KITS, SolarKit } from '@/content/products'
import { REGIONS } from '@/content/regions'
import { LINKS } from '@/content/company'
import { Photo } from '@/components/ui/Photo'
import { cx, Reveal, SectionHeader, StatusTag } from '@/components/ui/primitives'

// ------------------------------------------------------------------ regions overview

/** The group's regional businesses, each with its real installations. */
export function GroupRegions({ index = '10' }: { index?: string }) {
  const [sel, setSel] = useState<RegionId>('africa')
  return (
    <section id='group' aria-labelledby='group-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='CARBONOZ Group'
          id='group-title'
          title={<>One group in Europe, Africa and the Caribbean.</>}
          lede='Regional group businesses design and install hybrid solar and battery systems; CARBONOZ’s custom-tailored tools monitor and aggregate data on system performance.'
          aside={<div className='mt-5'><StatusTag status='verified' /></div>}
        />
        <div className='mt-14 grid gap-3 lg:grid-cols-3'>
          {REGIONS.map((r) => {
            const on = sel === r.id
            const e = entity(r.id)
            return (
              <Reveal key={r.id}>
                <article className={cx('group relative flex h-full flex-col overflow-hidden rounded-[12px] border transition-colors', on ? 'border-line-strong' : 'border-line')} onMouseEnter={() => setSel(r.id)}>
                  <Photo id={r.hero} aspect='4 / 3' className='rounded-none border-0' caption={`${r.name} · ${r.business}`} sizes='(min-width: 1024px) 33vw, 100vw' />
                  <div className='flex flex-1 flex-col bg-ink-900 p-5'>
                    <p className='label text-[10px] text-brand'>{e.legalName}</p>
                    <h3 className='mt-2 text-[20px] font-medium leading-snug tracking-[-0.025em] text-fg'>{r.headline}</h3>
                    <ul className='mt-4 flex flex-wrap gap-1.5'>
                      {r.focus.map((f) => (
                        <li key={f} className='rounded-full border border-line-strong px-2.5 py-1 text-[11.5px] text-fg-2'>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className='mt-auto flex items-center justify-between gap-3 pt-6 text-[14px]'>
                      <Link href={r.href} className='link-u text-fg'>
                        Explore {r.name} →
                      </Link>
                      <a href={r.site} target='_blank' rel='noopener noreferrer' className='flex items-center gap-1 text-[12.5px] text-muted hover:text-fg'>
                        {e.websiteLabel} <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ solar kits

export function KitCard({ k }: { k: SolarKit }) {
  const e = entity(k.region)
  return (
    <article className='grid overflow-hidden rounded-[12px] border border-line bg-ink-900 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
      <Photo id={k.image} className='min-h-[240px] rounded-none border-0' aspect='auto' caption={k.brand} sizes='(min-width: 768px) 40vw, 100vw' />
      <div className='flex flex-col p-5 sm:p-6'>
        <div className='flex flex-wrap items-baseline justify-between gap-3'>
          <p className='label text-[10px] text-brand'>{k.tier}</p>
          <p className='text-[12px] text-muted'>{e.regionLabel} · {k.brand}</p>
        </div>
        <h3 className='mt-2 text-[28px] font-medium tracking-[-0.035em] text-fg'>{k.name}</h3>
        <p className='mt-2 text-[14px] leading-relaxed text-fg-2'>{k.ideal}</p>
        <div className='mt-5 flex items-baseline gap-2 border-y border-line py-3'>
          <span className='label text-[10px] text-muted'>Total PV power</span>
          <span className='num ml-auto text-[22px] text-fg'>{k.pvPower}</span>
        </div>
        <ul className='mt-4 grid gap-2'>
          {k.config.map((c) => (
            <li key={c} className='flex gap-3 text-[13.5px] leading-snug text-fg-2'>
              <span aria-hidden className='mt-[8px] h-px w-3 shrink-0 bg-brand' />
              {c}
            </li>
          ))}
        </ul>
        <div className='mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-[12px] text-subtle'>
          <span>Configuration as published on {k.source}</span>
          {e.contact?.email && (
            <a href={`mailto:${e.contact.email}?subject=${encodeURIComponent(`Quote request — ${k.name}`)}`} className='rounded-[6px] bg-brand px-3.5 py-2 text-[13px] font-medium text-on-brand hover:bg-brand-hi'>
              Request quote
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export function SolarKits({ index, region, title, lede }: { index?: string; region?: RegionId; title?: string; lede?: string }) {
  const kits = SOLAR_KITS.filter((k) => !region || k.region === region)
  return (
    <section id='kits' aria-labelledby='kits-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='Solar kits'
          id='kits-title'
          title={<>{title ?? 'Hybrid solar systems, configured for the region.'}</>}
          lede={lede ?? 'Real kits offered by the group’s regional businesses — hybrid inverters, 450 W mono panels, lithium storage and Solar Assistant monitoring.'}
          aside={<div className='mt-5'><StatusTag status='verified' /></div>}
        />
        <div className='mt-14 grid gap-4 xl:grid-cols-2'>
          {kits.map((k) => (
            <KitCard key={k.id} k={k} />
          ))}
        </div>
        <p className='mt-5 text-[12.5px] text-subtle'>
          Monitoring in these kits uses{' '}
          <a href={LINKS.solarAssistant} target='_blank' rel='noopener noreferrer' className='link-u text-fg-2'>
            Solar Assistant
          </a>{' '}
          — private data stays on the owner’s own device. Quotations without an on-site visit are non-binding.
        </p>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ structure

export function GroupStructure({ index }: { index?: string }) {
  return (
    <section id='structure' aria-labelledby='structure-title' className='on-paper relative py-[var(--section-y)]'>
      <div aria-hidden className='grid-bg-paper pointer-events-none absolute inset-0' />
      <div className='container-x relative'>
        <SectionHeader index={index} kicker='CARBONOZ Group' id='structure-title' title={<>Renewable Energy Group for Europe, Africa and the Caribbean.</>} />
        <div className='mt-14 grid gap-px overflow-hidden rounded-[12px] border border-paper-line bg-paper-line md:grid-cols-3'>
          {GROUP.map((e) => (
            <div key={e.region} className='flex flex-col bg-paper p-6'>
              <div className='flex h-12 items-center justify-between'>
                <p className='label text-paper-muted'>{e.regionLabel}</p>
                {e.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${ASSETS[e.logo].base}.webp`} alt={ASSETS[e.logo].alt} height={40} width={Math.round((ASSETS[e.logo].w / ASSETS[e.logo].h) * 40)} className='h-10 w-auto rounded-md bg-white p-1' loading='lazy' />
                )}
              </div>
              <h3 className='mt-4 text-[20px] font-medium tracking-[-0.02em]'>{e.legalName}</h3>
              <p className='text-[13.5px] text-paper-muted'>Brand: {e.brand}</p>
              <address className='mt-4 text-[14px] not-italic leading-relaxed text-paper-ink/85'>
                {e.address.map((l) => (
                  <span key={l} className='block'>
                    {l}
                  </span>
                ))}
                {e.registration && <span className='mt-1 block text-paper-muted'>{e.registration}</span>}
              </address>
              <div className='mt-auto grid gap-1.5 pt-5 text-[13.5px]'>
                {e.contact?.email && (
                  <a href={`mailto:${e.contact.email}`} className='flex items-center gap-2 hover:underline'>
                    <Mail size={14} /> {e.contact.email}
                  </a>
                )}
                {e.contact?.phone && (
                  <a href={`tel:${e.contact.tel}`} className='flex items-center gap-2 hover:underline'>
                    <Phone size={14} /> {e.contact.phone}
                  </a>
                )}
                {e.contact?.whatsapp && (
                  <a href={e.contact.whatsapp} target='_blank' rel='noopener noreferrer' className='flex items-center gap-2 hover:underline'>
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                <a href={e.website} target='_blank' rel='noopener noreferrer' className='flex items-center gap-2 font-medium hover:underline'>
                  <ArrowUpRight size={14} /> {e.websiteLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
