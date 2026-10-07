import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { ASSETS } from '@/content/assets'
import { LINKS } from '@/content/company'
import { entity, RegionId } from '@/content/group'
import { SOLAR_KITS } from '@/content/products'
import { region } from '@/content/regions'
import { Photo } from '@/components/ui/Photo'
import { Button, SectionHeader, StatusTag } from '@/components/ui/primitives'
import { KitCard } from './Group'
import { PageHero } from './PageHero'

const SOFTWARE = [
  { k: 'SolarBMS', v: 'Battery, BMS and cell monitoring', href: '/platform/solarbms/' },
  { k: 'SolarAutopilot', v: 'Inverter automation and alerts', href: '/platform/solarautopilot/' },
  { k: 'CARBONOZ Data Hub', v: 'Verified real-time project data', href: '/data-hub/' },
]

/** A regional CARBONOZ Group business: real installations, products, entity and contacts. */
export function RegionPage({ id }: { id: RegionId }) {
  const r = region(id)
  const e = entity(id)
  const kits = SOLAR_KITS.filter((k) => r.kits.includes(k.id))
  const [g0, ...gRest] = r.gallery
  return (
    <>
      <PageHero crumb={[{ label: 'CARBONOZ Group', href: '/group/' }, { label: r.name }]} title={r.headline} lede={`${e.legalName} · brand ${e.brand}. A member of the CARBONOZ Group.`} status='verified'>
        <div className='mt-14'>
          <Photo id={r.hero} aspect='21 / 9' priority caption={`${r.business} · ${r.name}`} sizes='100vw' />
        </div>
      </PageHero>

      <section aria-labelledby='region-about' className='border-t border-line py-[var(--section-y)]'>
        <div className='container-x grid gap-10 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <p className='label text-brand'>{r.business}</p>
            <h2 id='region-about' className='h2 mt-5 text-balance'>
              {r.name === 'Europe' ? 'Solar repowering & energy storage' : `Solar energy for ${r.name === 'Africa' ? 'Africa' : 'the Caribbean'}`}
            </h2>
            <p className='lede mt-6 max-w-[62ch]'>{r.copy}</p>
            {r.note && <p className='mt-4 max-w-[62ch] rounded-[8px] border border-line px-4 py-3 text-[13px] text-muted'>{r.note}</p>}
            <ul className='mt-8 flex flex-wrap gap-2'>
              {r.focus.map((f) => (
                <li key={f} className='rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] text-fg-2'>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <aside className='lg:col-span-5'>
            <div className='panel p-6'>
              <div className='flex items-center justify-between gap-3'>
                <p className='label text-[10px] text-muted'>{e.regionLabel}</p>
                {e.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${ASSETS[e.logo].base}.webp`} alt={ASSETS[e.logo].alt} height={40} width={Math.round((ASSETS[e.logo].w / ASSETS[e.logo].h) * 40)} className='h-10 w-auto rounded-md bg-white p-1' loading='lazy' />
                )}
              </div>
              <h3 className='mt-3 text-[20px] font-medium tracking-[-0.02em] text-fg'>{e.legalName}</h3>
              <p className='text-[13.5px] text-muted'>Brand: {e.brand}</p>
              <address className='mt-4 text-[14px] not-italic leading-relaxed text-fg-2'>
                {e.address.map((l) => (
                  <span key={l} className='block'>
                    {l}
                  </span>
                ))}
                {e.registration && <span className='mt-1 block text-muted'>{e.registration}</span>}
              </address>
              <div className='mt-5 grid gap-2 border-t border-line pt-5 text-[14px]'>
                {e.contact?.email && (
                  <a href={`mailto:${e.contact.email}`} className='flex items-center gap-2.5 text-fg hover:text-brand'>
                    <Mail size={15} className='text-muted' /> {e.contact.email}
                  </a>
                )}
                {e.contact?.phone && (
                  <a href={`tel:${e.contact.tel}`} className='flex items-center gap-2.5 text-fg hover:text-brand'>
                    <Phone size={15} className='text-muted' /> {e.contact.phone}
                  </a>
                )}
                {e.contact?.whatsapp && (
                  <a href={e.contact.whatsapp} target='_blank' rel='noopener noreferrer' className='flex items-center gap-2.5 text-fg hover:text-brand'>
                    <MessageCircle size={15} className='text-muted' /> WhatsApp {e.contact.phone}
                  </a>
                )}
              </div>
              <div className='mt-6 flex flex-wrap gap-3'>
                <Button href={r.site} external>
                  {e.websiteLabel}
                </Button>
                <Button href={LINKS.calendly} external variant='secondary'>
                  Schedule a call
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {g0 && (
        <section aria-label={`${r.name} installations and products`} className='border-t border-line py-[var(--section-y)]'>
          <div className='container-x'>
            <SectionHeader kicker='Real installations & products' title={<>On site, {r.name === 'Europe' ? 'in Europe' : r.name === 'Africa' ? 'in Mauritius' : 'in the Cayman Islands'}.</>} />
            <div className='mt-12 grid gap-3 md:grid-cols-12'>
              <Photo id={g0.asset} aspect='16 / 10' caption={g0.caption} className='md:col-span-8 md:row-span-2 md:h-full' sizes='(min-width: 768px) 66vw, 100vw' />
              {gRest.map((g, i) => {
                // Two beside the lead image; the rest share the bottom row evenly.
                const tail = gRest.length - 2
                const span = i < 2 ? 'md:col-span-4' : tail === 1 ? 'md:col-span-12' : tail === 2 ? 'md:col-span-6' : 'md:col-span-4'
                const product = g.asset.startsWith('lixi') || g.asset.includes('deye') || g.asset.includes('wiring')
                return <Photo key={g.asset} id={g.asset} aspect={i >= 2 && tail === 1 ? '21 / 8' : '16 / 10'} caption={g.caption} fit={product ? 'contain' : 'cover'} className={`${span} ${product ? 'bg-white' : ''}`} sizes='(min-width: 768px) 33vw, 100vw' />
              })}
            </div>
          </div>
        </section>
      )}

      {kits.length > 0 && (
        <section id='kits' aria-labelledby='region-kits' className='border-t border-line py-[var(--section-y)]'>
          <div className='container-x'>
            <SectionHeader id='region-kits' kicker='Solar kits' title={<>{r.business} solar kits.</>} lede='Configurations as published by the regional business.' aside={<div className='mt-5'><StatusTag status='verified' /></div>} />
            <div className='mt-12 grid gap-4 xl:grid-cols-2'>
              {kits.map((k) => (
                <KitCard key={k.id} k={k} />
              ))}
            </div>
            <p className='mt-5 text-[12.5px] text-subtle'>
              Monitoring:{' '}
              <a href={LINKS.solarAssistant} target='_blank' rel='noopener noreferrer' className='link-u text-fg-2'>
                Solar Assistant
              </a>{' '}
              — private data stays on the owner’s own device. Quotations without an on-site visit are non-binding.
            </p>
          </div>
        </section>
      )}

      <section aria-labelledby='region-software' className='border-t border-line py-[var(--section-y)]'>
        <div className='container-x grid gap-8 lg:grid-cols-12 lg:items-end'>
          <div className='lg:col-span-5'>
            <p className='label text-muted'>CARBONOZ technology</p>
            <h2 id='region-software' className='h3 mt-4 text-fg'>CARBONOZ tools for monitoring, data and automation.</h2>
          </div>
          <ul className='grid gap-2 sm:grid-cols-3 lg:col-span-7'>
            {SOFTWARE.map((s) => (
              <li key={s.k}>
                <Link href={s.href} className='panel group flex h-full flex-col p-5 transition-colors hover:border-line-strong'>
                  <span className='text-[15px] font-medium text-fg'>{s.k}</span>
                  <span className='mt-1 text-[13px] text-muted'>{s.v}</span>
                  <span className='mt-4 flex items-center gap-1 text-[12.5px] text-fg-2 group-hover:text-fg'>
                    Explore <ArrowUpRight size={13} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
