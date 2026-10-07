import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { ASSETS } from '@/content/assets'
import { COPY, LINKS } from '@/content/company'
import { cx } from '@/components/ui/cx'

interface Member {
  id: string
  name: string
  legal: string
  region: string
  role: string
  href: string
  external: boolean
  /** Real logo image; null → typographic wordmark of the company name (no official logo file available). */
  logo: { src: string; w: number; h: number; alt: string } | null
}

const logo = (id: 'logo-helios' | 'logo-caytech' | 'logo-lixi') => ({ src: `${ASSETS[id].base}.webp`, w: ASSETS[id].w, h: ASSETS[id].h, alt: ASSETS[id].alt })

/** Every URL here is a verified link from src/content/company.ts. */
const MEMBERS: Member[] = [
  { id: 'carbonoz', name: 'CARBONOZ', legal: 'CARBONOZ Group', region: 'Technology', role: 'Data Hub · SolarAutopilot · SolarBMS', href: '/group/', external: false, logo: { src: '/brand/carbonoz-mark.jpg', w: 128, h: 128, alt: 'CARBONOZ logo' } },
  { id: 'helios', name: 'HELIOS ENERGY', legal: 'Helios Academy GmbH', region: 'Europe', role: 'Solar repowering & energy storage', href: LINKS.helios, external: true, logo: logo('logo-helios') },
  { id: 'solaire', name: 'Solaire Mauritius', legal: 'buyAfraction Limited', region: 'Africa', role: 'Hybrid solar & CATL lithium storage', href: LINKS.solaire, external: true, logo: null },
  { id: 'caytech', name: 'CAYTECH', legal: 'Caytech Limited', region: 'Caribbean', role: 'On- & off-grid solar hybrid systems', href: LINKS.caytech, external: true, logo: logo('logo-caytech') },
  { id: 'lixi', name: 'LIXI', legal: 'Battery solutions', region: 'Storage', role: '48 V · 200 V · 400 V storage', href: LINKS.lixiBattery, external: true, logo: logo('logo-lixi') },
]

const RAIL = [
  { k: 'Europe', v: 'HELIOS ENERGY', href: '/group/europe/' },
  { k: 'Africa', v: 'Solaire Mauritius', href: '/group/africa/' },
  { k: 'Caribbean', v: 'CAYTECH', href: '/group/caribbean/' },
  { k: 'Technology', v: 'CARBONOZ platform', href: '/platform/' },
]

function Item({ m, hidden }: { m: Member; hidden?: boolean }) {
  const inner = (
    <>
      <span className='grid h-14 w-[88px] shrink-0 place-items-center overflow-hidden rounded-[8px] bg-white px-2 ring-1 ring-black/5'>
        {m.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.logo.src} alt={hidden ? '' : m.logo.alt} width={m.logo.w} height={m.logo.h} loading='lazy' className={cx('max-h-11 w-auto object-contain', m.id === 'carbonoz' && 'h-11 rounded-[6px]')} />
        ) : (
          <span className='text-center text-[10.5px] font-semibold leading-[1.1] tracking-[0.14em] text-[#0b0e13]'>
            SOLAIRE
            <span className='block text-[7.5px] tracking-[0.22em] text-[#5a6371]'>MAURITIUS</span>
          </span>
        )}
      </span>
      <span className='min-w-0'>
        <span className='label block text-[9.5px] text-brand'>{m.region}</span>
        <span className='mt-1 flex items-center gap-1.5 text-[16px] font-medium tracking-[-0.02em] text-fg'>
          {m.name}
          {m.external ? (
            <ArrowUpRight size={14} className='text-muted transition-transform duration-300 group-hover/m:-translate-y-0.5 group-hover/m:translate-x-0.5 group-hover/m:text-fg' aria-hidden />
          ) : (
            <ArrowRight size={14} className='text-muted transition-transform duration-300 group-hover/m:translate-x-0.5 group-hover/m:text-fg' aria-hidden />
          )}
        </span>
        <span className='block truncate text-[12.5px] text-muted'>{m.legal}</span>
        <span className='mt-0.5 block text-[12.5px] leading-snug text-fg-2'>{m.role}</span>
      </span>
    </>
  )
  const cls = 'group/m flex h-full w-[340px] shrink-0 items-center gap-4 rounded-[12px] border border-line bg-ink-900 px-4 py-4 transition-[border-color,background-color] duration-300 hover:border-line-strong hover:bg-ink-850 focus-visible:outline-2 focus-visible:outline-brand'
  const a11y = hidden ? { 'aria-hidden': true, tabIndex: -1 } : { 'aria-label': `${m.name} — ${m.region}, ${m.role}${m.external ? ' (opens official website)' : ''}` }
  return m.external ? (
    <a href={m.href} target='_blank' rel='noopener noreferrer' className={cls} {...a11y}>
      {inner}
    </a>
  ) : (
    <Link href={m.href} className={cls} {...a11y}>
      {inner}
    </Link>
  )
}

/**
 * CARBONOZ Group — the companies and brands of the group as a slow, seamless
 * marquee. Pauses on hover and focus; static under reduced motion.
 */
export function GroupMarquee() {
  // Each half of the track holds the members twice, so it is always wider than the viewport.
  const half = [...MEMBERS, ...MEMBERS]
  return (
    <section aria-labelledby='marquee-title' className='relative overflow-hidden border-t border-line py-[clamp(72px,9vw,128px)]'>
      <div className='container-x text-center'>
        <p className='label text-brand'>CARBONOZ Group</p>
        <h2 id='marquee-title' className='mx-auto mt-5 max-w-[22ch] text-[clamp(1.7rem,3.4vw,2.8rem)] font-medium leading-[1.08] tracking-[-0.035em] text-balance'>
          {COPY.tagline}
        </h2>
      </div>

      <div className='marquee relative mt-12' style={{ maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)' }}>
        {/* Spacing lives on each item (pr-3), not as a gap, so −50% lands exactly on the second half. */}
        <ul className='marquee-track flex w-max' aria-label='CARBONOZ Group companies and brands'>
          {half.map((m, i) => (
            <li key={`a${i}`} className={cx('pr-3', i >= MEMBERS.length && 'marquee-dup')}>
              <Item m={m} hidden={i >= MEMBERS.length} />
            </li>
          ))}
          {half.map((m, i) => (
            <li key={`b${i}`} className='marquee-dup pr-3' aria-hidden>
              <Item m={m} hidden />
            </li>
          ))}
        </ul>
      </div>

      <div className='container-x mt-12'>
        <ol className='relative grid grid-cols-2 gap-y-6 sm:grid-cols-4'>
          <span aria-hidden className='absolute left-[12.5%] right-[12.5%] top-[7px] hidden h-px bg-line-strong sm:block' />
          {RAIL.map((r) => (
            <li key={r.k} className='relative text-center'>
              <Link href={r.href} className='group inline-flex flex-col items-center'>
                <span className='relative z-10 h-[15px] w-[15px] rounded-full border-2 border-brand bg-ink-950 transition-transform group-hover:scale-125' />
                <span className='mt-3 text-[14px] font-medium text-fg'>{r.k}</span>
                <span className='text-[12.5px] text-muted group-hover:text-fg-2'>{r.v}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
