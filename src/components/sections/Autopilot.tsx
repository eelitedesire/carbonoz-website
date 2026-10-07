'use client'

import { AppFrame, AppTab } from '@/components/app/AppFrame'
import { COPY, LINKS } from '@/content/company'
import { Live } from '@/components/ui/Live'
import { Photo } from '@/components/ui/Photo'
import { Button, Reveal, SectionHeader, SimTag, StatusTag } from '@/components/ui/primitives'

const POINTS = [
  { k: 'Automate', v: 'Inverter automation for homeowners and commercial operators — the first line of defence against overconsuming devices, drowning batteries and cloudy days.' },
  { k: 'Monitor', v: 'Energy performance monitoring, with customised alerts sent to any device.' },
  { k: 'Integrate', v: 'Home Assistant and Solar Assistant integrations, and many supported hybrid inverter models and batteries.' },
]

export function Autopilot({ index = '04', initial = 'overview' as AppTab }) {
  return (
    <section id='solarautopilot' aria-labelledby='autopilot-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='SolarAutopilot'
          id='autopilot-title'
          title={<>Inverter automation and energy performance monitoring.</>}
          lede={COPY.solarAutopilot}
          aside={
            <div className='mt-5 flex flex-wrap items-center gap-3'>
              <StatusTag status='verified' />
              <Button href={LINKS.solarAutopilot} external variant='ghost'>
                solarautopilot.com
              </Button>
            </div>
          }
        />
        <div className='mt-14 grid gap-4 lg:grid-cols-12'>
          <Reveal className='lg:col-span-7'>
            <Photo id='solarautopilot-dashboard' aspect='16 / 10' caption='SolarAutopilot — product screenshot' sizes='(min-width: 1024px) 58vw, 100vw' />
          </Reveal>
          <div className='grid gap-px overflow-hidden rounded-[10px] border border-line bg-line lg:col-span-5'>
            {POINTS.map((p, i) => (
              <div key={p.k} className='bg-ink-950 p-6'>
                <p className='label text-[10px] text-brand'>{String(i + 1).padStart(2, '0')} · {p.k}</p>
                <p className='mt-3 text-[15px] leading-relaxed text-fg-2'>{p.v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className='mt-16 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='label text-muted'>The CARBONOZ dashboard, running</p>
            <p className='mt-2 max-w-[62ch] text-[15px] leading-relaxed text-fg-2'>Sites, installations, energy flow, batteries, cells, inverters, history, forecast and events — on a simulated demo site. Click through it; change the strategy and watch the site respond.</p>
          </div>
          <div className='flex items-center gap-3'>
            <SimTag>Interactive simulation</SimTag>
            <Button href='/demo/' variant='ghost'>
              Open full screen
            </Button>
          </div>
        </div>
        <Reveal className='mt-6'>
          <Live>
            <AppFrame initial={initial} />
          </Live>
        </Reveal>
        <p className='mt-5 max-w-[80ch] text-[12.5px] leading-relaxed text-subtle'>
          Values in the dashboard are simulated. Monitoring, history, events and alarms reflect what the CARBONOZ platform does with SolarBMS data; the battery strategy and controls in this demo illustrate automation and are not a statement of SolarAutopilot’s production feature set — see solarautopilot.com for that.
        </p>
      </div>
    </section>
  )
}
