import { pageMeta } from '@/content/meta'
import { PageHero } from '@/components/sections/PageHero'
import { ProductStack } from '@/components/sections/ProductStack'
import { Ecosystem, Topology } from '@/components/sections/Hardware'
import { Storage } from '@/components/sections/Storage'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/hardware/', 'Energy hardware', 'Solar panels, hybrid inverters (Deye, Growatt, MPP, Generac), LIXI and CATL lithium batteries and BMS units — and how they connect to CARBONOZ through the SolarBMS gateway and Solar Assistant.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Hardware' }]} title='Hardware in, intelligence out.' lede='Panels, hybrid inverters, LIXI and CATL batteries and their BMS units at the site; a gateway that reads them; CARBONOZ turning their readings into one live model.' />
      <ProductStack index='01' />
      <Ecosystem index='02' />
      <Topology index='03' />
      <Storage index='04' />
      <Cta />
    </>
  )
}
