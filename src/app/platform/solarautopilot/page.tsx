import { pageMeta } from '@/content/meta'
import { PageHero } from '@/components/sections/PageHero'
import { Autopilot } from '@/components/sections/Autopilot'
import { Intelligence } from '@/components/sections/Intelligence'
import { Control } from '@/components/sections/Control'
import { Forecast } from '@/components/sections/Forecast'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/platform/solarautopilot/', 'SolarAutopilot', 'SolarAutopilot: inverter automation and energy performance monitoring with customised alerts, Home Assistant / Solar Assistant integrations and many supported hybrid inverters and batteries.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Platform', href: '/platform/' }, { label: 'SolarAutopilot' }]} title='SolarAutopilot.' lede='Inverter automation and energy performance monitoring for homeowners and commercial operators — the first line of defence against overconsuming devices, drowning batteries and cloudy days.' status='verified' />
      <Autopilot index='01' initial='autopilot' />
      <Intelligence index='02' />
      <Forecast index='03' />
      <Control index='04' />
      <Cta />
    </>
  )
}
