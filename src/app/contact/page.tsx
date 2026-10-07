import Link from 'next/link'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { pageMeta } from '@/content/meta'
import { LINKS } from '@/content/company'
import { GROUP } from '@/content/group'
import { COMPANY } from '@/content/site'
import { PageHero } from '@/components/sections/PageHero'
import { ContactForm } from '@/components/sections/ContactForm'

export const metadata = pageMeta('/contact/', 'Contact', 'Contact the CARBONOZ Group: Solaire Mauritius (mu-office@carbonoz.com, +230 70181147), CAYTECH Cayman Islands (support@caytech.biz, +1-345-928-7623) and HELIOS ENERGY in Germany.')

export default function Page() {
  return (
    <PageHero crumb={[{ label: 'Contact' }]} title='Talk to CARBONOZ.' lede='Reach the regional business closest to your site, or schedule a call. Existing customers can sign in to the platform directly.'>
      <div className='mt-14 grid gap-8 lg:grid-cols-12'>
        <div className='lg:col-span-7'>
          <ContactForm />
        </div>
        <aside className='grid content-start gap-4 lg:col-span-5'>
          {GROUP.map((e) => (
            <div key={e.region} className='panel p-6'>
              <p className='label text-[10px] text-brand'>{e.regionLabel}</p>
              <p className='mt-2 text-[16px] font-medium text-fg'>{e.brand}</p>
              <p className='text-[13px] text-muted'>
                {e.legalName} · {e.address.join(', ')}
              </p>
              <div className='mt-4 grid gap-1.5 text-[14px]'>
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
                    <MessageCircle size={15} className='text-muted' /> WhatsApp
                  </a>
                )}
                <a href={e.website} target='_blank' rel='noopener noreferrer' className='link-u w-fit text-fg-2'>
                  {e.websiteLabel} →
                </a>
              </div>
            </div>
          ))}
          <div className='panel p-6'>
            <p className='label text-[10px] text-muted'>Meet CARBONOZ</p>
            <a href={LINKS.calendly} target='_blank' rel='noopener noreferrer' className='link-u mt-3 inline-block text-[15px] text-fg'>
              Schedule a call →
            </a>
            <p className='mt-4 text-[14px] text-fg-2'>
              Customers:{' '}
              <a href={COMPANY.platformUrl} className='link-u text-fg'>
                login.carbonoz.com
              </a>{' '}
              ·{' '}
              <Link href='/demo/' className='link-u text-fg'>
                live demo
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </PageHero>
  )
}
