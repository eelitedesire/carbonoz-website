import Link from 'next/link'
import { COPY, LINKS } from '@/content/company'
import { GROUP } from '@/content/group'
import { COMPANY, NAV } from '@/content/site'
import { Logo } from './Logo'

export function Footer() {
  const year = 2026
  return (
    <footer className='border-t border-line bg-ink-950'>
      <div className='container-x grid gap-12 py-16 md:grid-cols-12'>
        <div className='md:col-span-4'>
          <Logo className='text-fg' />
          <p className='mt-5 max-w-[36ch] text-[14px] leading-relaxed text-muted'>{COPY.tagline}. Solar and battery systems, and the software that monitors and analyses them.</p>
          <div className='mt-6 grid gap-1.5 text-[14px]'>
            <a href={COMPANY.platformUrl} className='link-u w-fit text-fg-2'>
              Customer sign in — login.carbonoz.com
            </a>
            <a href={LINKS.calendly} target='_blank' rel='noopener noreferrer' className='link-u w-fit text-fg-2'>
              Schedule a call
            </a>
            <a href={LINKS.linkedin} target='_blank' rel='noopener noreferrer' className='link-u w-fit text-fg-2'>
              LinkedIn
            </a>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8'>
          {NAV.filter((n) => 'children' in n).map((n) => (
            <div key={n.label}>
              <p className='label mb-4 text-subtle'>{n.label}</p>
              <ul className='space-y-2.5'>
                {'children' in n &&
                  n.children.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className='link-u text-[14px] text-fg-2 hover:text-fg'>
                        {c.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <div>
            <p className='label mb-4 text-subtle'>Explore</p>
            <ul className='space-y-2.5'>
              {NAV.filter((n) => !('children' in n)).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className='link-u text-[14px] text-fg-2 hover:text-fg'>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className='container-x grid gap-8 border-t border-line py-10 sm:grid-cols-3'>
        {GROUP.map((e) => (
          <div key={e.region} className='text-[13px] leading-relaxed'>
            <p className='label mb-3 text-subtle'>{e.regionLabel}</p>
            <p className='text-fg-2'>
              {e.legalName} <span className='text-muted'>· {e.brand}</span>
            </p>
            <p className='text-muted'>{e.address.join(', ')}</p>
            {e.registration && <p className='text-muted'>{e.registration}</p>}
            <p className='mt-2 flex flex-wrap gap-x-3 gap-y-1'>
              {e.contact?.email && (
                <a href={`mailto:${e.contact.email}`} className='link-u text-fg-2'>
                  {e.contact.email}
                </a>
              )}
              {e.contact?.phone && (
                <a href={`tel:${e.contact.tel}`} className='link-u text-fg-2'>
                  {e.contact.phone}
                </a>
              )}
              <a href={e.website} target='_blank' rel='noopener noreferrer' className='link-u text-fg-2'>
                {e.websiteLabel}
              </a>
            </p>
          </div>
        ))}
      </div>

      <div className='container-x flex flex-col gap-3 border-t border-line py-6 text-[12.5px] text-subtle md:flex-row md:items-center md:justify-between'>
        <p>
          © {year} CARBONOZ — {COPY.tagline}
        </p>
        <p className='max-w-[70ch]'>Live values in the product demonstrations on this site come from a deterministic simulation of a demo site. They are not customer data. Product images: official CARBONOZ group and product websites.</p>
      </div>
    </footer>
  )
}
