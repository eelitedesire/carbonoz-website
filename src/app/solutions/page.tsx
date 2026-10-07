import { pageMeta } from '@/content/meta'
import { COPY } from '@/content/company'
import { PageHero } from '@/components/sections/PageHero'
import { Services } from '@/components/sections/Services'
import { SolarKits } from '@/components/sections/Group'
import { Lixi } from '@/components/sections/Lixi'
import { Repowering } from '@/components/sections/Repowering'
import { Storage } from '@/components/sections/Storage'
import { Sectors } from '@/components/sections/Sectors'
import { Cta } from '@/components/sections/Cta'

export const metadata = pageMeta('/solutions/', 'Solar & storage solutions', 'Hybrid AC/DC solar inverter systems with 48V, 200V and 400V LIXI battery storage, solar kits for Mauritius and the Cayman Islands, solar repowering and BESS integration in Europe.')

export default function Page() {
  return (
    <>
      <PageHero crumb={[{ label: 'Solutions' }]} title='Solar and storage, designed, installed and controlled.' lede={COPY.statement} status='verified' />
      <Services index='01' />
      <SolarKits index='02' />
      <Lixi index='03' compact />
      <Repowering index='04' />
      <Storage index='05' />
      <Sectors index='06' />
      <Cta />
    </>
  )
}
