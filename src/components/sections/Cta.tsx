import { COMPANY } from '@/content/site'
import { LINKS } from '@/content/company'
import { Button } from '@/components/ui/primitives'

export function Cta() {
  return (
    <section aria-labelledby='cta-title' className='relative overflow-hidden border-t border-line py-[clamp(110px,16vw,220px)]'>
      <div aria-hidden className='grid-bg fade-edges pointer-events-none absolute inset-0 opacity-60' />
      <div aria-hidden className='pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.07] blur-[120px]' />
      <div className='container-x relative text-center'>
        <p className='label text-muted'>
          <span className='text-brand'>CARBONOZ</span> · Talk to us
        </p>
        <h2 id='cta-title' className='display mx-auto mt-8 max-w-[18ch] text-[clamp(2.4rem,6vw,5.6rem)] text-balance'>
          Your energy system is already generating data.
        </h2>
        <p className='mx-auto mt-6 max-w-[40ch] text-[clamp(1.1rem,1.6vw,1.4rem)] text-fg-2'>CARBONOZ turns it into decisions.</p>
        <div className='mt-11 flex flex-wrap items-center justify-center gap-3'>
          <Button href='/contact/'>Talk to CARBONOZ</Button>
          <Button href={LINKS.calendly} external variant='secondary'>
            Schedule a call
          </Button>
          <Button href='/demo/' variant='ghost'>
            Open the live demo
          </Button>
        </div>
        <a href={COMPANY.platformUrl} className='link-u mt-8 inline-block text-[14px] text-muted hover:text-fg'>
          Already a customer? Sign in
        </a>
      </div>
    </section>
  )
}
