'use client'

import { FormEvent, useState } from 'react'
import { CONTACTS, LINKS } from '@/content/company'
import { cx } from '@/components/ui/primitives'

const REGIONS = [
  { id: 'africa', label: 'Africa · Solaire Mauritius', email: CONTACTS.solaire.email },
  { id: 'caribbean', label: 'Caribbean · CAYTECH', email: CONTACTS.caytech.email },
  { id: 'europe', label: 'Europe · HELIOS ENERGY', email: null },
] as const

const TOPICS = ['Solar system', 'LIXI battery storage', 'Solar repowering & BESS', 'CARBONOZ Data Hub', 'SolarAutopilot / SolarBMS', 'Something else']

const field = 'h-11 w-full rounded-[6px] border border-line-strong bg-ink-950 px-3 text-[14.5px] text-fg placeholder:text-subtle focus:border-brand focus:outline-none'

/**
 * Contact form without a backend: it opens a pre-filled email to the regional
 * business (official addresses from company.ts). Europe has no published
 * address in the supplied material, so it offers HELIOS ENERGY and a call.
 */
export function ContactForm() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]['id']>('africa')
  const [topic, setTopic] = useState(TOPICS[0])
  const [sent, setSent] = useState(false)
  const r = REGIONS.find((x) => x.id === region)!

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!r.email) return
    const f = new FormData(e.currentTarget)
    const body = [`Name: ${f.get('name')}`, `Company: ${f.get('company')}`, `Email: ${f.get('email')}`, `Topic: ${topic}`, '', String(f.get('message') ?? '')].join('\n')
    window.location.href = `mailto:${r.email}?subject=${encodeURIComponent(`CARBONOZ — ${topic}`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <form onSubmit={submit} className='panel grid gap-5 p-6 sm:p-8' aria-describedby='form-note'>
      <fieldset>
        <legend className='mb-2 text-[13px] text-fg-2'>Region</legend>
        <div className='flex flex-wrap gap-2'>
          {REGIONS.map((x) => (
            <button key={x.id} type='button' aria-pressed={region === x.id} onClick={() => (setRegion(x.id), setSent(false))} className={cx('h-9 rounded-full border px-3.5 text-[13px] transition-colors', region === x.id ? 'border-brand bg-brand/10 text-fg' : 'border-line-strong text-muted hover:text-fg')}>
              {x.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className='grid gap-5 sm:grid-cols-2'>
        <label className='grid gap-1.5'>
          <span className='text-[13px] text-fg-2'>Name</span>
          <input name='name' required autoComplete='name' className={field} />
        </label>
        <label className='grid gap-1.5'>
          <span className='text-[13px] text-fg-2'>Company</span>
          <input name='company' autoComplete='organization' className={field} />
        </label>
      </div>
      <label className='grid gap-1.5'>
        <span className='text-[13px] text-fg-2'>Email</span>
        <input name='email' type='email' required autoComplete='email' className={field} />
      </label>
      <fieldset>
        <legend className='mb-2 text-[13px] text-fg-2'>Topic</legend>
        <div className='flex flex-wrap gap-2'>
          {TOPICS.map((t) => (
            <button key={t} type='button' aria-pressed={topic === t} onClick={() => setTopic(t)} className={cx('h-9 rounded-full border px-3.5 text-[13px] transition-colors', topic === t ? 'border-brand bg-brand/10 text-fg' : 'border-line-strong text-muted hover:text-fg')}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <label className='grid gap-1.5'>
        <span className='text-[13px] text-fg-2'>Your site or question</span>
        <textarea name='message' rows={5} className={cx(field, 'h-auto py-2.5')} placeholder='Location, roof or plant, batteries and inverters, what you want to achieve…' />
      </label>
      <div className='flex flex-wrap items-center gap-4'>
        {r.email ? (
          <button type='submit' className='h-11 rounded-[6px] bg-brand px-6 text-[14.5px] font-medium text-on-brand transition-colors hover:bg-brand-hi'>
            Send to {r.label.split(' · ')[1]}
          </button>
        ) : (
          <>
            <a href={LINKS.helios} target='_blank' rel='noopener noreferrer' className='flex h-11 items-center rounded-[6px] bg-brand px-6 text-[14.5px] font-medium text-on-brand hover:bg-brand-hi'>
              Contact HELIOS ENERGY
            </a>
            <a href={LINKS.calendly} target='_blank' rel='noopener noreferrer' className='flex h-11 items-center rounded-[6px] border border-line-strong px-5 text-[14.5px] text-fg'>
              Schedule a call
            </a>
          </>
        )}
        <p id='form-note' className='text-[12.5px] text-muted' role='status'>
          {sent ? 'Your email app should open with the message filled in.' : r.email ? `Opens an email to ${r.email}.` : 'HELIOS ENERGY handles European enquiries via heliosnrg.eu.'}
        </p>
      </div>
    </form>
  )
}
