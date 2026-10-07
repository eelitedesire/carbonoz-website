'use client'

import { ArrowRight, Play, Zap } from 'lucide-react'
import Link from 'next/link'
import { ASSETS } from '@/content/assets'
import { LINKS } from '@/content/company'
import { COMPANY } from '@/content/site'
import { Live } from '@/components/ui/Live'
import { Phone3D } from '@/components/ui/Phone3D'
import { SimTag } from '@/components/ui/primitives'
import { PhoneScreen } from '@/components/app/PhoneScreen'
import { SimControls } from '@/components/viz/SimControls'

/** Group companies and brands shown under the hero buttons — real logos, verified links. */
const GROUP_LOGOS = [
  { name: 'CARBONOZ Group', href: '/group/', src: '/brand/carbonoz-mark.jpg', cover: true },
  { name: 'HELIOS ENERGY', href: LINKS.helios, src: `${ASSETS['logo-helios'].base}.webp` },
  { name: 'Solaire Mauritius', href: LINKS.solaire, src: null },
  { name: 'CAYTECH', href: LINKS.caytech, src: `${ASSETS['logo-caytech'].base}.webp` },
  { name: 'LIXI', href: LINKS.lixiBattery, src: `${ASSETS['logo-lixi'].base}.webp` },
]

export function Hero() {
  return (
    <section aria-labelledby='hero-title' className='relative overflow-hidden pb-16 pt-28 md:pt-32 lg:pb-24'>
      <div aria-hidden className='grid-bg fade-edges pointer-events-none absolute inset-0 opacity-60' />
      <Live className='container-x relative grid items-center gap-14 lg:grid-cols-12 lg:gap-8'>
        {/* copy */}
        <div className='lg:col-span-7'>
          <p className='rise inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/[0.07] px-3.5 py-1.5' style={{ animationDelay: '0s' }}>
            <Zap size={14} className='text-brand' aria-hidden />
            <span className='label text-[10.5px] text-brand'>CARBONOZ Group<span className='hidden sm:inline'> · Europe · Africa · Caribbean</span></span>
          </p>
          <h1 id='hero-title' className='rise display mt-7 text-[clamp(2.6rem,5.4vw,5.2rem)]' style={{ animationDelay: '0.06s' }}>
            Energy infrastructure, understood
            <span className='block w-fit bg-gradient-to-r from-[#e3b11b] via-[#e98a1f] to-[#16a34a] bg-clip-text pb-[0.08em] text-transparent'>in real time.</span>
          </h1>
          <p className='rise lede mt-7 max-w-[54ch]' style={{ animationDelay: '0.14s' }}>
            CARBONOZ designs, installs and controls hybrid AC/DC solar inverter systems with 48V, 200V and 400V battery storage — <strong className='font-semibold text-fg'>and its tools monitor and aggregate data on system performance</strong>, so owners and investors can make informed decisions every day.
          </p>
          <div className='rise mt-9 flex flex-wrap items-center gap-3' style={{ animationDelay: '0.2s' }}>
            <Link href='#system' className='group inline-flex h-14 items-center gap-2.5 rounded-[12px] bg-fg px-7 text-[16px] font-semibold text-ink-950 shadow-[0_14px_30px_-14px_rgb(11_14_19/0.6)] transition-transform hover:-translate-y-0.5'>
              See the system run
              <ArrowRight size={18} className='transition-transform group-hover:translate-x-0.5' />
            </Link>
            <Link href='/demo/' className='inline-flex h-14 items-center gap-2.5 rounded-[12px] border border-line-strong bg-ink-900 px-7 text-[16px] font-semibold text-fg transition-colors hover:border-fg/30'>
              <Play size={17} />
              Open live demo
            </Link>
          </div>
          <div className='rise mt-10 flex flex-wrap items-center gap-3' style={{ animationDelay: '0.28s' }}>
            <ul className='flex flex-wrap gap-3' aria-label='CARBONOZ Group companies and brands'>
              {GROUP_LOGOS.map((l) => {
                const ext = l.href.startsWith('http')
                return (
                  <li key={l.name}>
                    <a
                      href={l.href}
                      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      title={l.name}
                      aria-label={`${l.name}${ext ? ' (official website)' : ''}`}
                      className='grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_-8px_rgb(11_14_19/0.35)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5'
                    >
                      {l.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.src} alt='' width={56} height={56} className={l.cover ? 'h-full w-full object-cover' : 'max-h-9 w-auto max-w-[44px] object-contain'} />
                      ) : (
                        <span className='text-center text-[8px] font-bold leading-[1.15] tracking-[0.12em] text-[#0b0e13]'>
                          SOLAIRE
                          <span className='block text-[5.5px] tracking-[0.2em] text-[#5a6371]'>MAURITIUS</span>
                        </span>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
            <a href={COMPANY.platformUrl} className='link-u ml-2 text-[14px] text-muted hover:text-fg'>
              Customer sign in
            </a>
          </div>
        </div>

        {/* 3D phone running the live app */}
        <div className='rise relative lg:col-span-5' style={{ animationDelay: '0.1s' }}>
          <div aria-hidden className='pointer-events-none absolute left-[2%] top-[18%] h-[62%] w-[60%] rounded-full bg-[#e3b11b]/35 blur-[90px]' />
          <div aria-hidden className='pointer-events-none absolute right-[-6%] top-[30%] h-[60%] w-[55%] rounded-full bg-[#16a34a]/30 blur-[100px]' />
          <div aria-hidden className='pointer-events-none absolute left-[25%] top-[5%] h-[30%] w-[40%] rounded-full bg-[#7c3aed]/10 blur-[90px]' />
          <Phone3D className='relative mx-auto w-[min(290px,78vw)] sm:w-[300px] lg:w-[min(330px,100%)] xl:w-[340px]' label='CARBONOZ app running on a simulated demo site'>
            <PhoneScreen />
          </Phone3D>
          <div className='relative mx-auto mt-2 grid w-full max-w-[420px] gap-3'>
            <div className='flex items-center justify-between gap-3'>
              <SimTag>Interactive simulation</SimTag>
              <span className='text-[11.5px] text-muted'><span className='hidden sm:inline'>Tap the app · </span>Not customer data</span>
            </div>
            <SimControls compact minimal />
          </div>
        </div>
      </Live>
    </section>
  )
}
