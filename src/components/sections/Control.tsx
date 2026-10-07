'use client'

import { ControlPanel } from '@/components/app/ControlPanel'
import { Live } from '@/components/ui/Live'
import { SectionHeader, StatusTag } from '@/components/ui/primitives'
import { ControlFlow } from '@/components/app/ControlFlow'

export function Control({ index = '12' }: { index?: string }) {
  return (
    <section id='control' aria-labelledby='ctl-title' className='relative border-t border-line py-[var(--section-y)]'>
      <div className='container-x'>
        <SectionHeader
          index={index}
          kicker='System control'
          id='ctl-title'
          title={<>Beyond monitoring: tell the system what to do.</>}
          lede='Battery mode, grid strategy, solar priority and peak shaving as explicit settings. Change one and the whole demo responds — the flows, the plan, the forecast and the event log.'
          aside={<div className='mt-5'><StatusTag status='concept' /></div>}
        />
        <Live className='homeos mt-14 grid gap-4 xl:grid-cols-12'>
          <div className='xl:col-span-9'>
            <ControlPanel />
          </div>
          <div className='hidden xl:col-span-3 xl:block'>
            <ControlFlow />
          </div>
        </Live>
        <p className='mt-5 max-w-[80ch] text-[12.5px] text-subtle'>
          Control is presented as a concept. These settings change the simulated demo site only; which controls CARBONOZ offers on real installations is to be confirmed.
        </p>
      </div>
    </section>
  )
}
