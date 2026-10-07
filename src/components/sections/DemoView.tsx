'use client'

import { AppFrame } from '@/components/app/AppFrame'
import { Live } from '@/components/ui/Live'
import { SimTag } from '@/components/ui/primitives'
import { SimControls } from '@/components/viz/SimControls'

/** Full-screen product demo for meetings: the app plus the simulation controls. */
export function DemoView() {
  return (
    <section aria-labelledby='demo-title' className='pb-10 pt-20 md:pt-24'>
      <div className='mx-auto w-full max-w-[1680px] px-3 sm:px-5'>
        <div className='mb-4 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 id='demo-title' className='text-[22px] font-medium tracking-[-0.03em]'>
              Live demo
            </h1>
            <p className='text-[13.5px] text-muted'>The CARBONOZ product interface on a simulated solar and storage site. Values are not customer data.</p>
          </div>
          <SimTag>Interactive simulation</SimTag>
        </div>
        <Live>
          <div className='grid gap-3'>
            <div className='panel px-4 py-3 sm:px-5'>
              <SimControls className='lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-10' />
            </div>
            <AppFrame tall />
          </div>
        </Live>
      </div>
    </section>
  )
}
