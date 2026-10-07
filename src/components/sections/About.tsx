import Link from 'next/link'
import { COPY, LINKS } from '@/content/company'
import { PRODUCTS, VERIFIED } from '@/content/site'
import { Button, Reveal, SectionHeader, StatusTag } from '@/components/ui/primitives'

/** The CARBONOZ Group and its offerings. Only verified content (src/content). */
export function About({ index = '15', full }: { index?: string; full?: boolean }) {
  return (
    <section id='about' aria-labelledby='about-title' className='on-paper relative py-[var(--section-y)]'>
      <div aria-hidden className='grid-bg-paper pointer-events-none absolute inset-0' />
      <div className='container-x relative'>
        <SectionHeader
          index={index}
          kicker={COPY.tagline}
          id='about-title'
          title={<>A renewable-energy technology group — infrastructure, data and intelligence in one.</>}
          lede={full ? COPY.statement : 'Solar systems, LIXI battery storage and solar repowering on one side; SolarBMS, SolarAutopilot and the CARBONOZ Data Hub on the other.'}
        />

        <div className='mt-16 grid gap-px overflow-hidden rounded-[12px] border border-paper-line bg-paper-line md:grid-cols-2 lg:grid-cols-3'>
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04} className='bg-paper'>
              <Link href={p.href} className='group block h-full p-6 transition-colors hover:bg-paper-2'>
                <div className='flex items-center justify-between gap-3'>
                  <h3 className='text-[18px] font-medium tracking-[-0.02em]'>{p.name}</h3>
                  <StatusTag status={p.status} />
                </div>
                <p className='mt-3 text-[14.5px] leading-relaxed text-paper-muted'>{p.line}</p>
                <span className='mt-5 inline-block text-[13px] text-paper-ink/70 transition-colors group-hover:text-paper-ink'>Read more →</span>
              </Link>
            </Reveal>
          ))}
        </div>

        {full && (
          <div className='mt-16 grid gap-10 lg:grid-cols-2'>
            <div>
              <p className='label text-paper-muted'>What the CARBONOZ platform does today</p>
              <ul className='mt-5 grid gap-3'>
                {[...VERIFIED.platform, VERIFIED.redex].map((f) => (
                  <li key={f} className='flex gap-3 text-[15px] leading-relaxed text-paper-ink/85'>
                    <span aria-hidden className='mt-[11px] h-px w-3 shrink-0 bg-brand' />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/brand/carbonoz-logo.jpg' alt='CARBONOZ logo' width={800} height={800} loading='lazy' className='mb-8 w-40 rounded-2xl shadow-[0_12px_32px_-12px_rgb(11_14_19/0.35)] ring-1 ring-paper-line' />
              <p className='label text-paper-muted'>CARBONOZ</p>
              <dl className='mt-5 divide-y divide-paper-line border-y border-paper-line'>
                {[
                  ['Group', COPY.tagline],
                  ['Website', 'carbonoz.com', LINKS.carbonoz],
                  ['Customer platform', 'login.carbonoz.com', LINKS.platform],
                  ['LinkedIn', 'linkedin.com/company/carbonoz', LINKS.linkedin],
                ].map(([k, v, href]) => (
                  <div key={k} className='flex justify-between gap-6 py-3 text-[14.5px]'>
                    <dt className='text-paper-muted'>{k}</dt>
                    <dd className='text-right'>{href ? <a className='link-u' href={href} target='_blank' rel='noopener noreferrer'>{v}</a> : v}</dd>
                  </div>
                ))}
              </dl>
              <div className='mt-8 flex flex-wrap gap-3'>
                <Button href='/contact/'>Talk to CARBONOZ</Button>
                <Button href='/group/' variant='secondary'>
                  CARBONOZ Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
