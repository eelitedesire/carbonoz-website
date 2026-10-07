import { pageMeta } from '@/content/meta'
import { VERIFIED } from '@/content/site'
import { PageHero } from '@/components/sections/PageHero'
import { SystemAlive } from '@/components/sections/SystemAlive'
import { Autopilot } from '@/components/sections/Autopilot'
import { Monitoring } from '@/components/sections/Monitoring'
import { Topology } from '@/components/sections/Hardware'
import { Architecture } from '@/components/sections/Architecture'
import { DataHub } from '@/components/sections/DataHub'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/platform/', 'Platform', 'The CARBONOZ platform: customers, sites and SolarBMS installations with live energy flow, batteries, cells, inverters, history, forecast, events and alarms.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Platform' }]} title='One platform for every site you run.' lede='Customers, sites and installations; live energy flow, batteries down to the cell, inverters, history, forecast, events and alarms — in one model.' status='verified'>
        <ul className='mt-14 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3'>
          {VERIFIED.platform.map((f) => (
            <li key={f} className='bg-ink-950 p-5 text-[14px] leading-relaxed text-fg-2'>
              {f}
            </li>
          ))}
        </ul>
      </PageHero>
      <SystemAlive />
      <Autopilot index='02' />
      <Monitoring index='03' />
      <Topology index='04' />
      <DataHub index='05' />
      <Architecture index='06' />
      <Cta />
    </>
  )
}
