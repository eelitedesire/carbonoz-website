import { pageMeta } from '@/content/meta'
import { PageHero } from '@/components/sections/PageHero'
import { SolarBMS } from '@/components/sections/SolarBMS'
import { Ecosystem, Topology } from '@/components/sections/Hardware'
import { IngestionContract } from '@/components/sections/IngestionContract'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/platform/solarbms/', 'SolarBMS', 'SolarBMS battery monitoring on the CARBONOZ platform: pack state of charge, voltage, current, temperatures, BMS alarms and every cell voltage, sent by a Raspberry Pi gateway.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Platform', href: '/platform/' }, { label: 'SolarBMS' }]} title='Battery monitoring that goes down to the cell.' lede='A SolarBMS gateway at the site reads every BMS and sends pack and cell data to CARBONOZ — voltages, temperatures, balancing, alarms — so problems show up as a drifting cell, not a failed battery.' status='verified' />
      <SolarBMS index='01' />
      <Ecosystem index='02' />
      <Topology index='03' />
      <IngestionContract />
      <Cta />
    </>
  )
}
